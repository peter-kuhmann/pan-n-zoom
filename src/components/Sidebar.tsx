import { useLocation, useNavigate } from "react-router-dom";
import CuteCat from "@/components/cat/CuteCat.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import * as classNames from "classnames";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div
      className={"w-fit h-full flex flex-col gap-4 min-w-[10rem] items-stretch"}
    >
      <button
        className={"flex items-center gap-6 p-6 pl-8"}
        onClick={() => {
          navigate("/");
        }}
      >
        <CuteCat className={"w-[4rem] h-[4rem]"} />
        <div className={"text-2xl"}>Pan'n'Zoom</div>
      </button>

      <div
        className={"flex-grow h-1 flex flex-col gap-4 items-stretch p-6 pl-8"}
      >
        <Entry
          label={"Projects"}
          navigateTo={"/app"}
          icon={<IonIcon name={"rocket-outline"} />}
        />
        <Entry
          label={"Settings"}
          navigateTo={"/app/settings"}
          icon={<IonIcon name={"cog-outline"} />}
        />
        <Entry
          label={"Export"}
          navigateTo={"/app/export"}
          icon={<IonIcon name={"save-outline"} />}
        />
        <Entry
          label={"Import"}
          navigateTo={"/app/import"}
          icon={<IonIcon name={"cloud-download-outline"} />}
        />
      </div>
    </div>
  );
}

interface EntryProps {
  icon?: React.ReactNode;
  label: string;
  navigateTo: string;
}

function Entry({ icon, label, navigateTo }: EntryProps) {
  const navigate = useNavigate();
  const active = useLocation().pathname.startsWith(navigateTo);

  return (
    <button
      className={classNames(
        "flex flex-row flex-nowrap items-center justify-start gap-4 px-4",
        "btn btn-sm font-normal",
        {
          "btn-neutral": active,
          "btn-outline": !active,
        },
      )}
      onClick={() => {
        navigate(navigateTo);
      }}
    >
      {icon && <div>{icon}</div>}
      <div>{label}</div>
    </button>
  );
}
