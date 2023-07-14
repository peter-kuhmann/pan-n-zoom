import CuteCat from "../cat/CuteCat.tsx";
import { useNavigate } from "react-router-dom";
import useSuite from "@/hooks/useSuite.ts";
import ProjectList from "@/components/ProjectList.tsx";

export default function SidebarProjectList() {
  const { suite } = useSuite();

  return suite.projects.length > 0 ? <ProjectsExistState /> : <EmptyState />;
}

function ProjectsExistState() {
  const navigate = useNavigate();

  return (
    <>
      <button
        className={"btn btn-sm mb-4 w-full"}
        onClick={() => {
          navigate("/projects/create");
        }}
      >
        Create one 🎉
      </button>

      <ProjectList />
    </>
  );
}

function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className={"h-full flex flex-col gap-8 justify-center items-center"}>
      <div className={"text-lg"}>No projects yet.</div>

      <CuteCat className={"w-full max-w-[5rem]"} />

      <button
        className={"btn"}
        onClick={() => {
          navigate("/projects/create");
        }}
      >
        Create one 🎉
      </button>
    </div>
  );
}
