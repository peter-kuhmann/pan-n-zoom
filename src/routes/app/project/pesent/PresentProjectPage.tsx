import { useNavigate, useParams } from "react-router-dom";
import useProject from "@/hooks/useProject.ts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStoredImage } from "@/hooks/useStoredImage.ts";
import useWatchSize from "@/hooks/useWatchSize.ts";
import classNames from "classnames";
import { decode } from "js-base64";
import {
  getProjectEditorLink,
  getProjectOverviewLink,
  getProjectPresentLinkWithKeyframe,
} from "@/navigation/links.ts";
import IonIcon from "@/components/IonIcon.tsx";
import { decodeImage } from "@/utils/images.ts";

export default function PresentProjectPage() {
  const navigate = useNavigate();
  const pathParams = useParams();
  const { project, update } = useProject(pathParams.projectId);
  const storedImage = useStoredImage(project?.image.storageId);
  const [decoding, setDecoding] = useState(false);
  const [transitionsActive, setTransitionsActive] = useState(false);
  const [cursorShown, setCursorShown] = useState(true);

  const currentPathParamKeyframeId = pathParams.keyframeId;
  const currentKeyframeId = useMemo(() => {
    if (!project) return undefined;
    if (project.keyframes.length === 0) return undefined;

    const keyframeMatchingByPathParam = project.keyframes.find(
      (projectKeyframe) => projectKeyframe.id === currentPathParamKeyframeId,
    );
    const firstKeyframe = project.keyframes[0];

    return keyframeMatchingByPathParam
      ? keyframeMatchingByPathParam.id
      : firstKeyframe.id;
  }, [project, currentPathParamKeyframeId]);

  const presentationContainerRef = useRef<HTMLDivElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const openedAtSetRef = useRef<boolean>(false);
  useEffect(() => {
    if (!openedAtSetRef.current) {
      update({
        openedAt: new Date().toISOString(),
      });
      openedAtSetRef.current = true;
    }
  }, [update]);

  const {
    ref: presentationContainerWatchSizeRef,
    width: presentationContainerWidth,
    height: presentationContainerHeight,
  } = useWatchSize();
  const [imageNaturalWidth, setImageNaturalWidth] = useState(0);
  const [imageNaturalHeight, setImageNaturalHeight] = useState(0);

  const keyframe = useMemo(() => {
    if (!project) return undefined;
    if (!currentKeyframeId) return undefined;
    return project.keyframes.find(
      (projectKeyframe) => projectKeyframe.id === currentKeyframeId,
    );
  }, [project, currentKeyframeId]);

  const { currentKeyframeIndex, previousKeyframeId, nextKeyframeId } = useMemo<{
    currentKeyframeIndex?: number;
    previousKeyframeId?: string;
    nextKeyframeId?: string;
  }>(() => {
    if (!project || !currentKeyframeId) return {};

    const keyframeIndex = project.keyframes.findIndex(
      (projectKeyframe) => projectKeyframe.id === currentKeyframeId,
    );
    if (keyframeIndex < 0) return {};

    return {
      currentKeyframeIndex: keyframeIndex,
      previousKeyframeId:
        keyframeIndex >= 1
          ? project.keyframes[keyframeIndex - 1].id
          : undefined,
      nextKeyframeId:
        keyframeIndex < project.keyframes.length - 1
          ? project.keyframes[keyframeIndex + 1].id
          : undefined,
    };
  }, [project, currentKeyframeId]);

  // Redirect to home screen if
  useEffect(() => {
    if (
      !project ||
      (!storedImage.loading && !storedImage.dataUrl) ||
      project.keyframes.length === 0
    ) {
      console.error(
        "Redirecting user to project overview. Reason: Project not found, image data not found or no keyframes.",
      );
      navigate(getProjectOverviewLink(), { replace: true });
    }
  }, [navigate, project, storedImage]);

  // Add fist keyframe id to URL
  useEffect(() => {
    if (
      project &&
      currentKeyframeId &&
      (!currentPathParamKeyframeId ||
        currentPathParamKeyframeId !== currentKeyframeId)
    ) {
      navigate(
        getProjectPresentLinkWithKeyframe(project.id, currentKeyframeId),
        { replace: true },
      );
    }
  }, [project, currentKeyframeId, currentPathParamKeyframeId, navigate]);

  // Load image
  useEffect(() => {
    if (
      imageContainerRef.current &&
      !storedImage.loading &&
      storedImage.dataUrl
    ) {
      if (project?.embedSvgNatively === true) {
        const dataUrlMatch = /data:([^;]+);base64,(.+)/.exec(
          storedImage.dataUrl,
        );
        if (dataUrlMatch) {
          const mimeType = dataUrlMatch[1];
          const base64Data = dataUrlMatch[2];

          if (mimeType === "image/svg+xml") {
            const decodedSvg = decode(base64Data);
            const dummyContainer = document.createElement("div");
            dummyContainer.innerHTML = decodedSvg;

            const svgElement = dummyContainer.querySelector("svg");
            if (svgElement && imageContainerRef.current) {
              svgElement.style.width = "100%";
              svgElement.style.height = "100%";
              setImageNaturalWidth(
                parseFloat(svgElement.getAttribute("width") ?? "0"),
              );
              setImageNaturalHeight(
                parseFloat(svgElement.getAttribute("height") ?? "0"),
              );
              imageContainerRef.current.innerHTML = "";
              imageContainerRef.current.appendChild(svgElement);
              setDecoding(false);
              return;
            }
          }
        }
      }

      setDecoding(true);

      decodeImage(storedImage.dataUrl)
        .then((image) => {
          image.classList.add("w-full", "h-full", "max-w-none", "max-h-none");
          setImageNaturalWidth(image.naturalWidth);
          setImageNaturalHeight(image.naturalHeight);

          if (imageContainerRef.current) {
            imageContainerRef.current.innerHTML = "";
            imageContainerRef.current.appendChild(image);
            imageRef.current = image;
          }
        })
        .finally(() => {
          setDecoding(false);
        });
    }
  }, [project, storedImage]);

  const keyframePositioning = useMemo<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>(() => {
    if (!keyframe) {
      return {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      };
    }

    const keyframeNaturalWidth = Math.ceil(keyframe.width * imageNaturalWidth);
    const keyframeNaturalHeight = Math.ceil(
      keyframe.height * imageNaturalHeight,
    );

    // Compute scale factor
    let scale =
      keyframeNaturalWidth === 0
        ? 0
        : presentationContainerWidth / keyframeNaturalWidth;

    if (scale * keyframeNaturalHeight > presentationContainerHeight) {
      scale =
        keyframeNaturalHeight === 0
          ? 0
          : presentationContainerHeight / keyframeNaturalHeight;
    }

    // Compute translation
    const scaledImageWidth = Math.ceil(imageNaturalWidth * scale);
    const scaledImageHeight = Math.ceil(imageNaturalHeight * scale);

    const scaledKeyframeX = Math.floor(keyframe.x * scaledImageWidth);
    const scaledKeyframeY = Math.floor(keyframe.y * scaledImageHeight);
    const scaledKeyframeWidth = Math.ceil(keyframeNaturalWidth * scale);
    const scaledKeyframeHeight = Math.ceil(keyframeNaturalHeight * scale);

    const left =
      (presentationContainerWidth - scaledKeyframeWidth) / 2 - scaledKeyframeX;

    const top =
      (presentationContainerHeight - scaledKeyframeHeight) / 2 -
      scaledKeyframeY;

    return {
      left,
      top,
      width: scaledImageWidth,
      height: scaledImageHeight,
    };
  }, [
    imageNaturalWidth,
    imageNaturalHeight,
    keyframe,
    presentationContainerWidth,
    presentationContainerHeight,
  ]);

  // Active transitions
  useEffect(() => {
    if (
      (keyframePositioning.width > 0 || keyframePositioning.height > 0) &&
      !decoding &&
      !storedImage.loading &&
      storedImage.dataUrl
    ) {
      const timeout = setTimeout(() => {
        setTransitionsActive(true);
      }, 100);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [keyframePositioning, decoding, storedImage]);

  const showKeyframe = useCallback(
    (keyframeId: string) => {
      if (project) {
        navigate(getProjectPresentLinkWithKeyframe(project.id, keyframeId), {
          replace: true,
        });
      }
    },
    [navigate, project],
  );

  const showFirstKeyframe = useCallback(() => {
    if (project && project.keyframes.length > 0) {
      showKeyframe(project.keyframes[0].id);
    }
  }, [project, showKeyframe]);

  const showLastKeyframe = useCallback(() => {
    if (project && project.keyframes.length > 0) {
      showKeyframe(project.keyframes[project.keyframes.length - 1].id);
    }
  }, [project, showKeyframe]);

  const showPreviousKeyframe = useCallback(() => {
    if (previousKeyframeId) {
      showKeyframe(previousKeyframeId);
    }
  }, [previousKeyframeId, showKeyframe]);

  const showNextKeyframe = useCallback(() => {
    if (nextKeyframeId) {
      showKeyframe(nextKeyframeId);
    }
  }, [nextKeyframeId, showKeyframe]);

  const exitPresentationMode = useCallback(() => {
    if (project) {
      navigate(getProjectEditorLink(project.id));
    }
  }, [navigate, project]);

  const enterFullscreenMode = useCallback(() => {
    if (presentationContainerRef.current) {
      void presentationContainerRef.current.requestFullscreen();
    }
  }, []);

  const exitFullscreenMode = useCallback(() => {
    if (presentationContainerRef.current) {
      void document.exitFullscreen();
    }
  }, []);

  const checkIsFullscreenOn = useCallback(() => {
    if (!presentationContainerRef.current) return false;
    return document.fullscreenElement === presentationContainerRef.current;
  }, []);

  // Handle keyboard presses
  useEffect(() => {
    const keyListener = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "ArrowUp") {
        if (e.shiftKey) {
          showFirstKeyframe();
        } else {
          showPreviousKeyframe();
        }
      }

      if (
        e.code === "ArrowRight" ||
        e.code === "ArrowDown" ||
        e.code === "Space"
      ) {
        if (e.shiftKey) {
          showLastKeyframe();
        } else {
          showNextKeyframe();
        }
      }

      if (e.code === "KeyF") {
        if (checkIsFullscreenOn()) {
          exitFullscreenMode();
        } else {
          enterFullscreenMode();
        }
      }

      if (e.code === "Escape" && !checkIsFullscreenOn()) {
        exitPresentationMode();
      }
    };

    document.addEventListener("keydown", keyListener);

    return () => {
      document.removeEventListener("keydown", keyListener);
    };
  }, [
    exitFullscreenMode,
    project,
    previousKeyframeId,
    nextKeyframeId,
    navigate,
    showPreviousKeyframe,
    showNextKeyframe,
    showFirstKeyframe,
    showLastKeyframe,
    enterFullscreenMode,
    exitPresentationMode,
    checkIsFullscreenOn,
  ]);

  // Hide cursor after 1,5s
  useEffect(() => {
    if (cursorShown) {
      const timeout = setTimeout(() => {
        setCursorShown(false);
      }, 1500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [cursorShown]);

  const [fullscreenOn, setFullscreenOn] = useState(false);

  useEffect(() => {
    const listener = () => {
      setFullscreenOn(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", listener);

    return () => {
      document.removeEventListener("fullscreenchange", listener);
    };
  }, []);

  if (!project) {
    return <>Project does not exist. Redirecting to home screen ...</>;
  }

  if (storedImage.loading) {
    return <>Loading image data ...</>;
  }

  if (!storedImage.dataUrl) {
    return <>Image data not found. Redirecting to home screen ...</>;
  }

  const slideIndicatorText = `${(currentKeyframeIndex ?? 0) + 1} / ${
    project.keyframes.length
  }`;

  return (
    <div
      onMouseUp={showNextKeyframe}
      className={classNames(
        "w-full h-full relative overflow-hidden text-[0.8rem] bg-white",
        {
          "cursor-none": !cursorShown,
        },
      )}
      ref={(element) => {
        presentationContainerRef.current = element;
        presentationContainerWatchSizeRef(element);
      }}
      onMouseMove={(e) => {
        if (e.movementX > 3 || e.movementY > 3) {
          setCursorShown(true);
        }
      }}
      style={{
        backgroundColor: project.backgroundColor,
      }}
    >
      {decoding && (
        <div className={"absolute z-20 left-0 top-0"}>Rendering image ...</div>
      )}

      <div
        className={classNames(
          "absolute bottom-4 left-1/2 -translate-x-1/2 z-10",
          "flex flex-row items-center rounded-md overflow-hidden ",
          "bg-white border border-gray-400 shadow-md",
          "dark:bg-gray-800",
          "opacity-50 hover:opacity-100 transition",
        )}
        onMouseUp={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button
          disabled={!previousKeyframeId}
          className={classNames(
            "min-w-[3rem] py-0.5 focus:outline-none",
            "border-r border-gray-400",
            {
              "hover:bg-gray-100 dark:hover:bg-gray-600": previousKeyframeId,
            },
          )}
          onClick={showPreviousKeyframe}
        >
          <IonIcon name={"chevron-back-outline"} />
        </button>

        <button
          disabled={!nextKeyframeId}
          className={classNames(
            "min-w-[3rem] py-0.5 focus:outline-none",
            "border-r border-gray-400",
            {
              "hover:bg-gray-100 dark:hover:bg-gray-600": nextKeyframeId,
            },
          )}
          onClick={showNextKeyframe}
        >
          <IonIcon name={"chevron-forward-outline"} />
        </button>

        <div className={"px-4 min-w-[5rem] py-0.5 text-center"}>
          {slideIndicatorText}
        </div>

        <button
          className={classNames(
            "min-w-[3rem] py-0.5 focus:outline-none",
            "border-l border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600",
          )}
          onClick={exitPresentationMode}
        >
          <IonIcon name={"stop"} />
        </button>
        <button
          className={classNames(
            "min-w-[3rem] py-0.5 focus:outline-none",
            "border-l border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600",
          )}
          onClick={() => {
            if (fullscreenOn) {
              exitFullscreenMode();
            } else {
              enterFullscreenMode();
            }
          }}
        >
          {fullscreenOn ? (
            <IonIcon name={"contract-outline"} />
          ) : (
            <IonIcon name={"expand-outline"} />
          )}
        </button>
      </div>

      {/* Image will be attached by useEffect that loads and decodes image */}
      <div
        className={"w-full h-full absolute overflow-hidden"}
        ref={imageContainerRef}
        style={{
          left: `${keyframePositioning.left}px`,
          top: `${keyframePositioning.top}px`,
          width: `${keyframePositioning.width}px`,
          height: `${keyframePositioning.height}px`,
          ...(transitionsActive
            ? {
                transitionProperty: "width, height, left, top",
                transitionTimingFunction: project.animationType,
                transitionDuration: `${project.animationDuration}ms`,
              }
            : {}),
        }}
      />
    </div>
  );
}
