import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useStoredImage } from "@/hooks/useStoredImage.ts";
import Canvas from "@/components/Canvas.tsx";
import EditorSidebar from "@/components/project/EditorSidebar.tsx";
import useProject from "@/hooks/useProject.ts";

export default function ProjectPage() {
  const navigate = useNavigate();
  const { project } = useProject(useParams().projectId);

  const storedImage = useStoredImage(project?.image.storageId);

  useEffect(() => {
    if (!project) {
      navigate("/");
    }
  }, [navigate, project]);

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

  if (!project) {
    return <>Project not found</>;
  }

  return (
    <div className={"flex w-full h-full"}>
      <div className={"w-full h-full flex-grow"}>
        <Canvas imgSrc={storedImage.dataUrl} />
      </div>

      <div className={"w-full max-w-[20rem] h-full border-l border-l-gray-400"}>
        <EditorSidebar projectId={project.id} />
      </div>
    </div>
  );
}
