import CuteCatImg from "@/assets/Cat.svg";
import * as classNames from "classnames";

export interface CuteCatProps {
  className?: string;
}

export default function CuteCat({ className }: CuteCatProps) {
  return <img src={CuteCatImg} className={classNames(className)}></img>;
}
