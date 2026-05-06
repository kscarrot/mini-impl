import { createBrowserRouter } from 'react-router'
import AudioASR from 'src/page/AudioASR'
import Error from 'src/page/Error'
import Home from 'src/page/Home'
import List from 'src/page/List'
import VueComponent from 'src/page/VueComponent'

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
    path: '/audio-asr',
    element: <AudioASR />,
  },
  {
    path: '*',
    element: <Error />,
  },
])

export default router
