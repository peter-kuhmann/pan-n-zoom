import CuteCat from "../cat/CuteCat.tsx";

export default function SidebarProjectList() {
  return (
    <>
      <EmptyState />
    </>
  );
}

function EmptyState() {
  return (
    <div className={"h-full flex flex-col gap-8 justify-center items-center"}>
      <div className={"text-lg"}>No projects yet.</div>
      <CuteCat className={"w-full max-w-[7rem]"} />
      <button className={"btn"}>Create one 🎉</button>
    </div>
  );
}
