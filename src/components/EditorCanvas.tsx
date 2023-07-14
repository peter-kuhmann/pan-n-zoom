import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useWatchSize from "../hooks/useWatchSize.ts";
import * as classNames from "classnames";
import { useGesture } from "@use-gesture/react";
import { useEditorPageContext } from "@/routes/projects/EditorPage.tsx";
import useProjectKeyframe from "@/hooks/useProjectKeyframe.ts";

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

export interface CanvasProps {
  imgSrc: string;
  projectId: string;
}

export default function EditorCanvas({ imgSrc, projectId }: CanvasProps) {
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
    setPanXRaw((previousValue) => Math.round(modifier(previousValue)));
  }, []);
  const setPanY = useCallback((modifier: (previousValue: number) => number) => {
    setPanYRaw((previousValue) => Math.round(modifier(previousValue)));
  }, []);

  const [panning, setPanning] = useState(false);
  const [userScale, setUserScale] = useState(1.0);

  useEffect(() => {
    const image = new Image();
    image.decoding = "async";
    image.src = imgSrc;
    image.style.width = "100%";
    image.style.height = "100%";

    setLoading(true);

    void image
      .decode()
      .then(() => {
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
  }, [imgSrc]);

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
  }, [setPanX, setPanY, containerWidth, containerHeight, fittingScale]);

  const getElementContainerPosition = useCallback(() => {
    if (elementContainerRef.current == null) {
      return { x: 0, y: 0 };
    }
    const box = elementContainerRef.current.getBoundingClientRect();
    return { x: box.x, y: box.y };
  }, [elementContainerRef]);

  const imageScaledWidth = Math.floor(fittingScale.scaledWidth * userScale);
  const imageScaledHeight = Math.floor(fittingScale.scaledHeight * userScale);

  const { state, activeKeyframeId } = useEditorPageContext();
  const { keyframe: activeKeyframe, update: updateActiveKeyframe } =
    useProjectKeyframe(projectId, activeKeyframeId);

  const editFrameRef = useRef<HTMLDivElement | null>(null);
  const editFrameCornerTopLeftRef = useRef<HTMLDivElement | null>(null);
  const editFrameCornerTopRightRef = useRef<HTMLDivElement | null>(null);
  const editFrameCornerBottomRightRef = useRef<HTMLDivElement | null>(null);
  const editFrameCornerBottomLeftRef = useRef<HTMLDivElement | null>(null);

  useGesture(
    {
      onDrag: ({ delta, event }) => {
        if (state === "editKeyframe" && activeKeyframe) {
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
        setPanning(true);
      },
      onDragEnd: () => {
        setPanning(false);
      },
      onPinch: ({ delta, origin }) => {
        const scaleDelta = delta[0];

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

        const imageDeltaXPercentage = imageDeltaX / imageScaledWidth;
        const imageDeltaYPercentage = imageDeltaY / imageScaledHeight;

        const newUserScale = userScale + scaleDelta;

        const newImageScaledWidth = Math.floor(
          fittingScale.scaledWidth * newUserScale,
        );
        const newImageScaledHeight = Math.floor(
          fittingScale.scaledHeight * newUserScale,
        );

        const newImageDeltaX = imageDeltaXPercentage * newImageScaledWidth;
        const newImageDeltaY = imageDeltaYPercentage * newImageScaledHeight;

        const deltaX = newImageDeltaX - imageDeltaX;
        const deltaY = newImageDeltaY - imageDeltaY;

        setUserScale(newUserScale);
        setPanX((old) => old - deltaX);
        setPanY((old) => old - deltaY);
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

  // const bindDragEditFrame = useGesture(
  //   {
  //     onTouchStart: ({ event }) => {
  //       event.stopPropagation();
  //     },
  //     onDragStart: ({ event }) => {
  //       event.stopPropagation();
  //     },
  //     onMouseDown: ({ event }) => {
  //       event.stopPropagation();
  //     },
  //     onDrag: ({ event }) => {
  //       event.stopPropagation();
  //       console.log("Frame drag");
  //
  //       // updateActiveKeyframe({
  //       //   x: activeKeyframe!.x + 0.001,
  //       // });
  //     },
  //   },
  //   {
  //     drag: { preventDefault: true },
  //     eventOptions: { passive: false },
  //   },
  // );

  return (
    <div
      ref={(element) => {
        containerRef.current = element;
        watchSizeRef(element);
      }}
      className={classNames(
        "w-full h-full relative overflow-hidden touch-none",
        {
          "cursor-grab": !panning,
          "cursor-grabbing": panning,
        },
      )}
    >
      {loading && (
        <span className={"absolute top-0 left-0 z-50 fullCentered"}>
          Rendering image ... 🧑‍🎨
        </span>
      )}

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

        {state === "editKeyframe" && activeKeyframe && (
          <>
            <div
              ref={editFrameRef}
              className={
                "absolute z-10 touch-none border-4 border-red-400 hover:bg-red-400/10 transition"
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
