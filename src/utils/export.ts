import { type Project } from "@/types/project.ts";
import { type DataExport, type DataExportProject } from "@/types/export.ts";
import { getStoredImage } from "@/data/imageStorage.ts";
import { DataExportSchema } from "@/validation/export.ts";
import format from "date-fns/format";

export const DataExportFileSuffix = ".pannzoom";

export async function prepareProjectForDataExport(
  project: Project,
): Promise<DataExportProject> {
  const imageDataUrl = await getStoredImage(project.image.storageId);

  if (!imageDataUrl) {
    throw new Error(
      `Could not find image for project "${project.name}" (id = ${project.id})`,
    );
  }

  return {
    project: {
      version: project.version,
      name: project.name,
      backgroundColor: project.backgroundColor,
      embedSvgNatively: project.embedSvgNatively,
      animationType: project.animationType,
      animationDuration: project.animationDuration,
      image: {
        fileName: project.image.fileName,
        mimeType: project.image.mimeType,
      },
      keyframes: project.keyframes.map((projectKeyframe) => ({
        emoji: projectKeyframe.emoji,
        x: projectKeyframe.x,
        y: projectKeyframe.y,
        width: projectKeyframe.width,
        height: projectKeyframe.height,
      })),
    },
    imageDataUrl,
  };
}

export function validateAndParseRawDataExport(rawDataExport: DataExport) {
  const validationResult = DataExportSchema.safeParse(rawDataExport);

  if (!validationResult.success) {
    throw new Error(
      `Constructed data export is invalid: ${validationResult.error.message}`,
    );
  }

  return validationResult.data;
}

export function downloadDataExport(dataExport: DataExport, name: string) {
  const downloadElement = document.createElement("a");

  downloadElement.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," +
      encodeURIComponent(JSON.stringify(dataExport, null, 4)),
  );

  downloadElement.setAttribute("download", name + DataExportFileSuffix);

  downloadElement.style.display = "none";
  document.body.appendChild(downloadElement);
  downloadElement.click();
  document.body.removeChild(downloadElement);
}

export function formatNowForDataExportFilename(): string {
  return format(new Date(), "yyyy-MM-dd HH-mm-ss");
}
