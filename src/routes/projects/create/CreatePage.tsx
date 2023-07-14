import * as classNames from "classnames";
import { useCallback, useState } from "react";
import { fileToBase64 } from "@/utils/files.ts";
import useSuite from "@/hooks/useSuite.ts";
import { storeImage } from "@/data/imageStorage.ts";
import { createId } from "@paralleldrive/cuid2";
import { useNavigate } from "react-router-dom";

export default function CreatePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { suite, update } = useSuite();
  const navigate = useNavigate();

  const createProjectHandler = useCallback(() => {
    if (!selectedFile) return;

    setIsLoading(true);

    fileToBase64(selectedFile)
      .then(async (dataUrl) => {
        return await storeImage(dataUrl);
      })
      .then((storedImage) => {
        const newProjectId = createId();

        update({
          projects: [
            ...suite.projects,
            {
              id: newProjectId,
              name: `Project ${suite.projects.length + 1}`,
              image: { storageId: storedImage.id },
              keyframes: [],
            },
          ],
        });

        navigate(`/projects/${newProjectId}`);
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedFile, suite, navigate, update]);

  const creationDisabled = !selectedFile || isLoading;

  return (
    <div className={"p-16 h-full flex flex-col items-center justify-center"}>
      <h1 className={"font-bold text-4xl text-center mb-16"}>
        Create a project
      </h1>

      <input
        type="file"
        className="file-input file-input-bordered w-full max-w-xs mb-8"
        accept="image/*"
        onChange={(e) => {
          if (e.currentTarget.files && e.currentTarget.files.length > 0) {
            setSelectedFile(e.currentTarget.files[0]);
          } else {
            setSelectedFile(null);
          }
        }}
      />

      <button
        disabled={creationDisabled}
        className={classNames("btn", {
          "btn-disabled": creationDisabled,
          "btn-loading": isLoading,
        })}
        onClick={createProjectHandler}
      >
        Create new project ➡️
      </button>
    </div>
  );
}
