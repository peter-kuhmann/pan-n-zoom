import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { type Project } from "@/types/project.ts";
import useSuite from "@/hooks/useSuite.ts";
import { useStoredImage } from "@/hooks/useStoredImage.ts";
import Canvas from "@/components/Canvas.tsx";

export default function ProjectPage() {
  const { suite } = useSuite();
  const navigate = useNavigate();
  const params = useParams();
  const projectId = params.projectId;

  const project = useMemo<Project | null>(() => {
    if (projectId) {
      return suite.projects.find((project) => project.id === projectId) ?? null;
    }
    return null;
  }, [projectId, suite]);

  const storedImage = useStoredImage(project?.image.storageId);

  useEffect(() => {
    if (!projectId || !project) {
      navigate("/");
    }
  }, [navigate, projectId, project]);

  if (storedImage.loading) {
    return <div className={"fullCentered"}>Loading image data ... ⏳</div>;
  }

  if (!storedImage.dataUrl) {
    return (
      <div className={"fullCentered"}>
        <span>
          <b>Error</b>: Image data not found 😭
        </span>
      </div>
    );
  }

  return (
    <div className={"w-full h-full"}>
      <Canvas imgSrc={storedImage.dataUrl} />
    </div>
  );
}
