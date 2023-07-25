import IndexSidebar from "../../components/routes/IndexSidebar.tsx";
import { Outlet } from "react-router-dom";
import classNames from "classnames";

export default function IndexLayout() {
  return (
    <div
      className={
        "flex flex-row h-full bg-gray-50 dark:bg-gray-900 min-w-[820px]"
      }
    >
      <div className={"w-fit h-full"}>
        <IndexSidebar />
      </div>

      <div className={"w-1 flex-grow h-full p-6"}>
        <div
          className={classNames(
            "w-full h-full rounded-xl shadow-lg border overflow-hidden",
            "bg-white border-gray-200",
            "dark:bg-gray-800 dark:border-gray-400",
            "overflow-y-auto",
          )}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
