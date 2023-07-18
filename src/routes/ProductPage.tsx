import CuteCat from "@/components/cat/CuteCat.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import { useNavigate } from "react-router-dom";

export default function ProductPage() {
  const navigate = useNavigate();

  return (
    <div className={"w-full py-32 px-16"}>
      <div
        className={
          "w-full max-w-[50rem] mx-auto flex flex-col items-center gap-8"
        }
      >
        <CuteCat className={"w-full max-w-[12rem]"} />

        <h1 className={"text-4xl font-bold"}>Pan'n'Zoom</h1>

        <p className={"max-w-[25rem] text-center text-xl"}>
          The smartest tool to animate panning and zooming within your images.
        </p>

        <button
          className={"btn dark:btn-primary"}
          onClick={() => {
            navigate("/app");
          }}
        >
          Open app <IonIcon name={"chevron-forward-outline"} />
        </button>
      </div>
    </div>
  );
}
