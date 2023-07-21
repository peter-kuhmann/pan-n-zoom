import { useLocation, useNavigate } from "react-router-dom";
import CuteCat from "@/components/cat/CuteCat.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import * as classNames from "classnames";
import { useMemo } from "react";
import {
  getProductPageLink,
  getProjectBasePath,
  getProjectOverviewLink,
} from "@/navigation/links.ts";

export default function IndexSidebar() {
  const navigate = useNavigate();

  return (
    <div
      className={"w-fit h-full flex flex-col gap-4 min-w-[10rem] items-stretch"}
    >
      <button
        className={"flex items-center gap-6 p-6 pl-8"}
        onClick={() => {
          navigate(getProductPageLink());
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
          activeStrategy={(currentPathname) => {
            return (
              currentPathname === getProjectOverviewLink() ||
              currentPathname.startsWith(getProjectBasePath())
            );
          }}
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
        <Entry
          label={"Shortcuts"}
          navigateTo={"/app/shortcuts"}
          icon={<IonIcon name={"flash-outline"} />}
        />
        <Entry
          label={"Help"}
          navigateTo={"/app/help"}
          icon={<IonIcon name={"help-buoy-outline"} />}
        />
      </div>
    </div>
  );
}

type ActiveStrategy =
  | "exact"
  | "prefix"
  | ((currentPathname: string, navigateTo: string) => boolean);

interface EntryProps {
  icon?: React.ReactNode;
  label: string;
  navigateTo: string;
  activeStrategy?: ActiveStrategy;
}

function removeTrailingSlash(value: string) {
  const trimmed = value.trim();
  if (trimmed === "/") return trimmed;
  return trimmed.replace(/\/$/, "");
}

function Entry({
  icon,
  label,
  navigateTo,
  activeStrategy = "exact",
}: EntryProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const normalizedNavigateTo = removeTrailingSlash(navigateTo);
  const normalizedPathname = removeTrailingSlash(pathname);

  const active = useMemo(() => {
    if (activeStrategy === "exact") {
      return normalizedPathname === normalizedNavigateTo;
    } else if (activeStrategy === "prefix") {
      return normalizedPathname.startsWith(normalizedNavigateTo);
    } else {
      return activeStrategy(normalizedPathname, normalizedNavigateTo);
    }
  }, [activeStrategy, normalizedPathname, normalizedNavigateTo]);

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
        navigate(normalizedNavigateTo);
      }}
    >
      {icon && <div>{icon}</div>}
      <div>{label}</div>
    </button>
  );
}
