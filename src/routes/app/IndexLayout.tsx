import Sidebar from "../../components/Sidebar.tsx";
import { Outlet } from "react-router-dom";

export default function IndexLayout() {
  return (
    <div className={"flex flex-row h-full bg-gray-50"}>
      <div className={"w-fit h-full"}>
        <Sidebar />
      </div>

      <div className={"w-1 flex-grow h-full p-6"}>
        <div
          className={
            "w-full h-full bg-white rounded-lg shadow-lg border border-gray-200"
          }
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
