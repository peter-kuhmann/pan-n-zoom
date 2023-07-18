import { useNavigate } from "react-router-dom";
import AppPage from "@/components/AppPage.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import useProjects from "@/hooks/useProjects.ts";
import { getCreateProjectLink } from "@/navigation/links.ts";
import IndexEmptyState from "@/components/routes/IndexEmptyState.tsx";
import IndexProjectOverview from "@/components/routes/IndexProjectOverview.tsx";

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
          className={"btn btn-sm btn-neutral btn-outline"}
        >
          Create project <IonIcon name={"add-outline"} />
        </button>
      }
    >
      {projects.length > 0 ? <IndexProjectOverview /> : <IndexEmptyState />}
    </AppPage>
  );
}
