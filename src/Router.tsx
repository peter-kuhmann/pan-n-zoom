import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import IndexLayout from "./routes/app/IndexLayout.tsx";
import IndexPage from "./routes/app/IndexPage.tsx";
import CreateProjectPage from "@/routes/app/projects/create/CreatePage.tsx";
import EditorPage from "@/routes/app/projects/EditorPage.tsx";
import PresentProjectPage from "@/routes/app/projects/pesent/PresentProjectPage.tsx";
import ProductPage from "@/routes/ProductPage.tsx";
import SettingsPage from "@/routes/app/settings/SettingsPage.tsx";
import HelpPage from "@/routes/app/help/HelpPage.tsx";
import ImportPage from "@/routes/app/import/ImportPage.tsx";
import ExportPage from "@/routes/app/export/ExportPage.tsx";
import { useEffect } from "react";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProductPage />,
  },
  {
    path: "/app/projects/:projectId/present/:keyframeId?",
    element: <PresentProjectPage />,
  },
  {
    path: "/app",
    element: <IndexLayout />,
    children: [
      { path: "", element: <IndexPage /> },
      {
        path: "project",
        children: [
          { path: "", element: <Redirect to={"/app"} /> },
          { path: "create", element: <CreateProjectPage /> },
          { path: ":projectId", element: <EditorPage /> },
        ],
      },
      { path: "settings", element: <SettingsPage /> },
      { path: "export", element: <ExportPage /> },
      { path: "import", element: <ImportPage /> },
      { path: "help", element: <HelpPage /> },
    ],
  },
]);

function Redirect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  }, [to]);
  return <>Redirecting ...</>;
}

export default function Router() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
