import CuteCatLightThme from "@/assets/CuteCatLightThme.svg";
import CuteCatDarkTheme from "@/assets/CuteCatDarkTheme.svg";
import * as classNames from "classnames";

export interface CuteCatProps {
  className?: string;
}

export default function CuteCat({ className }: CuteCatProps) {
  return (
    <>
      <img
        src={CuteCatLightThme}
        className={classNames("dark:hidden", className)}
      ></img>
      <img
        src={CuteCatDarkTheme}
        className={classNames("hidden dark:inline-block", className)}
      ></img>
    </>
  );
}
