import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useWatchSize from "../../hooks/useWatchSize.ts";
import classNames from "classnames";
import { useGesture } from "@use-gesture/react";
import useProjectKeyframe from "@/hooks/useProjectKeyframe.ts";
import useProject from "@/hooks/useProject.ts";
import { decode } from "js-base64";
import { useStoredImage } from "@/hooks/useStoredImage.ts";
import { useProjectEditorStore } from "@/context/ProjectEditorStore.tsx";
import { useStore } from "zustand";
import IonIcon from "@/components/IonIcon.tsx";
import { decodeImage } from "@/utils/images.ts";

interface FittingScale {
  scaleFactor: number;
  scaledWidth: number;
  scaledHeight: number;
}

function computeFittingScale(
  containerWidth: number,
  containerHeight: number,
  elementWidth: number,
  elementHeight: number,
): FittingScale {
  if (
    containerWidth === 0 ||
    containerHeight === 0 ||
    elementWidth === 0 ||
    elementHeight === 0
  ) {
    return {
      scaleFactor: 0,
      scaledWidth: 0,
      scaledHeight: 0,
    };
  }

  let scaleFactor = containerWidth / elementWidth;
  if (scaleFactor * elementHeight > containerHeight) {
    scaleFactor = containerHeight / elementHeight;
  }

  return {
    scaleFactor,
    scaledWidth: scaleFactor * elementWidth,
    scaledHeight: scaleFactor * elementHeight,
  };
}

export interface EditProjectCanvasProps {
  projectId: string;
}

