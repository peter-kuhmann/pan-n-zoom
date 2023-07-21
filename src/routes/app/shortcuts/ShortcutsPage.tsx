import AppPage from "@/components/AppPage.tsx";
import ProjectPresentShortcuts from "@/components/routes/shortcuts/ProjectPresentShortcuts.tsx";
import ProjectEditShortcuts from "@/components/routes/shortcuts/ProjectEditShortcuts.tsx";

export default function ShortcutsPage() {
  return (
    <AppPage title={"Shortcuts"}>
      <div className={"mb-8"}>
        <h2 className={"text-2xl mb-4 font-semibold"}>Editor mode</h2>
        <ProjectEditShortcuts />
      </div>

      <div className={"mb-8"}>
        <h2 className={"text-2xl mb-4 font-semibold"}>Presentation mode</h2>
        <ProjectPresentShortcuts />
      </div>
    </AppPage>
  );
}
