import ShortcutsTable from "@/components/ShortcutsTable.tsx";

export default function ProjectEditShortcuts() {
  return (
    <ShortcutsTable
      shortcuts={[
        { keys: ["#ESC"], explanation: "Stop keyframe creation/editing" },
        {
          keys: ["#PCTRL", "A"],
          explanation: "Add new keyframe",
        },
        {
          keys: ["#PCTRL", "P"],
          explanation: "Start presentation",
        },
      ]}
    />
  );
}
