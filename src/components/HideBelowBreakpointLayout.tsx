import { Outlet, useNavigate } from "react-router-dom";
import useWatchSize from "@/hooks/useWatchSize.ts";
import { getProductPageLink } from "@/navigation/links.ts";
import IonIcon from "@/components/IonIcon.tsx";
import { useState } from "react";

export interface HideBelowBreakpointLayoutProps {
  breakpoint: number;
}

export default function HideBelowBreakpointLayout({
  breakpoint,
}: HideBelowBreakpointLayoutProps) {
  const navigate = useNavigate();
  const { ref: watchSizeRef, width: containerWidth } = useWatchSize();
  const [stillUseIt, setStillUseIt] = useState(false);
  const show = containerWidth >= breakpoint;

  return (
    <div ref={watchSizeRef} className={"w-full h-full"}>
      {show || stillUseIt ? (
        <Outlet />
      ) : (
        <div className={"w-full h-full overflow-y-auto"}>
          <div
            className={
              "w-full max-w-[20rem] mx-auto my-auto py-16 px-6 flex flex-col items-center"
            }
          >
            <div className={"mb-8 text-4xl text-center"}>
              <IonIcon name={"desktop-outline"} />
            </div>

            <h1 className={"text-2xl font-semibold text-center mb-12"}>
              App is not optimized for smaller screens{" "}
            </h1>

            <button
              className={"btn btn-neutral btn-outline mb-12"}
              onClick={() => {
                setStillUseIt(true);
              }}
            >
              I still want to use the app{" "}
              <IonIcon name={"chevron-forward-outline"} />
            </button>

            <button
              className={"btn btn-neutral mb-20"}
              onClick={() => {
                navigate(getProductPageLink());
              }}
            >
              <IonIcon name={"chevron-back-outline"} /> Back to start
            </button>

            <p className={"text-xl leading-relaxed text-center mb-16"}>
              If there is a high demand for a mobile version of the app, send a
              mail to:
              <br />
              <br />
              <a href={"mailto:info@peter-kuhmann.de"} className={"underline"}>
                📬 info@peter-kuhmann.de
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
