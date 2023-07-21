import SKC, { type SKCKey } from "@/components/SKC.tsx";

export interface ShortcutsTableProps {
  shortcuts: Array<{
    keys: SKCKey[];
    explanation: string;
  }>;
}

export default function ShortcutsTable({ shortcuts }: ShortcutsTableProps) {
  return (
    <table className={"table"}>
      <thead>
        <tr className={"text-lg"}>
          <td>Shortcut</td>
          <td>Explanation</td>
        </tr>
      </thead>
      <tbody>
        {shortcuts.map((shortcut, index) => {
          return (
            <tr key={`${index}-${JSON.stringify(shortcut)}`}>
              <td>
                <SKC keys={shortcut.keys} />
              </td>
              <td>{shortcut.explanation}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
