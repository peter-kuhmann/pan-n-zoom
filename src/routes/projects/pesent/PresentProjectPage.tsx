import { useNavigate, useParams } from "react-router-dom";
import useProject from "@/hooks/useProject.ts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStoredImage } from "@/hooks/useStoredImage.ts";
import useWatchSize from "@/hooks/useWatchSize.ts";

export default function PresentProjectPage() {
  const navigate = useNavigate();
  const pathParams = useParams();
  const { project } = useProject(pathParams.projectId);
  const storedImage = useStoredImage(project?.image.storageId);
  const [decoding, setDecoding] = useState(false);

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

  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

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

  const { previousKeyframeId, nextKeyframeId } = useMemo<{
    previousKeyframeId?: string;
    nextKeyframeId?: string;
  }>(() => {
    if (!project || !currentKeyframeId) return {};

    const keyframeIndex = project.keyframes.findIndex(
      (projectKeyframe) => projectKeyframe.id === currentKeyframeId,
    );
    if (keyframeIndex < 0) return {};

    return {
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
      navigate("/");
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
      navigate(`/projects/${project.id}/present/${currentKeyframeId}`);
    }
  }, [project, currentKeyframeId, currentPathParamKeyframeId, navigate]);

  // Load image
  useEffect(() => {
    if (
      imageContainerRef.current &&
      !storedImage.loading &&
      storedImage.dataUrl
    ) {
      const image = new Image();
      image.src = storedImage.dataUrl;
      image.classList.add("w-full", "h-full", "max-w-none", "max-h-none");

      setDecoding(true);

      image
        .decode()
        .then(() => {
          setImageNaturalWidth(image.naturalWidth);
          setImageNaturalHeight(image.naturalHeight);

          if (imageContainerRef.current) {
            imageContainerRef.current.appendChild(image);
            imageRef.current = image;
          }
        })
        .finally(() => {
          setDecoding(false);
        });
    }
  }, [storedImage]);

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

  const previousSlide = useCallback(() => {
    if (project && previousKeyframeId) {
      navigate(`/projects/${project.id}/present/${previousKeyframeId}`);
    }
  }, [project, previousKeyframeId, navigate]);

  const nextSlide = useCallback(() => {
    if (project && nextKeyframeId) {
      navigate(`/projects/${project.id}/present/${nextKeyframeId}`);
    }
  }, [project, nextKeyframeId, navigate]);

  useEffect(() => {
    const leftArrowPreviousListener = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") {
        previousSlide();
      }
    };

    const rightArrowNextListener = (e: KeyboardEvent) => {
      if (e.code === "ArrowRight") {
        nextSlide();
      }
    };

    document.addEventListener("keydown", leftArrowPreviousListener);
    document.addEventListener("keydown", rightArrowNextListener);

    return () => {
      document.removeEventListener("keydown", leftArrowPreviousListener);
      document.removeEventListener("keydown", rightArrowNextListener);
    };
  }, [
    project,
    previousKeyframeId,
    nextKeyframeId,
    navigate,
    previousSlide,
    nextSlide,
  ]);

  if (!project) {
    return <>Project does not exist. Redirecting to home screen ...</>;
  }

  if (storedImage.loading) {
    return <>Loading image data ...</>;
  }

  if (!storedImage.dataUrl) {
    return <>Image data not found. Redirecting to home screen ...</>;
  }

  return (
    <div
      className={"w-full h-full relative overflow-hidden"}
      ref={presentationContainerWatchSizeRef}
    >
      {decoding && (
        <div className={"absolute z-10 left-0 top-0"}>Rendering image ...</div>
      )}

      <div
        className={"w-full h-full absolute overflow-hidden"}
        ref={imageContainerRef}
        style={{
          left: `${keyframePositioning.left}px`,
          top: `${keyframePositioning.top}px`,
          width: `${keyframePositioning.width}px`,
          height: `${keyframePositioning.height}px`,
          transition:
            "width 0.8s ease, height 0.8s ease, left 0.8s ease, top 0.8s ease",
        }}
      ></div>
    </div>
  );
}
