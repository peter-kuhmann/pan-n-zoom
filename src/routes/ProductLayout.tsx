import { Link, Outlet, useNavigate } from "react-router-dom";
import classNames from "classnames";
import {
  getProductPageLink,
  getProjectOverviewLink,
} from "@/navigation/links.ts";
import CuteCat from "@/components/cat/CuteCat.tsx";
import IonIcon from "@/components/IonIcon.tsx";

export default function ProductLayout() {
  return (
    <div
      className={classNames(
        "w-full min-h-full bg-gray-50 dark:bg-gray-900",
        "py-32 px-6 md:px-16",
      )}
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
        "px-4 md:px-16 py-4",
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
          <h1 className={"max-sm:hidden text-xl font-semibold"}>Pan'n'Zoom</h1>
        </button>

        <div className={"flex flex-row items-center gap-4 md:gap-8"}>
          <a
            href={"https://github.com/peter-kuhmann/pan-n-zoom"}
            target={"_blank"}
            rel={"noreferrer"}
            className={"text-2xl"}
          >
            <IonIcon name={"logo-github"} />
          </a>

          <button
            className={"btn btn-sm btn-outline flex-nowrap whitespace-nowrap"}
            onClick={() => {
              navigate("/viewer");
            }}
          >
            Viewer
          </button>

          <button
            className={"btn btn-sm btn-neutral flex-nowrap whitespace-nowrap"}
            onClick={() => {
              navigate(getProjectOverviewLink());
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
