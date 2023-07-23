import { useNavigate } from "react-router-dom";
import CuteCat from "@/components/cat/CuteCat.tsx";
import { getCreateProjectLink } from "@/navigation/links.ts";
import IonIcon from "@/components/IonIcon.tsx";

export interface IndexEmptyStateProps {
  onImport: () => void;
}

export default function IndexEmptyState({ onImport }: IndexEmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className={"flex flex-col items-center"}>
      <CuteCat className={"w-full max-w-[10rem] mb-8"} />

      <div className={"text-2xl mb-16 text-center leading-relaxed"}>
        <br />
        <b>Let's create your first project!</b>
        <br />
        (or drop an export file here)
      </div>

      <button
        className={"btn btn-neutral"}
        onClick={() => {
          navigate(getCreateProjectLink());
        }}
      >
        Create your first project <IonIcon name={"paw-outline"} />
      </button>

      <div className={"my-4"}>OR</div>

      <button
        className={"btn btn-neutral btn-outline btn-sm"}
        onClick={onImport}
      >
        ... or import an export
        <IonIcon name={"cloud-upload-outline"} />
      </button>
    </div>
  );
}
