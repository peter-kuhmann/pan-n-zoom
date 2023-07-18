import Sidebar from "../../components/Sidebar.tsx";
import { Outlet } from "react-router-dom";
import * as classNames from "classnames";

export default function IndexLayout() {
  return (
    <div className={"flex flex-row h-full bg-gray-50 dark:bg-gray-900"}>
      <div className={"w-fit h-full"}>
        <Sidebar />
      </div>

      <div className={"w-1 flex-grow h-full p-6"}>
        <div
          className={classNames(
            "w-full h-full rounded-lg shadow-lg border overflow-hidden",
            "bg-white border-gray-200",
            "dark:bg-gray-800 dark:border-gray-400",
          )}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
