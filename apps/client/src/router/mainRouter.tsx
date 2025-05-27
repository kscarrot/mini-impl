import { createBrowserRouter } from "react-router";
import Home from "src/page/Home";
import Error from "src/page/Error";
import List from "src/page/List";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/list",
    element: <List />,
  },
  {
    path: "*",
    element: <Error />,
  },
]);

export default router;
