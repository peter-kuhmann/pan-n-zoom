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
  const [enableMaxHeight, setEnableMaxHeight] = useState(false);
  const [maxHeight, setMaxHeight] = useState<number>(600);
  const [useInlinedExport, setUseInlinedExport] = useState(false);

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

  const base64Export = useMemo<string>(() => {
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
    }${
      enableMaxHeight ? ` data-canvas-max-height="${maxHeight}px"` : ""
    } data-export="${
      useInlinedExport ? base64Export : "REPLACE_WITH_LINK_TO_YOUR_EXPORT"
    }"></pan-n-zoom-present>
<script src="${location.origin}/embed.js"></script>`;
  }, [
    project,
    base64Export,
    aspectRatio,
    rounded,
    enableMaxHeight,
    maxHeight,
    useInlinedExport,
  ]);

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
    <EditProjectTab title={"Embed Export"} bigger>
      {!project ? (
        <>Error: Project not found</>
      ) : project.keyframes.length === 0 ? (
        <>You first need to create keyframes to copy to HTML embed code.</>
      ) : (
        <>
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text text-sm">Aspect ratio</span>
            </label>
            <select
              className="select select-sm select-bordered w-full"
              value={aspectRatio}
              onChange={(e) => {
                setAspectRatio(e.currentTarget.value as AspectRatio);
              }}
            >
              <option>16/9</option>
              <option>16/10</option>
              <option>4/3</option>
            </select>
          </div>

          <label className="label cursor-pointer justify-start">
            <input
              type="checkbox"
              checked={enableMaxHeight}
              onChange={(e) => {
                setEnableMaxHeight(e.currentTarget.checked);
              }}
              className="checkbox mr-2"
            />
            <span className="label-text">Use (max) height</span>
          </label>

          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text text-sm">(Max) Height in px</span>
            </label>
            <input
              disabled={!enableMaxHeight}
              value={maxHeight}
              onInput={(e) => {
                setMaxHeight(
                  e.currentTarget.value.length === 0
                    ? 0
                    : parseInt(e.currentTarget.value),
                );
              }}
              type="number"
              className={"input input-sm input-bordered w-full"}
            />
          </div>

          <label className="label cursor-pointer justify-start mb-4">
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

          <label className="label cursor-pointer justify-start mb-4">
            <input
              type="checkbox"
              checked={useInlinedExport}
              onChange={(e) => {
                setUseInlinedExport(e.currentTarget.checked);
              }}
              className="checkbox mr-2"
            />
            <span className="label-text">Use inlined Pan'n'Zoom export</span>
          </label>

          <hr className={"mb-4"} />

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">
                Embed the project using the following code
              </span>
            </label>
            <textarea
              ref={textareaRef}
              value={htmlCode}
              className="textarea textarea-bordered h-[6rem] font-mono text-xs"
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
