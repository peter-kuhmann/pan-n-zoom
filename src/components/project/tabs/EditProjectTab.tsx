import React from "react";
import classNames from "classnames";

export interface EditProjectTabProps {
  title: string;
  children?: React.ReactNode;
  bigger?: boolean;
}

export default function EditProjectTab({
  title,
  children,
  bigger,
}: EditProjectTabProps) {
  return (
    <div
      className={classNames("h-full p-4  flex flex-col overflow-y-auto", {
        "w-[18rem]": !bigger,
        "w-[30rem]": bigger,
      })}
    >
      <h1 className={"text-xl font-semibold mb-8"}>{title}</h1>
      <div className={""}>{children}</div>
    </div>
  );
}
