import React from "react";

export interface EditProjectTabProps {
  title: string;
  children?: React.ReactNode;
}

export default function EditProjectTab({
  title,
  children,
}: EditProjectTabProps) {
  return (
    <div className={"h-full p-4 w-[18rem] flex flex-col overflow-y-auto"}>
      <h1 className={"text-xl font-semibold mb-8"}>{title}</h1>
      <div className={""}>{children}</div>
    </div>
  );
}
