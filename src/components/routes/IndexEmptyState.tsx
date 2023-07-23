import { useNavigate } from "react-router-dom";
import CuteCat from "@/components/cat/CuteCat.tsx";
import { getCreateProjectLink } from "@/navigation/links.ts";
import IonIcon from "@/components/IonIcon.tsx";
import SKC from "@/components/SKC.tsx";

export interface IndexEmptyStateProps {
  onImport: () => void;
}

export default function IndexEmptyState({ onImport }: IndexEmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className={"flex flex-col items-center"}>
      <CuteCat className={"w-full max-w-[10rem] mb-12"} />

      <div className={"text-2xl mb-16 text-center leading-relaxed"}>
        <b>Let's create your first project!</b>
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

      <div className={"my-4"}>OR</div>

      <div className={"text-xl mb-4 text-center leading-relaxed"}>
        Paste image via <SKC small keys={["#PCTRL", "V"]} />,<br /> drop image
        file or Pan'n'Zoom export.
      </div>
    </div>
  );
}
