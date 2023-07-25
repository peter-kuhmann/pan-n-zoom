import { Outlet, useNavigate } from "react-router-dom";
import useWatchSize from "@/hooks/useWatchSize.ts";
import { getProductPageLink } from "@/navigation/links.ts";
import IonIcon from "@/components/IonIcon.tsx";

export interface HideBelowBreakpointLayoutProps {
  breakpoint: number;
}

export default function HideBelowBreakpointLayout({
  breakpoint,
}: HideBelowBreakpointLayoutProps) {
  const navigate = useNavigate();
  const { ref: watchSizeRef, width: containerWidth } = useWatchSize();
  const show = containerWidth >= breakpoint;

  return (
    <div ref={watchSizeRef} className={"w-full h-full"}>
      {show ? (
        <Outlet />
      ) : (
        <div className={"w-full h-full py-16 px-6"}>
          <div
            className={
              "w-full h-full flex flex-col justify-center items-center max-w-[20rem] mx-auto"
            }
          >
            <h1 className={"text-2xl font-semibold text-center mb-8"}>
              App is not optimized for smaller screens 🥲
            </h1>

            <p className={"text-xl leading-relaxed text-center mb-16"}>
              If there is a high demand for a mobile version of the app, send a
              mail to:
              <br />
              <br />
              <a href={"mailto:info@peter-kuhmann.de"} className={"underline"}>
                📬 info@peter-kuhmann.de
              </a>
            </p>

            <button
              className={"btn btn-neutral"}
              onClick={() => {
                navigate(getProductPageLink());
              }}
            >
              <IonIcon name={"chevron-back-outline"} /> Back to start
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
