import * as classNames from "classnames";
import { useCallback, useRef, useState } from "react";
import { fileToBase64 } from "@/utils/files.ts";
import useSuite from "@/hooks/useSuite.ts";
import { storeImage } from "@/data/imageStorage.ts";
import { createId } from "@paralleldrive/cuid2";
import { useNavigate } from "react-router-dom";
import AppPage from "@/components/AppPage.tsx";
import {
  getProjectEditorLink,
  getProjectListLink,
} from "@/navigation/links.ts";
import IonIcon from "@/components/IonIcon.tsx";
import { type Project } from "@/types/project.ts";

export default function CreatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { suite, addProject } = useSuite();

  const navigate = useNavigate();
  const defaultProjectName = `New Project #${suite.projects.length + 2}`;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projectName, setProjectName] = useState<string>(defaultProjectName);
  const [enableNativeSvgEmbed, setEnableNativeSvgEmbed] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileDataUrl, setSelectedFileDataUrl] = useState<string | null>(
    null,
  );

  const createProjectHandler = useCallback(() => {
    if (!selectedFile || !selectedFileDataUrl) return;

    setIsLoading(true);

    storeImage(selectedFileDataUrl)
      .then((storedImage) => {
        const nowIso = new Date().toISOString();

        const newProject: Project = {
          id: createId(),
          name: projectName,
          image: {
            embedSvgNatively: enableNativeSvgEmbed,
            fileName: selectedFile.name,
            mimeType: selectedFile.type,
            storageId: storedImage.id,
          },
          keyframes: [],
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        addProject(newProject);
        navigate(getProjectEditorLink(newProject.id));
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    projectName,
    selectedFile,
    selectedFileDataUrl,
    navigate,
    addProject,
    enableNativeSvgEmbed,
  ]);

  const creationDisabled =
    !selectedFile ||
    !selectedFileDataUrl ||
    projectName.length === 0 ||
    isLoading;

  return (
    <AppPage
      title={"Create project"}
      backTo={{ label: "Back to project", to: getProjectListLink() }}
    >
      <div className={"grid grid-cols-3 gap-24 items-start"}>
        <div className={"rounded-lg border border-gray-300 overflow-hidden"}>
          <div className={"w-full max-w-[20rem]"}>
            {selectedFileDataUrl ? (
              <img
                className={"bg-gray-50 w-full aspect-square object-contain"}
                src={selectedFileDataUrl}
              />
            ) : (
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className={
                  "w-full text-4xl min-h-[10rem] btn btn-ghost btn-lg inline-block"
                }
              >
                <IonIcon name={"image-outline"} />
              </button>
            )}
          </div>
        </div>

        <div className={"col-span-2 flex flex-col items-start gap-8"}>
          <input
            value={projectName}
            onInput={(e) => {
              setProjectName(e.currentTarget.value);
            }}
            type="text"
            className={"input input-bordered w-full max-w-md"}
            placeholder={"Project name"}
            required
          />

          <input
            ref={fileInputRef}
            type="file"
            className="file-input file-input-neutral file-input-bordered w-full max-w-md"
            accept="image/*"
            onChange={(e) => {
              if (e.currentTarget.files && e.currentTarget.files.length > 0) {
                const file = e.currentTarget.files[0];
                setSelectedFile(file);
                void fileToBase64(file).then(setSelectedFileDataUrl);
              } else {
                setSelectedFile(null);
              }
            }}
          />

          <label className="label cursor-pointer">
            <input
              type="checkbox"
              checked={enableNativeSvgEmbed}
              onChange={(e) => {
                setEnableNativeSvgEmbed(e.currentTarget.checked);
              }}
              className="checkbox mr-2"
            />
            <span className="label-text">
              Enable native SVG embed (use with care)
            </span>
          </label>

          <button
            disabled={creationDisabled}
            className={classNames("btn btn-neutral", {
              "btn-disabled": creationDisabled,
              "btn-loading": isLoading,
            })}
            onClick={createProjectHandler}
          >
            Create new project ➡️
          </button>
        </div>
      </div>
    </AppPage>
  );
}
