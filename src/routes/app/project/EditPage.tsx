import { useNavigate, useParams } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import { useStoredImage } from "@/hooks/useStoredImage.ts";
import EditorCanvas from "@/components/EditorCanvas.tsx";
import EditorSidebar from "@/components/project/EditorSidebar.tsx";
import useProject from "@/hooks/useProject.ts";

export default function EditPage() {
  const [state, setState] = useState<EditorPageContextState>("view");
  const [activeKeyframeId, setActiveKeyframeId] = useState<string | null>(null);

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
    <EditorPageReactContext.Provider
      value={{ state, setState, activeKeyframeId, setActiveKeyframeId }}
    >
      <div className={"flex w-full h-full"}>
        <div className={"w-full h-full flex-grow"}>
          <EditorCanvas imgSrc={storedImage.dataUrl} projectId={project.id} />
        </div>

        <div
          className={"w-full max-w-[20rem] h-full border-l border-l-gray-400"}
        >
          <EditorSidebar projectId={project.id} />
        </div>
      </div>
    </EditorPageReactContext.Provider>
  );
}

type EditorPageContextState = "view" | "editKeyframe";

interface EditorPageContext {
  state: EditorPageContextState;
  setState: (state: EditorPageContextState) => void;
  activeKeyframeId: string | null;
  setActiveKeyframeId: (keyframeId: string | null) => void;
}

const EditorPageReactContext = createContext<EditorPageContext>({
  state: "view",
  setState: () => undefined,
  activeKeyframeId: null,
  setActiveKeyframeId: () => undefined,
});

export function useEditorPageContext() {
  return useContext(EditorPageReactContext);
}
