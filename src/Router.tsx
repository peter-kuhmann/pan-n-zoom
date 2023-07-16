import { createBrowserRouter, RouterProvider } from "react-router-dom";
import IndexLayout from "./routes/IndexLayout.tsx";
import IndexPage from "./routes/IndexPage.tsx";
import CreatePage from "@/routes/projects/create/CreatePage.tsx";
import EditorPage from "@/routes/projects/EditorPage.tsx";
import PresentProjectPage from "@/routes/projects/pesent/PresentProjectPage.tsx";

const router = createBrowserRouter([
  {
    path: "/projects/:projectId/present/:keyframeId?",
    element: <PresentProjectPage />,
  },
  {
    path: "/",
    element: <IndexLayout />,
    children: [
      { path: "", element: <IndexPage /> },
      {
        path: "projects",
        children: [
          { path: "", element: <IndexPage /> },
          { path: "create", element: <CreatePage /> },
          { path: ":projectId", element: <EditorPage /> },
        ],
      },
    ],
  },
]);

export default function Router() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
