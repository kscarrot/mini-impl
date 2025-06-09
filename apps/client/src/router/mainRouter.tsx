import { createBrowserRouter } from 'react-router';
import Home from 'src/page/Home';
import Error from 'src/page/Error';
import List from 'src/page/List';
import VueComponent from 'src/page/VueComponent';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/list',
    element: <List />,
  },
  {
    path: '/vue2-login',
    element: <VueComponent />,
  },
  {
    path: '*',
    element: <Error />,
  },
]);

export default router;
