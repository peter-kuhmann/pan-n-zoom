import Sidebar from "../components/Sidebar.tsx";
import { Outlet } from "react-router-dom";

export default function IndexLayout() {
  return (
    <div className={"flex flex-row h-full"}>
      <div className={"w-full max-w-[20rem] h-full border-r border-r-gray-400"}>
        <Sidebar />
      </div>

      <div className={"w-full flex-grow h-full"}>
        <Outlet />
      </div>
    </div>
  );
}
