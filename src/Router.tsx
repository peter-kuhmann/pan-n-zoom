import { createBrowserRouter, RouterProvider } from "react-router-dom";
import IndexLayout from "./routes/IndexLayout.tsx";
import IndexPage from "./routes/IndexPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <IndexLayout />,
    children: [{ path: "", element: <IndexPage /> }],
  },
]);

export default function Router() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
