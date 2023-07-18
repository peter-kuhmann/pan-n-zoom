import { createBrowserRouter, RouterProvider } from "react-router-dom";
import IndexLayout from "./routes/app/IndexLayout.tsx";
import IndexPage from "./routes/app/IndexPage.tsx";
import CreatePage from "@/routes/app/projects/create/CreatePage.tsx";
import EditorPage from "@/routes/app/projects/EditorPage.tsx";
import PresentProjectPage from "@/routes/app/projects/pesent/PresentProjectPage.tsx";
import ProductPage from "@/routes/ProductPage.tsx";

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
