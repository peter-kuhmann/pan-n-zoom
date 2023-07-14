import { useState } from "react";
import * as classNames from "classnames";
import KeyframesTab from "@/components/project/editorTabs/KeyframesTab.tsx";
import SettingsTab from "@/components/project/editorTabs/SettingsTab.tsx";

export default function EditorSidebar({ projectId }: { projectId: string }) {
  const [view, setView] = useState<"keyframes" | "settings">("keyframes");

  return (
    <div className={"h-full flex flex-col px-4 py-4"}>
      <div className={"border-b border-b-gray-400 pb-4"}>
        <div className="tabs tabs-boxed w-full">
          <button
            onClick={() => {
              setView("keyframes");
            }}
            className={classNames("tab", {
              "tab-active": view === "keyframes",
            })}
          >
            Keyframes
          </button>

          <button
            onClick={() => {
              setView("settings");
            }}
            className={classNames("tab", {
              "tab-active": view === "settings",
            })}
          >
            Settings
          </button>
        </div>
      </div>

      <div className={"h-1 flex-grow pt-4"}>
        {view === "keyframes" ? (
          <KeyframesTab projectId={projectId} />
        ) : (
          <SettingsTab />
        )}
      </div>
    </div>
  );
}
