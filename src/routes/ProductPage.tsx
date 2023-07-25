import CuteCat from "@/components/cat/CuteCat.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import { useNavigate } from "react-router-dom";
import { getProjectOverviewLink } from "@/navigation/links.ts";

import PeterKuhmannLogoLightTheme from "@/assets/PeterKuhmann_logo_light_theme.webp";
import PeterKuhmannLogoDarkTheme from "@/assets/PeterKuhmann_logo_dark_theme.webp";

export default function ProductPage() {
  return (
    <>
      <Hero />
      <Demo />
      <Features />
      <Embed />
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
                "bg-violet-300 dark:bg-violet-600 font-semibold px-3 py-0.5 rounded-lg"
              }
            >
              Anonymous <IonIcon name={"shield-half-outline"} />
            </div>

            <div
              className={
                "bg-amber-300 dark:bg-amber-600 font-semibold px-3 py-0.5 rounded-lg"
              }
            >
              Open Source <IonIcon name={"planet-outline"} />
            </div>

            <div
              className={
                "bg-blue-300 dark:bg-blue-600 font-semibold px-3 py-0.5 rounded-lg"
              }
            >
              Offline Mode <IonIcon name={"cloud-offline-outline"} />
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
          navigate(getProjectOverviewLink());
        }}
      >
        Open app <IonIcon name={"chevron-forward-outline"} />
      </button>
    </div>
  );
}

function Demo() {
  return (
    <div
      className={"mb-32"}
      dangerouslySetInnerHTML={{
        __html: `<pan-n-zoom-present data-theme="system" data-rounded="8px" data-canvas-aspect-ratio="16/9" data-loop="true" data-autoplay="true" data-autoplay-delay="1500" data-export-url="/cross-origin/StarterProject.pannzoom"></pan-n-zoom-present>`,
      }}
    />
  );
}

function Features() {
  const navigate = useNavigate();

  return (
    <div className={"flex flex-col items-start gap-12 mt-28 mb-32"}>
      <h1 className={"font-semibold text-5xl"}>Features</h1>

      <div
        className={
          "grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 w-full justify-between"
        }
      >
        <ul className={"text-2xl"}>
          <Feature>Free and Open Source</Feature>
          <Feature>Data stays in Browser</Feature>
          <Feature>Embeddable in HTML</Feature>
          <Feature>Works Offline</Feature>
          <Feature>Desktop App</Feature>
        </ul>
        <ul className={"text-2xl"}>
          <Feature>Help Videos</Feature>
          <Feature>Export and Import</Feature>
          <Feature>Convenience Functions</Feature>
          <Feature>Light + Dark Mode</Feature>
          <Feature>Excalidraw BFF</Feature>
        </ul>
      </div>

      <button
        className={"btn px-16 btn-neutral"}
        onClick={() => {
          navigate(getProjectOverviewLink());
        }}
      >
        Try it out <IonIcon name={"chevron-forward-outline"} />
      </button>
    </div>
  );
}

function Feature({ children }: { children?: React.ReactNode }) {
  return (
    <li className={"my-4 flex flex-row gap-2 items-start justify-start"}>
      <IonIcon name={"checkmark-circle-outline"} className={"text-green-500"} />
      <span>{children}</span>
    </li>
  );
}

function Embed() {
  return (
    <div className={"mb-32"}>
      <h1 className={"font-semibold text-5xl mb-8"}>
        Embeddable ... but how? 😦
      </h1>

      <p className={"text-2xl mb-8"}>
        <b>It's your data.</b> 🛡️
        <br />
        As your projects are only living in your browser, this app can't give
        someone simply access to one of your projects.
      </p>

      <p className={"text-2xl mb-8"}>
        <b>Still, it works. ⭐️</b>
        <br />
        The following embedded Pan'n'Zoom project explains how it works:
      </p>

      <div
        className={"mb-8"}
        dangerouslySetInnerHTML={{
          __html: `<pan-n-zoom-present data-theme="system" data-rounded="8px" data-canvas-aspect-ratio="16/9" data-export-url="/HowEmbedsWork.pannzoom"></pan-n-zoom-present>`,
        }}
      />
    </div>
  );
}

function PeterKuhmann() {
  return (
    <div className={"flex flex-col items-start gap-12"}>
      <h1 className={"font-semibold text-5xl"}>Crafted by</h1>

      <div className={"flex flex-row flex-wrap gap-6"}>
        <a
          href={"https://peter-kuhmann.de"}
          target={"_blank"}
          rel={"noreferrer"}
          className={"hover:underline"}
        >
          <IonIcon name={"globe-outline"} /> Website
        </a>

        <a
          href={"mailto:info@peter-kuhmann.de"}
          target={"_blank"}
          rel={"noreferrer"}
          className={"hover:underline"}
        >
          <IonIcon name={"mail-outline"} /> Send me a mail
        </a>

        <a
          href={"https://github.com/peter-kuhmann"}
          target={"_blank"}
          rel={"noreferrer"}
          className={"hover:underline"}
        >
          <IonIcon name={"logo-github"} /> GitHub
        </a>

        <a
          href={"https://www.youtube.com/@PeterKuhmann/"}
          target={"_blank"}
          rel={"noreferrer"}
          className={"hover:underline"}
        >
          <IonIcon name={"logo-youtube"} /> YouTube
        </a>

        <a
          href={"https://www.linkedin.com/in/peter-kuhmann/"}
          target={"_blank"}
          rel={"noreferrer"}
          className={"hover:underline"}
        >
          <IonIcon name={"logo-linkedin"} /> LinkedIn
        </a>
      </div>

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
