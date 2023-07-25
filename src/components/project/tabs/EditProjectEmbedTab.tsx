import EditProjectTab from "@/components/project/tabs/EditProjectTab.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useProject from "@/hooks/useProject.ts";
import { useParams } from "react-router-dom";
import { encode } from "js-base64";
import { useStoredImage } from "@/hooks/useStoredImage.ts";
import classNames from "classnames";

type AspectRatio = "16/9" | "16/10" | "4/3" | "1/1";
type Theme = "system" | "light" | "dark";

export default function EditProjectEmbedTab() {
  const { project } = useProject(useParams().projectId);
  const storedImage = useStoredImage(project?.image.storageId);

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16/9");
  const [theme, setTheme] = useState<Theme>("system");

  const [rounded, setRounded] = useState(true);
  const [useInlinedExport, setUseInlinedExport] = useState(false);

  const [enableMaxHeight, setEnableMaxHeight] = useState(false);
  const [maxHeight, setMaxHeight] = useState<number>(600);

  const [enableLoop, setEnableLoop] = useState(false);
  const [enableAutoplay, setEnableAutoplay] = useState(false);
  const [autoplayDelay, setAutoplayDelay] = useState<number>(2000);

  const [useStarterProject, setUseStarterProject] = useState(false);
  const [hideTitle, setHideTitle] = useState(false);
  const [hideBranding, setHideBranding] = useState(false);

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

    const attributes: Array<{ name: string; value: string }> = [];

    attributes.push({ name: "data-theme", value: theme });
    attributes.push({ name: "data-rounded", value: rounded ? "8px" : "0px" });
    attributes.push({ name: "data-canvas-aspect-ratio", value: aspectRatio });

    if (enableMaxHeight) {
      attributes.push({
        name: "data-canvas-max-height",
        value: `${maxHeight}px`,
      });
    }

    if (enableLoop) {
      attributes.push({
        name: "data-loop",
        value: "true",
      });
    }

    if (enableAutoplay) {
      attributes.push({
        name: "data-autoplay",
        value: "true",
      });

      attributes.push({
        name: "data-autoplay-delay",
        value: `${autoplayDelay}`,
      });
    }

    if (hideTitle) {
      attributes.push({
        name: "data-hide-title",
        value: "true",
      });
    }

    if (hideBranding) {
      attributes.push({
        name: "data-hide-branding",
        value: "true",
      });
    }

    if (useStarterProject) {
      attributes.push({
        name: "data-export-url",
        value: `${location.origin}/cross-origin/StarterProject.pannzoom`,
      });
    } else if (useInlinedExport) {
      attributes.push({
        name: "data-export-inlined",
        value: base64Export,
      });
    } else {
      attributes.push({
        name: "data-export-url",
        value: "REPLACE_WITH_LINK_TO_YOUR_EXPORT",
      });
    }

    const attributesString = attributes
      .map((attribute) => `${attribute.name}="${attribute.value}"`)
      .join(" ");

    return `<pan-n-zoom-present ${attributesString}></pan-n-zoom-present>\n<script src="${location.origin}/cross-origin/embed.js"></script>`;
  }, [
    useStarterProject,
    project,
    base64Export,
    aspectRatio,
    rounded,
    enableMaxHeight,
    maxHeight,
    useInlinedExport,
    theme,
    enableLoop,
    enableAutoplay,
    autoplayDelay,
    hideTitle,
    hideBranding,
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
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">
                Embed the project using the following code
              </span>
            </label>
            <textarea
              readOnly
              ref={textareaRef}
              value={htmlCode}
              className="textarea textarea-bordered h-[6rem] font-mono text-xs"
            />
          </div>

          <button
            className={classNames("btn btn-sm mb-4", {
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

          <hr className={"mb-4"} />

          <div className="form-control w-full mb-1">
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
              <option value="16/9">16/9</option>
              <option value="16/10">16/10</option>
              <option value="4/3">4/3</option>
              <option value="1/1">1/1</option>
            </select>
          </div>

          <div className="form-control w-full mb-3">
            <label className="label">
              <span className="label-text text-sm">Appearance</span>
            </label>
            <select
              className="select select-sm select-bordered w-full"
              value={theme}
              onChange={(e) => {
                setTheme(e.currentTarget.value as Theme);
              }}
            >
              <option value={"system"}>Automatic based on system</option>
              <option value={"light"}>Light mode</option>
              <option value={"dark"}>Dark mode</option>
            </select>
          </div>

          <label className="label cursor-pointer justify-start">
            <input
              type="checkbox"
              checked={rounded}
              onChange={(e) => {
                setRounded(e.currentTarget.checked);
              }}
              className="checkbox checkbox-sm mr-2"
            />
            <span className="label-text">Rounded project viewer</span>
          </label>

          <label className="label cursor-pointer justify-start">
            <input
              type="checkbox"
              checked={enableMaxHeight}
              onChange={(e) => {
                setEnableMaxHeight(e.currentTarget.checked);
              }}
              className="checkbox checkbox-sm mr-2"
            />
            <span className="label-text">Use (max) height</span>
          </label>

          {enableMaxHeight && (
            <div className="form-control w-full mb-2 pl-8">
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
          )}

          <label className="label cursor-pointer justify-start">
            <input
              type="checkbox"
              checked={useInlinedExport}
              onChange={(e) => {
                setUseInlinedExport(e.currentTarget.checked);
              }}
              className="checkbox checkbox-sm mr-2"
            />
            <span className="label-text">Use inlined Pan'n'Zoom export</span>
          </label>

          <label className="label cursor-pointer justify-start">
            <input
              type="checkbox"
              checked={enableLoop}
              onChange={(e) => {
                setEnableLoop(e.currentTarget.checked);
              }}
              className="checkbox checkbox-sm mr-2"
            />
            <span className="label-text">Enable loop mode</span>
          </label>

          <div>
            <label className="label cursor-pointer justify-start">
              <input
                type="checkbox"
                checked={enableAutoplay}
                onChange={(e) => {
                  setEnableAutoplay(e.currentTarget.checked);
                }}
                className="checkbox checkbox-sm mr-2"
              />
              <span className="label-text">Autoplay</span>
            </label>

            {enableAutoplay && (
              <div className="form-control w-full mb-2 pl-8">
                <label className="label">
                  <span className="label-text text-sm">
                    Autoplay delay (ms)
                  </span>
                </label>
                <input
                  disabled={!enableAutoplay}
                  value={autoplayDelay}
                  onInput={(e) => {
                    setAutoplayDelay(
                      e.currentTarget.value.length === 0
                        ? 0
                        : parseInt(e.currentTarget.value),
                    );
                  }}
                  type="number"
                  className={"input input-sm input-bordered w-full"}
                />
              </div>
            )}
          </div>

          <label className="label cursor-pointer justify-start">
            <input
              type="checkbox"
              checked={useStarterProject}
              onChange={(e) => {
                setUseStarterProject(e.currentTarget.checked);
              }}
              className="checkbox checkbox-sm mr-2"
            />
            <span className="label-text">Use "Starter Project" example</span>
          </label>

          <label className="label cursor-pointer justify-start">
            <input
              type="checkbox"
              checked={hideTitle}
              onChange={(e) => {
                setHideTitle(e.currentTarget.checked);
              }}
              className="checkbox checkbox-sm mr-2"
            />
            <span className="label-text">Hide title</span>
          </label>

          <label className="label cursor-pointer justify-start">
            <input
              type="checkbox"
              checked={hideBranding}
              onChange={(e) => {
                setHideBranding(e.currentTarget.checked);
              }}
              className="checkbox checkbox-sm mr-2"
            />
            <span className="label-text">Hide Pan'n'Zoom branding</span>
          </label>
        </>
      )}
    </EditProjectTab>
  );
}
