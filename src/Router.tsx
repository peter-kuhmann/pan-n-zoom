import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import IndexLayout from "./routes/app/IndexLayout.tsx";
import IndexPage from "./routes/app/IndexPage.tsx";
import CreateProjectPage from "@/routes/app/project/create/CreatePage.tsx";
import PresentProjectPage from "@/routes/app/project/pesent/PresentProjectPage.tsx";
import ProductPage from "@/routes/ProductPage.tsx";
import SettingsPage from "@/routes/app/settings/SettingsPage.tsx";
import HelpPage from "@/routes/app/help/HelpPage.tsx";
import ImportPage from "@/routes/app/import/ImportPage.tsx";
import ExportPage from "@/routes/app/export/ExportPage.tsx";
import { useEffect } from "react";
import { EditProjectPageLayout } from "@/routes/app/project/EditProjectPageLayout.tsx";
import EditProjectKeyframesTab from "@/components/project/tabs/EditProjectKeyframesTab.tsx";
import EditProjectSettingsTabs from "@/components/project/tabs/EditProjectSettingsTab.tsx";
import ProductLayout from "@/routes/ProductLayout.tsx";
import PrivacyPolicyPage from "@/routes/privacy-policy/PrivacyPolicyPage.tsx";
import ShortcutsPage from "@/routes/app/shortcuts/ShortcutsPage.tsx";
import { getProjectOverviewLink } from "@/navigation/links.ts";
import { isRunningStandalone } from "@/utils/standalone.ts";
import { ResetPage } from "@/routes/app/reset/ResetPage.tsx";
import DevEmbedPage from "@/routes/dev/embed/DevEmbedPage.tsx";

const router = createBrowserRouter([
  {
    path: "/dev",
    element: <Outlet />,
    children: [{ path: "embed", element: <DevEmbedPage /> }],
  },
  {
    path: "/",
    element: isRunningStandalone ? (
      <Redirect to={getProjectOverviewLink()} />
    ) : (
      <ProductLayout />
    ),
    children: [
      { path: "", element: <ProductPage /> },
      { path: "privacy-policy", element: <PrivacyPolicyPage /> },
    ],
  },
  {
    path: "/app/project/:projectId/present/:keyframeId?",
    element: <PresentProjectPage />,
  },
  {
    path: "/app/project/:projectId",
    element: <EditProjectPageLayout />,
    children: [
      { path: "", element: <EditProjectKeyframesTab /> },
      { path: "settings", element: <EditProjectSettingsTabs /> },
    ],
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
        ],
      },
      { path: "settings", element: <SettingsPage /> },
      { path: "export", element: <ExportPage /> },
      { path: "import", element: <ImportPage /> },
      { path: "shortcuts", element: <ShortcutsPage /> },
      { path: "help", element: <HelpPage /> },
      { path: "reset", element: <ResetPage /> },
    ],
  },
]);

function Redirect({ to }: { to: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to);
  }, [to, navigate]);

  return <>Redirecting ...</>;
}

export default function Router() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
