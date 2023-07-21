import ShortcutsTable from "@/components/ShortcutsTable.tsx";

export default function ProjectPresentShortcuts() {
  return (
    <ShortcutsTable
      shortcuts={[
        {
          keys: ["Esc"],
          explanation: "Exit presentation mode + exit fullscreen mode",
        },
        { keys: ["F"], explanation: "Toggle fullscreen mode on + off" },
        { keys: ["#AL"], explanation: "Previous keyframe" },
        { keys: ["#AR"], explanation: "Next keyframe" },
        { keys: ["#SHIFT", "#AL"], explanation: "First keyframe" },
        { keys: ["#SHIFT", "#AR"], explanation: "Last keyframe" },
      ]}
    />
  );
}
