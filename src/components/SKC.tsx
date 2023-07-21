import { isMacOs } from "@/utils/os.ts";
import IonIcon from "@/components/IonIcon.tsx";

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
}

export default function SKC({ keys }: SKCProps) {
  return (
    <div className={"inline-flex items-center gap-2"}>
      {keys.map((key, index) => {
        return (
          <>
            {index > 0 && <span className={"text-lg"}> + </span>}
            <kbd className={"kbd kbd"}>{ShortcutText(key)}</kbd>
          </>
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
