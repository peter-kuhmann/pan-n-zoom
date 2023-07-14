import SidebarFooter from "./sidebar/SidebarFooter.tsx";
import SidebarProjectList from "./sidebar/SidebarProjectList.tsx";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className={"px-4 py-6 h-full flex flex-col"}>
      <div className={"pb-4 border-b border-b-gray-400"}>
        <h1
          className={"font-bold text-2xl cursor-pointer"}
          onClick={() => {
            navigate("/");
          }}
        >
          Pan'n'Zoom
        </h1>
      </div>

      <div className={"py-4 flex-grow h-full"}>
        <SidebarProjectList />
      </div>

      <div className={"pt-4 border-t border-t-gray-400"}>
        <SidebarFooter />
      </div>
    </div>
  );
}
