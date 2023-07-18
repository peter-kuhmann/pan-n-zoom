import { useNavigate } from "react-router-dom";
import CuteCat from "@/components/cat/CuteCat.tsx";
import useSuite from "@/hooks/useSuite.ts";
import ProjectList from "@/components/ProjectList.tsx";

export default function IndexPage() {
  const { suite } = useSuite();

  return (
    <div className={"p-16 flex flex-col justify-center h-full"}>
      <h1 className={"mb-16 font-bold text-4xl text-center"}>Pan'n'Zoom</h1>
      {suite.projects.length > 0 ? <ProjectsExistState /> : <EmptyState />}
    </div>
  );
}

function ProjectsExistState() {
  const navigate = useNavigate();

  return (
    <div className={"flex flex-col gap-8 items-center justify-center"}>
      <button
        className={"btn"}
        onClick={() => {
          navigate("/projects/create");
        }}
      >
        Create a new project
      </button>

      <div className={"w-full max-w-[25rem]"}>
        <ProjectList />
      </div>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className={"flex flex-col items-center gap-8"}>
      <div className={"text-center"}>
        Welcome to Pan'n'Zoom.
        <br />
        <b>You don't have any projects yet.</b>
      </div>

      <CuteCat className={"w-full max-w-[8rem]"} />

      <button
        className={"btn"}
        onClick={() => {
          navigate("/projects/create");
        }}
      >
        Create your first project 🎉
      </button>
    </div>
  );
}
