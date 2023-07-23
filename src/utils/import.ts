import { type DataExport, type DataExportProject } from "@/types/export.ts";
import { DataExportFileSuffix } from "@/utils/export.ts";
import { fileToUTF8String } from "@/utils/files.ts";
import { DataExportSchema } from "@/validation/export.ts";
import { type Project, type ProjectKeyframe } from "@/types/project.ts";
import { createId } from "@paralleldrive/cuid2";
import { getSuite, updateSuite } from "@/data/suite.ts";
import { deleteStoredImage, storeImage } from "@/data/imageStorage.ts";
import { type Suite } from "@/types/suite.ts";

export type DecodeImportFileResult =
  | { success: false; error: string }
  | {
      success: true;
      dataExport: DataExport;
    };

export async function readDataExportFile(
  file: File,
): Promise<DecodeImportFileResult> {
  if (!file.name.endsWith(DataExportFileSuffix)) {
    return {
      success: false,
      error: `The file "${file.name}" has an incorrect file suffix. Expected suffix "${DataExportFileSuffix}".`,
    };
  }

  try {
    const rawDataExportContent = await fileToUTF8String(file);

    try {
      const rawDataExportJson = JSON.parse(rawDataExportContent);
      const dataExportValidationResult =
        DataExportSchema.safeParse(rawDataExportJson);

      if (!dataExportValidationResult.success) {
        return {
          success: false,
          error: `Data export JSON was malformed: ${dataExportValidationResult.error.message}`,
        };
      } else {
        return { success: true, dataExport: dataExportValidationResult.data };
      }
    } catch (e) {
      console.error(e);
      return {
        success: false,
        error: "Data export was probably invalid JSON.",
      };
    }
  } catch (e: any) {
    console.error(e);
    return {
      success: false,
      error: `An error occurred while decoding the data export: ${e}`,
    };
  }
}

export type ImportDataExportProjectsImportStrategy =
  | "add"
  | "replace"
  | "ignore";

export type ImportDataExportNewProjectDefaultSettingsStrategy =
  | "replace"
  | "ignore";

export interface ImportDataExportConfig {
  projectsImportStrategy: ImportDataExportProjectsImportStrategy;
  newProjectDefaultSettingsStrategy: ImportDataExportNewProjectDefaultSettingsStrategy;
}

export async function importDataExport(
  dataExport: DataExport,
  {
    projectsImportStrategy,
    newProjectDefaultSettingsStrategy,
  }: ImportDataExportConfig,
) {
  const oldSuite = getSuite();
  const newSuite: Suite = { ...oldSuite };

  // Handle projects and images
  if (projectsImportStrategy === "replace") {
    // delete existing projects from suite
    const oldImagesToDelete = oldSuite.projects.map(
      (project) => project.image.storageId,
    );

    newSuite.projects = [];

    // We also need to delete the stored images
    await Promise.all(
      oldImagesToDelete.map(async (storageId) => {
        await deleteStoredImage(storageId);
      }),
    );
  }

  if (projectsImportStrategy !== "ignore") {
    await importProjectsFromDataExport(dataExport.projects, newSuite);
  }

  // Handle suite settings
  if (
    dataExport.type === "suite-export" &&
    newProjectDefaultSettingsStrategy === "replace"
  ) {
    newSuite.newProjectDefaultSettings = dataExport.newProjectDefaultSettings;
  }

  updateSuite(newSuite);
}

async function importProjectsFromDataExport(
  dataExportProjects: DataExportProject[],
  suite: Suite,
) {
  const newProjects: Project[] = [];

  // Now we import the projects + images one by one (and assign new IDs for the projects and images)
  for (const dataExportProject of dataExportProjects) {
    const newStoredImage = await storeImage(dataExportProject.imageDataUrl);

    newProjects.push({
      ...dataExportProject.project,
      id: createId(),
      image: {
        ...dataExportProject.project.image,
        storageId: newStoredImage.id,
      },
      keyframes: dataExportProject.project.keyframes.map((keyframeToImport) => {
        const newKeyframe: ProjectKeyframe = {
          ...keyframeToImport,
          id: createId(),
        };

        return newKeyframe;
      }),
      createdAt: new Date().toISOString(),
    });
  }

  suite.projects.push(...newProjects);
}
