import EditProjectTab from "@/components/project/tabs/EditProjectTab.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useProject from "@/hooks/useProject.ts";
import { useParams } from "react-router-dom";
import { encode } from "js-base64";
import { useStoredImage } from "@/hooks/useStoredImage.ts";
import classNames from "classnames";

type AspectRatio = "16/9" | "16/10" | "4/3";

export default function EditProjectEmbedTab() {
  const { project } = useProject(useParams().projectId);
  const storedImage = useStoredImage(project?.image.storageId);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16/10");
  const [rounded, setRounded] = useState(true);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 1500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [copied]);

  const embedConfig = useMemo<string>(() => {
    if (
      !project ||
      project.keyframes.length === 0 ||
      storedImage.loading ||
      !storedImage.dataUrl
    )
      return "";
    return encode(
      JSON.stringify({ project, imageDataUrl: storedImage.dataUrl }),
    );
  }, [project, storedImage]);

  const htmlCode = useMemo<string>(() => {
    if (!project || project.keyframes.length === 0) return "";

    return `<pan-n-zoom-present data-canvas-aspect-ratio="${aspectRatio}"${
      rounded ? ` data-rounded="8px"` : ""
    } data-config="${embedConfig}"></pan-n-zoom-present>
<script src="${location.origin}/embed.js"></script>`;
  }, [project, embedConfig, aspectRatio, rounded]);

  const copyToClipboard = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.select();
      textarea.setSelectionRange(0, 9999999999);
    }

    void navigator.clipboard.writeText(htmlCode).then(() => {
      setCopied(true);
    });
  }, [htmlCode]);

  return (
    <EditProjectTab title={"Embed"} bigger>
      {!project ? (
        <>Error: Project not found</>
      ) : project.keyframes.length === 0 ? (
        <>You first need to create keyframes to copy to HTML embed code.</>
      ) : (
        <>
          <select
            className="select select-bordered w-full mb-8"
            value={aspectRatio}
            onChange={(e) => {
              setAspectRatio(e.currentTarget.value as AspectRatio);
            }}
          >
            <option>16/9</option>
            <option>16/10</option>
            <option>4/3</option>
          </select>

          <label className="label cursor-pointer justify-start mb-8">
            <input
              type="checkbox"
              checked={rounded}
              onChange={(e) => {
                setRounded(e.currentTarget.checked);
              }}
              className="checkbox mr-2"
            />
            <span className="label-text">Rounded project viewer</span>
          </label>

          <hr className={"mb-8"} />

          <div className="form-control mb-8">
            <label className="label">
              <span className="label-text">
                Embed the project using the following code
              </span>
            </label>
            <textarea
              ref={textareaRef}
              value={htmlCode}
              className="textarea textarea-bordered h-[10rem] font-mono text-xs"
            />
          </div>

          <button
            className={classNames("btn btn-sm", {
              "btn-neutral": !copied,
              "btn-success": copied,
            })}
            onClick={copyToClipboard}
          >
            Copy HTML code{" "}
            {copied ? (
              <IonIcon name={"checkmark-outline"} />
            ) : (
              <IonIcon name={"copy-outline"} />
            )}
          </button>
        </>
      )}
    </EditProjectTab>
  );
}
