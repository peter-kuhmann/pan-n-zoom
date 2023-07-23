import IonIcon from "@/components/IonIcon.tsx";
import { useNavigate } from "react-router-dom";

export interface AppPageProps {
  backTo?: {
    label: string;
    to: string | (() => void);
  };
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function AppPage({
  title,
  children,
  actions,
  backTo,
}: AppPageProps) {
  const navigate = useNavigate();

  return (
    <div
      className={"h-full flex flex-col items-start justify-start px-16 py-12"}
    >
      {backTo && (
        <div className={"mb-4"}>
          <button
            className={
              "btn btn-sm btn-ghost flex items-center gap-2 font-normal"
            }
            onClick={() => {
              if (backTo) {
                if (typeof backTo.to === "function") {
                  backTo.to();
                } else {
                  navigate(backTo.to);
                }
              }
            }}
          >
            <IonIcon name={"arrow-back-outline"} />
            {backTo.label}
          </button>
        </div>
      )}

      <div
        className={
          "w-full flex flex-row gap-4 justify-between items-center mb-12"
        }
      >
        <h1 className={"text-4xl font-semibold"}>{title}</h1>
        {actions && <>{actions}</>}
      </div>

      <div className={"w-full flex-grow"}>{children}</div>
    </div>
  );
}
