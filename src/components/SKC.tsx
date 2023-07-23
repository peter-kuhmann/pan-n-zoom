import { isMacOs } from "@/utils/os.ts";
import IonIcon from "@/components/IonIcon.tsx";
import { Fragment } from "react";
import classNames from "classnames";

export type SKCKey =
  | string
  | "#ESC"
  | "#PCTRL"
  | "#SHIFT"
  | "#AL"
  | "#AT"
  | "#AR"
  | "AD";

export interface SKCProps {
  keys: SKCKey[];
  small?: boolean;
}

export default function SKC({ keys, small }: SKCProps) {
  return (
    <div
      className={classNames("inline-flex items-center", {
        "gap-2": !small,
        "gap-1": small,
      })}
    >
      {keys.map((key, index) => {
        return (
          <Fragment key={`${index}-${key}`}>
            {index > 0 && <span className={"text-lg"}> + </span>}
            <kbd className={classNames("kbd", { "kbd-sm": small })}>
              {ShortcutText(key)}
            </kbd>
          </Fragment>
        );
      })}
    </div>
  );
}

function ShortcutText(key: SKCKey): React.ReactNode {
  switch (key) {
    case "#PCTRL":
      return isMacOs ? "Cmd" : "Ctrl";
    case "#ESC":
      return "Esc";
    case "#SHIFT":
      return "Shift";

    case "#AL":
      return <IonIcon name={"arrow-back-outline"} />;
    case "#AT":
      return <IonIcon name={"arrow-up-outline"} />;
    case "#AR":
      return <IonIcon name={"arrow-forward-outline"} />;
    case "#AD":
      return <IonIcon name={"arrow-down-outline"} />;

    default:
      return key;
  }
}
