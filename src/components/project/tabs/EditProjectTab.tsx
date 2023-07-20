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
    <div className={"h-full p-4 w-[18rem] flex flex-col"}>
      <h1 className={"text-xl font-semibold mb-8"}>{title}</h1>
      <div className={"flex-grow h-1 overflow-y-auto"}>{children}</div>
    </div>
  );
}
