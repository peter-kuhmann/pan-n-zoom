import CuteCat from "@/components/cat/CuteCat.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import { useNavigate } from "react-router-dom";
import DemoImage from "@/assets/DemoImage.webp";

import PeterKuhmannLogoLightTheme from "@/assets/PeterKuhmann_logo_light_theme.webp";
import PeterKuhmannLogoDarkTheme from "@/assets/PeterKuhmann_logo_dark_theme.webp";

import "./ProductPage.scss";
import classNames from "classnames";

export default function ProductPage() {
  return (
    <>
      <Hero />
      <Demo />
      <PeterKuhmann />
    </>
  );
}

function Hero() {
  const navigate = useNavigate();

  return (
    <div className={"flex flex-col items-center mb-28"}>
      <div
        className={
          "flex flex-row items-center justify-center gap-16 mb-8 flex-wrap"
        }
      >
        <div>
          <CuteCat className={"w-full max-w-[14rem]"} />
        </div>

        <div className={"pt-6 max-w-[20rem]"}>
          <h1 className={"text-5xl font-bold mb-6"}>Pan'n'Zoom</h1>

          <div className={"flex flex-row items-center gap-2 mb-8 flex-wrap"}>
            <div
              className={
                "bg-emerald-300 dark:bg-emerald-600 font-semibold px-3 py-0.5 rounded-lg"
              }
            >
              Free <IonIcon name={"wallet-outline"} />
            </div>

            <div
              className={
                "bg-blue-300 dark:bg-blue-600 font-semibold px-3 py-0.5 rounded-lg"
              }
            >
              Works offline <IonIcon name={"cloud-offline-outline"} />
            </div>

            <div
              className={
                "bg-violet-300 dark:bg-violet-600 font-semibold px-3 py-0.5 rounded-lg"
              }
            >
              No account needed <IonIcon name={"shield-half-outline"} />
            </div>
          </div>
        </div>
      </div>

      <p className={"max-w-[30rem] text-2xl mb-12 text-center"}>
        The smartest tool to animate panning and zooming within your images.
      </p>

      <button
        className={"btn px-16 btn-neutral"}
        onClick={() => {
          navigate("/app");
        }}
      >
        Open app <IonIcon name={"chevron-forward-outline"} />
      </button>
    </div>
  );
}

function Demo() {
  return (
    <div className={"drop-shadow-2xl mx-auto"}>
      <div
        className={classNames(
          "flex flex-row items-center gap-4",
          "px-6 py-3 rounded-t-xl relative",
          "bg-gray-800 dark:bg-gray-200",
        )}
      >
        <div className={"w-[1rem] h-[1rem] bg-red-500 rounded-badge"} />
        <div className={"w-[1rem] h-[1rem] bg-yellow-500 rounded-badge"} />
        <div className={"w-[1rem] h-[1rem] bg-green-500 rounded-badge"} />
        <div
          className={
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white dark:text-gray-800 left"
          }
        >
          Pan'n'Zoom Demo
        </div>
      </div>

      <div
        className={classNames(
          "w-full aspect-[16/10] relative p-4 overflow-hidden rounded-b-xl",
          "border-l-4 border-b-4 border-r-4 bg-gray-100 border-gray-800",
          "dark:bg-gray-800 dark:border-gray-200",
        )}
      >
        <img className={"demoImage"} src={DemoImage} />
      </div>
    </div>
  );
}

function PeterKuhmann() {
  return (
    <div className={"flex flex-col items-center gap-12 mt-40"}>
      <h1 className={"font-semibold text-5xl"}>Crafted by</h1>

      <a href={"https://peter-kuhmann.de"} target={"_blank"} rel="noreferrer">
        <img
          src={PeterKuhmannLogoLightTheme}
          className={"dark:hidden w-full max-w-[24rem]"}
        />
        <img
          src={PeterKuhmannLogoDarkTheme}
          className={"hidden dark:inline-block w-full max-w-[24rem]"}
        />
      </a>
    </div>
  );
}
