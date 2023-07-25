import EditProjectTab from "@/components/project/tabs/EditProjectTab.tsx";
import useProject from "@/hooks/useProject.ts";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { fileToDataUrl } from "@/utils/files.ts";
import { useStoredImage } from "@/hooks/useStoredImage.ts";
import { storeImage } from "@/data/imageStorage.ts";

function useCurrentProject() {
  return useProject(useParams().projectId);
}

export default function EditProjectSettingsTab() {
  return (
    <EditProjectTab title={"Settings"}>
      <div className={"flex flex-col gap-4 -mt-4"}>
        <SetProjectName />
        <EmbedSvgNativelyCheckbox />
        <SetBackgroundColor />
        <SetAnimationDuration />
        <SelectAnimationType />
        <ReplaceImage />
      </div>
    </EditProjectTab>
  );
}

function SetProjectName() {
  const { project, update } = useCurrentProject();
  if (!project) return <>Project not found</>;
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text text-sm">Project name</span>
      </label>
      <input
        value={project.name}
        onInput={(e) => {
          update({ name: e.currentTarget.value });
        }}
        type="text"
        className={"input input-bordered w-full"}
        placeholder={"Enter project name"}
        required
      />
    </div>
  );
}

function EmbedSvgNativelyCheckbox() {
  const { project, update } = useCurrentProject();
  if (!project) return <>Project not found</>;

  return (
    <label className="label cursor-pointer">
      <input
        type="checkbox"
        checked={project.embedSvgNatively}
        onChange={(e) => {
          update({ embedSvgNatively: e.currentTarget.checked });
        }}
        className="checkbox mr-2"
      />
      <span className="label-text">
        Enable native SVG embed (use with care)
      </span>
    </label>
  );
}

function SetBackgroundColor() {
  const { project, update } = useCurrentProject();
  if (!project) return <>Project not found</>;

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text text-sm">Background color</span>
      </label>
      <input
        type="color"
        value={project.backgroundColor}
        onInput={(e) => {
          update({
            backgroundColor: e.currentTarget.value,
          });
        }}
        className={"input input-bordered w-full"}
        required
      />
    </div>
  );
}

function SetAnimationDuration() {
  const { project, update } = useCurrentProject();
  if (!project) return <>Project not found</>;

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text text-sm">Animation duration (ms)</span>
      </label>
      <input
        value={project.animationDuration}
        onInput={(e) => {
          update({
            animationDuration: parseInt(e.currentTarget.value),
          });
        }}
        type="number"
        className={"input input-bordered w-full"}
        placeholder={"Enter animation duration (ms)"}
        required
      />
    </div>
  );
}

function SelectAnimationType() {
  const { project, update } = useCurrentProject();
  if (!project) return <>Project not found</>;

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text text-sm">Animation type</span>
      </label>
      <select
        className="select select-bordered w-full max-w-xs"
        value={project.animationType}
        onChange={(e) => {
          update({
            animationType: e.currentTarget.value === "ease" ? "ease" : "linear",
          });
        }}
      >
        <option value={"ease"}>Ease</option>
        <option value={"linear"}>Linear</option>
      </select>
    </div>
  );
}

function ReplaceImage() {
  const { project, update } = useCurrentProject();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const storedImage = useStoredImage(project?.image.storageId);

  useEffect(() => {
    if (!!error || success) {
      const timeout = setTimeout(() => {
        setError(null);
        setSuccess(false);
      }, 2500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [error, success]);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (
        !storedImage.loading &&
        storedImage.dataUrl &&
        e.currentTarget.files &&
        e.currentTarget.files.length > 0
      ) {
        const newFile = e.currentTarget.files[0];
        setLoading(true);

        void fileToDataUrl(newFile)
          .then(async (newImageDataUrl) => {
            if (!storedImage.dataUrl) return;

            setLoading(true);
            setError(null);

            const newImage = new Image();
            newImage.src = newImageDataUrl;

            const currentImage = new Image();
            currentImage.src = storedImage.dataUrl;

            void Promise.all([newImage.decode(), currentImage.decode()]).then(
              () => {
                const newAspectRatio =
                  newImage.naturalWidth / newImage.naturalHeight;
                const currentAspectRatio =
                  currentImage.naturalWidth / currentImage.naturalHeight;

                const aspectRatioDifference = Math.abs(
                  newAspectRatio - currentAspectRatio,
                );

                if (aspectRatioDifference < 0.015) {
                  void storeImage(newImageDataUrl).then((newStoredImage) => {
                    update({
                      image: {
                        fileName: newFile.name,
                        mimeType: newFile.type,
                        storageId: newStoredImage.id,
                      },
                    });
                    setSuccess(true);
                  });
                } else {
                  setError(
                    `Aspect ratio of new image was too off (${aspectRatioDifference}).`,
                  );
                }
              },
            );
          })
          .catch((err) => {
            console.error(err);
            setError(
              "An error occurred while analyzing the current and/or the new image.",
            );
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [storedImage, update],
  );

  if (!project) return <>Project not found</>;
  if (storedImage.loading) return <>Loading image...</>;
  if (!storedImage.dataUrl) return <>Image data could not be found</>;

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text text-sm">
          Replace image (same aspect ratio required)
        </span>
      </label>
      {(!!error || success) && (
        <label className="label">
          {!!error && (
            <span className="label-text-alt text-red-500">{error}</span>
          )}
          {success && (
            <span className="label-text-alt text-green-500">
              Image successfully replaced.
            </span>
          )}
        </label>
      )}
      <input
        disabled={loading}
        onChange={onFileChange}
        type="file"
        className="file-input file-input-neutral file-input-bordered w-full max-w-md"
        accept="image/*"
      />
    </div>
  );
}
