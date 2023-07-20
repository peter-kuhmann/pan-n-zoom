import { Link, Outlet, useNavigate } from "react-router-dom";
import * as classNames from "classnames";
import { getProductPageLink, getProjectListLink } from "@/navigation/links.ts";
import CuteCat from "@/components/cat/CuteCat.tsx";
import IonIcon from "@/components/IonIcon.tsx";

export default function ProductLayout() {
  return (
    <div
      className={"w-full min-h-full py-32 px-16 bg-gray-50 dark:bg-gray-900"}
    >
      <Navigation />

      <div className={"w-full max-w-[50rem] mx-auto"}>
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}

function Navigation() {
  const navigate = useNavigate();

  return (
    <div
      className={classNames(
        "w-full fixed left-0 top-0 z-50",
        "px-16 py-4",
        "bg-white dark:bg-gray-800 border-b border-gray-200 shadow",
      )}
    >
      <div
        className={
          "w-full max-w-[60rem] mx-auto flex flex-row items-center justify-between"
        }
      >
        <button
          className={"flex flex-row gap-4 items-center"}
          onClick={() => {
            navigate(getProductPageLink());
          }}
        >
          <CuteCat className={"w-[3rem]"} />
          <h1 className={"text-xl font-semibold"}>Pan'n'Zoom</h1>
        </button>

        <div>
          <button
            className={"btn btn-sm btn-neutral flex-nowrap whitespace-nowrap"}
            onClick={() => {
              navigate(getProjectListLink());
            }}
          >
            Open app <IonIcon name={"chevron-forward-outline"} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className={"mt-24"}>
      <hr className={"mb-8"} />
      <div
        className={"flex flex-row items-center justify-center gap-4 flex-wrap"}
      >
        <Link className={"btn btn-sm"} to={"/privacy-policy"}>
          Privacy Policy
        </Link>

        <a className={"btn btn-sm"} href={"https://peter-kuhmann.de/imprint"}>
          Imprint
        </a>
      </div>
    </div>
  );
}
