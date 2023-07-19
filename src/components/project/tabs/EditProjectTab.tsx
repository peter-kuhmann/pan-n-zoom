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
    <div className={"p-4 min-w-[18rem]"}>
      <h1 className={"text-xl font-semibold mb-8"}>{title}</h1>
      <div>{children}</div>
    </div>
  );
}
