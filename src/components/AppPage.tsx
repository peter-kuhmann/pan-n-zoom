export interface AppPageProps {
  title: string;
  children?: React.ReactNode;
}

export default function AppPage({ title, children }: AppPageProps) {
  return (
    <div
      className={"flex flex-col items-start justify-start gap-8 px-16 py-12"}
    >
      <h1 className={"text-4xl font-semibold"}>{title}</h1>
      <div>{children}</div>
    </div>
  );
}
