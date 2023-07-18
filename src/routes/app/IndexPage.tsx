import { useNavigate } from "react-router-dom";
import CuteCat from "@/components/cat/CuteCat.tsx";
import ProjectList from "@/components/ProjectList.tsx";
import AppPage from "@/components/AppPage.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import useProjects from "@/hooks/useProjects.ts";
import { getCreateProjectLink } from "@/navigation/links.ts";

export default function IndexPage() {
  const projects = useProjects();
  const navigate = useNavigate();

  return (
    <AppPage
      title={"Projects"}
      action={
        <button
          onClick={() => {
            navigate(getCreateProjectLink());
          }}
          className={"btn btn-circle btn-sm btn-neutral btn-outline"}
        >
          <IonIcon name={"add-outline"} />
        </button>
      }
    >
      {projects.length > 0 ? <ProjectsExistState /> : <EmptyState />}
    </AppPage>
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
    <div className={"flex flex-col items-center"}>
      <CuteCat className={"w-full max-w-[10rem] mb-8"} />

      <div className={"text-2xl mb-16 text-center leading-loose"}>
        You don't have any projects yet.
        <br />
        <b>Let's create your first one!</b>
      </div>

      <button
        className={"btn btn-neutral"}
        onClick={() => {
          navigate(getCreateProjectLink());
        }}
      >
        Create your first project <IonIcon name={"paw-outline"} />
      </button>
    </div>
  );
}
