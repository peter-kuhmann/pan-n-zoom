export default function IndexPage() {
  return (
    <div className={"p-16 flex flex-col justify-center h-full"}>
      <h1 className={"font-bold text-4xl text-center"}>Pan'n'Zoom</h1>
      <EmptyState />
    </div>
  );
}

function EmptyState() {
  return (
    <div className={"pt-16 flex flex-col items-center gap-8"}>
      <div>Welcome to Pan'n'Zoom. You don't have any projects yet.</div>
      <button className={"btn"}>Create your first project 🎉</button>
    </div>
  );
}
