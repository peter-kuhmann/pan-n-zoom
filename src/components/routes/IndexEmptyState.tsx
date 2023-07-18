import { useNavigate } from "react-router-dom";
import CuteCat from "@/components/cat/CuteCat.tsx";
import { getCreateProjectLink } from "@/navigation/links.ts";
import IonIcon from "@/components/IonIcon.tsx";

export default function IndexEmptyState() {
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