export default function EditProjectCanvas({
  projectId,
}: EditProjectCanvasProps) {
  const projectStore = useProjectEditorStore();
  const { mode, activeKeyframeId, highlightedKeyframeId } =
    useStore(projectStore);
  const { project } = useProject(projectId);
  const storedImage = useStoredImage(project?.image.storageId);
  const imgSrc: string | null = storedImage.loading
    ? null
    : storedImage.dataUrl ?? null;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementContainerRef = useRef<HTMLDivElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    ref: watchSizeRef,
    width: containerWidth,
    height: containerHeight,
  } = useWatchSize();

  const [loading, setLoading] = useState(true);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  const [panX, setPanXRaw] = useState(0);
  const [panY, setPanYRaw] = useState(0);

  const setPanX = useCallback((modifier: (previousValue: number) => number) => {
    setPanXRaw((previousValue) => {
      const next = Math.round(modifier(previousValue));
      if (isNaN(next) || Number.isNaN(next)) {
        throw new Error(
          `previous = ${previousValue}, next = ${next}, modified = ${modifier(
            previousValue,
          )}`,
        );
      }
      return next;
    });
  }, []);

  const setPanY = useCallback((modifier: (previousValue: number) => number) => {
    setPanYRaw((previousValue) => Math.round(modifier(previousValue)));
  }, []);

  const [panning, setPanning] = useState(false);
  const [userScale, setUserScale] = useState(1.0);

  useEffect(() => {
    if (!imgSrc) return;

    if (project?.embedSvgNatively === true) {
      const dataUrlMatch = /data:([^;]+);base64,(.+)/.exec(imgSrc);
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
            setImageWidth(parseFloat(svgElement.getAttribute("width") ?? "0"));
            setImageHeight(
              parseFloat(svgElement.getAttribute("height") ?? "0"),
            );
            imageContainerRef.current.innerHTML = "";
            imageContainerRef.current.appendChild(svgElement);
            setLoading(false);
            return;
          }
        }
      }
    }

    setLoading(true);

    void decodeImage(imgSrc)
      .then((image) => {
        image.style.width = "100%";
        image.style.height = "100%";
        setImageWidth(image.naturalWidth);
        setImageHeight(image.naturalHeight);
        if (imageContainerRef.current) {
          imageContainerRef.current.innerHTML = "";
          imageContainerRef.current.appendChild(image);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [imgSrc, project?.embedSvgNatively]);

  const fittingScale = useMemo<FittingScale>(() => {
    return computeFittingScale(
      containerWidth,
      containerHeight,
      imageWidth,
      imageHeight,
    );
  }, [containerWidth, containerHeight, imageWidth, imageHeight]);

  // Center image on start
  useEffect(() => {
    setPanX(() => (containerWidth - fittingScale.scaledWidth) / 2);
    setPanY(() => (containerHeight - fittingScale.scaledHeight) / 2);
    setUserScale(1);
  }, [
    setPanX,
    setPanY,
    containerWidth,
    containerHeight,
    fittingScale,
    setUserScale,
  ]);

  const getElementContainerPosition = useCallback(() => {
    if (elementContainerRef.current == null) {
      return { x: 0, y: 0 };
    }
    const box = elementContainerRef.current.getBoundingClientRect();
    return { x: box.x, y: box.y };
  }, [elementContainerRef]);

  const imageScaledWidth = Math.floor(fittingScale.scaledWidth * userScale);
  const imageScaledHeight = Math.floor(fittingScale.scaledHeight * userScale);

  const { keyframe: highlightedKeyframe } = useProjectKeyframe(
    projectId,
    highlightedKeyframeId,
  );

  const { keyframe: activeKeyframe, update: updateActiveKeyframe } =
    useProjectKeyframe(projectId, activeKeyframeId);

  const editFrameRef = useRef<HTMLDivElement | null>(null);
  const editFrameCornerTopLeftRef = useRef<HTMLDivElement | null>(null);
  const editFrameCornerTopRightRef = useRef<HTMLDivElement | null>(null);
  const editFrameCornerBottomRightRef = useRef<HTMLDivElement | null>(null);
  const editFrameCornerBottomLeftRef = useRef<HTMLDivElement | null>(null);

  const zoomTo = useCallback<
    (zoomFactor: number, pxPercentage: number, pyPercentage: number) => void
  >(
    (zoomFactor, pxPercentage, pyPercentage) => {
      const newUserScale = zoomFactor;

      const newImageScaledWidth = Math.floor(
        fittingScale.scaledWidth * newUserScale,
      );
      const newImageScaledHeight = Math.floor(
        fittingScale.scaledHeight * newUserScale,
      );

      const imageDeltaX = pxPercentage * imageScaledWidth;
      const imageDeltaY = pyPercentage * imageScaledHeight;

      const newImageDeltaX = pxPercentage * newImageScaledWidth;
      const newImageDeltaY = pyPercentage * newImageScaledHeight;

      const deltaX = newImageDeltaX - imageDeltaX;
      const deltaY = newImageDeltaY - imageDeltaY;

      setUserScale(newUserScale);
      setPanX((old) => old - deltaX);
      setPanY((old) => old - deltaY);
    },
    [imageScaledWidth, imageScaledHeight, fittingScale, setPanX, setPanY],
  );

  const [pinchCompensation, setPinchCompensation] = useState(1.0);

  useGesture(
    {
      onPointerDown: ({ event }) => {
        const imagePosition = getElementContainerPosition();
        const imageDeltaX = event.x - imagePosition.x;
        const imageDeltaY = event.y - imagePosition.y;

        const x = imageScaledWidth === 0 ? 0 : imageDeltaX / imageScaledWidth;
        const y = imageScaledHeight === 0 ? 0 : imageDeltaY / imageScaledHeight;

        setNewKeyframeRectangle({
          startX: x,
          startY: y,
          x,
          y,
          width: 0,
          height: 0,
        });
      },
      onPointerMove: ({ event }) => {
        if (creatingNewKeyframe && newKeyframeRectangle !== null) {
          const imagePosition = getElementContainerPosition();
          const imageDeltaX = event.x - imagePosition.x;
          const imageDeltaY = event.y - imagePosition.y;

          const currentX =
            imageScaledWidth === 0 ? 0 : imageDeltaX / imageScaledWidth;
          const currentY =
            imageScaledHeight === 0 ? 0 : imageDeltaY / imageScaledHeight;

          const width = Math.abs(newKeyframeRectangle.startX - currentX);
          const height = Math.abs(newKeyframeRectangle.startY - currentY);
          const newX =
            currentX >= newKeyframeRectangle.startX
              ? newKeyframeRectangle.startX
              : newKeyframeRectangle.startX - width;
          const newY =
            currentY >= newKeyframeRectangle.startY
              ? newKeyframeRectangle.startY
              : newKeyframeRectangle.startY - height;

          setNewKeyframeRectangle({
            startX: newKeyframeRectangle.startX,
            startY: newKeyframeRectangle.startY,
            x: newX,
            y: newY,
            width,
            height,
          });
        }
      },
      onPointerUp: () => {
        if (creatingNewKeyframe && newKeyframeRectangle) {
          projectStore.setState({ mode: "view", activeKeyframeId: null });
          updateActiveKeyframe({
            x: newKeyframeRectangle.x,
            y: newKeyframeRectangle.y,
            width: newKeyframeRectangle.width,
            height: newKeyframeRectangle.height,
          });
          setNewKeyframeRectangle(null);
        }
      },
      onDrag: ({ delta, event }) => {
        if (creatingNewKeyframe) return;

        if (mode === "editKeyframe" && activeKeyframe) {
          if (event.target === editFrameRef.current) {
            const deltaX = delta[0] / imageScaledWidth;
            const deltaY = delta[1] / imageScaledHeight;

            updateActiveKeyframe({
              x: activeKeyframe.x + deltaX,
              y: activeKeyframe.y + deltaY,
            });

            return;
          } else if (event.target === editFrameCornerTopLeftRef.current) {
            const deltaX = delta[0] / imageScaledWidth;
            const deltaY = delta[1] / imageScaledHeight;

            updateActiveKeyframe({
              x: activeKeyframe.x + deltaX,
              y: activeKeyframe.y + deltaY,
              width: Math.max(activeKeyframe.width - deltaX, 0),
              height: Math.max(activeKeyframe.height - deltaY, 0),
            });

            return;
          } else if (event.target === editFrameCornerTopRightRef.current) {
            const deltaX = delta[0] / imageScaledWidth;
            const deltaY = delta[1] / imageScaledHeight;

            updateActiveKeyframe({
              y: activeKeyframe.y + deltaY,
              width: Math.max(activeKeyframe.width + deltaX, 0),
              height: Math.max(activeKeyframe.height - deltaY, 0),
            });

            return;
          } else if (event.target === editFrameCornerBottomRightRef.current) {
            const deltaX = delta[0] / imageScaledWidth;
            const deltaY = delta[1] / imageScaledHeight;

            updateActiveKeyframe({
              width: Math.max(activeKeyframe.width + deltaX, 0),
              height: Math.max(activeKeyframe.height + deltaY, 0),
            });

            return;
          } else if (event.target === editFrameCornerBottomLeftRef.current) {
            const deltaX = delta[0] / imageScaledWidth;
            const deltaY = delta[1] / imageScaledHeight;

            updateActiveKeyframe({
              x: activeKeyframe.x + deltaX,
              width: Math.max(activeKeyframe.width - deltaX, 0),
              height: Math.max(activeKeyframe.height + deltaY, 0),
            });

            return;
          }
        }

        setPanX((old) => old + delta[0]);
        setPanY((old) => old + delta[1]);
      },
      onDragStart: () => {
        if (creatingNewKeyframe) return;
        setPanning(true);
      },
      onDragEnd: () => {
        if (creatingNewKeyframe) return;
        setPanning(false);
      },
      onPinch: ({ delta, origin }) => {
        const scaleDelta = delta[0] * pinchCompensation;

        // We compute the position of the origin
        // relative to the image box as percentages.
        // Then based on the new image size after the userScale adjustment
        // we compute the new deltaX and deltaY based on the same percentage but
        // with the new image scaled dimensions.
        // const imageDeltaX = canvasOriginX - panX;
        // const imageDeltaY = canvasOriginY - panY;
        const imagePosition = getElementContainerPosition();
        const imageDeltaX = origin[0] - imagePosition.x;
        const imageDeltaY = origin[1] - imagePosition.y;

        const imageDeltaXPercentage =
          imageScaledWidth === 0 ? 0 : imageDeltaX / imageScaledWidth;
        const imageDeltaYPercentage =
          imageScaledHeight === 0 ? 0 : imageDeltaY / imageScaledHeight;

        zoomTo(
          userScale + scaleDelta,
          imageDeltaXPercentage,
          imageDeltaYPercentage,
        );
      },
      onWheel: ({ delta, pinching }) => {
        if (pinching !== true) {
          setPanX((old) => old - delta[0]);
          setPanY((old) => old - delta[1]);
        }
      },
    },
    {
      target: containerRef,
      pinch: { preventDefault: true },
      wheel: { preventDefault: true },
      drag: { preventDefault: true },
      eventOptions: { passive: false },
    },
  );

  const userScalePercentage: string = `${Math.round(userScale * 100)}%`;

  const [newKeyframeRectangle, setNewKeyframeRectangle] = useState<{
    startX: number;
    startY: number;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (mode === "createKeyframe") setNewKeyframeRectangle(null);
  }, [mode]);

  if (!project) {
    return <>Project not found</>;
  }

  if (!storedImage.loading && !storedImage.dataUrl) {
    return <>Image data could not be found</>;
  }

  const creatingNewKeyframe =
    mode === "createKeyframe" && activeKeyframeId !== null;

  return (
    <div
      ref={(element) => {
        containerRef.current = element;
        watchSizeRef(element);
      }}
      className={classNames(
        "w-full h-full relative overflow-hidden touch-none",
        {
          "cursor-grab": !panning && !creatingNewKeyframe,
          "cursor-grabbing": panning && !creatingNewKeyframe,
          "cursor-crosshair": creatingNewKeyframe,
        },
      )}
      style={{
        backgroundColor: project.backgroundColor,
      }}
    >
      {loading && (
        <span className={"absolute top-0 left-0 z-50 fullCentered"}>
          Rendering image ... 🧑‍🎨
        </span>
      )}

      <div
        className={classNames(
          "absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-row items-center gap-8",
        )}
      >
        <div
          className={classNames(
            "flex flex-row items-center rounded-md overflow-hidden",
            "bg-white border border-gray-200 shadow-md",
            "dark:bg-gray-800 dark:border-gray-400",
          )}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPinchCompensation((pc) => pc / 1.2);
              zoomTo(userScale / 1.2, 0.5, 0.5);
            }}
            className={
              "min-w-[3rem] px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            }
          >
            <IonIcon name={"remove-outline"} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPinchCompensation((pc) => pc * (1 / userScale));
              zoomTo(1.0, 0.5, 0.5);

              // Re-center
              setPanX(() => (containerWidth - fittingScale.scaledWidth) / 2);
              setPanY(() => (containerHeight - fittingScale.scaledHeight) / 2);
            }}
            className={
              "border-l border-r border-gray-200 min-w-[6rem] px-4 py-1 text-center hover:bg-gray-100 transition dark:border-gray-400 dark:hover:bg-gray-700"
            }
          >
            {userScalePercentage}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPinchCompensation((pc) => pc * 1.2);
              zoomTo(userScale * 1.2, 0.5, 0.5);
            }}
            className={
              "min-w-[3rem] px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            }
          >
            <IonIcon name={"add-outline"} />
          </button>
        </div>
      </div>

      <div
        ref={elementContainerRef}
        className={"absolute origin-top-left select-none max-w-none max-h-none"}
        style={{
          left: `${panX}px`,
          top: `${panY}px`,
          width: `${imageScaledWidth}px`,
          height: `${imageScaledHeight}px`,
        }}
      >
        <div ref={imageContainerRef} className={"w-full h-full"} />

        {project && (
          <>
            {project.keyframes.map((keyframe, index) => {
              const isActiveKeyframe = keyframe.id === activeKeyframeId;

              // Do not show currently created keyframe
              if (creatingNewKeyframe && activeKeyframeId === keyframe.id)
                return undefined;

              return (
                <div
                  key={`keyframe-indicator-${keyframe.id}`}
                  className={classNames(
                    "absolute z-10 px-2 text-white font-bold",
                    "rounded-lg bg-red-600 opac",
                    { "opacity-50": isActiveKeyframe },
                  )}
                  style={{
                    left: `${(keyframe.x + keyframe.width * 0.5) * 100}%`,
                    top: `${(keyframe.y + keyframe.height * 0.5) * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {index + 1}
                </div>
              );
            })}
          </>
        )}

        {mode === "createKeyframe" &&
          activeKeyframe &&
          newKeyframeRectangle !== null && (
            <>
              <div
                className={
                  "absolute z-20 touch-none border-4 border-green-400 transition"
                }
                style={{
                  left: `${newKeyframeRectangle.x * 100}%`,
                  top: `${newKeyframeRectangle.y * 100}%`,
                  width: `${newKeyframeRectangle.width * 100}%`,
                  height: `${newKeyframeRectangle.height * 100}%`,
                }}
              ></div>
            </>
          )}

        {mode === "view" && highlightedKeyframe && (
          <>
            <div
              className={
                "absolute z-20 touch-none border-4 border-blue-400 bg-blue-400/30 transition"
              }
              style={{
                left: `${highlightedKeyframe.x * 100}%`,
                top: `${highlightedKeyframe.y * 100}%`,
                width: `${highlightedKeyframe.width * 100}%`,
                height: `${highlightedKeyframe.height * 100}%`,
              }}
            ></div>
          </>
        )}

        {mode === "editKeyframe" && activeKeyframe && (
          <>
            <div
              ref={editFrameRef}
              className={
                "absolute z-20 touch-none border-4 border-red-400 hover:bg-red-400/30 transition"
              }
              style={{
                left: `${activeKeyframe.x * 100}%`,
                top: `${activeKeyframe.y * 100}%`,
                width: `${activeKeyframe.width * 100}%`,
                height: `${activeKeyframe.height * 100}%`,
              }}
            >
              <div
                ref={editFrameCornerTopLeftRef}
                className={
                  "absolute -left-3 -top-3 w-4 h-4 bg-white border-4 border-red-400 hover:cursor-nwse-resize"
                }
              />

              <div
                ref={editFrameCornerTopRightRef}
                className={
                  "absolute -right-3 -top-3 w-4 h-4 bg-white border-4 border-red-400 hover:cursor-nesw-resize"
                }
              />

              <div
                ref={editFrameCornerBottomRightRef}
                className={
                  "absolute -right-3 -bottom-3 w-4 h-4 bg-white border-4 border-red-400 hover:cursor-nwse-resize"
                }
              />

              <div
                ref={editFrameCornerBottomLeftRef}
                className={
                  "absolute -left-3 -bottom-3 w-4 h-4 bg-white border-4 border-red-400 hover:cursor-nesw-resize"
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
