import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import Rootlayout from './Layout/Rootlayout'
import Login from './Page/Login'
import Home from './Page/Home'
import Wallets from './Page/Wallets'
import Budget from './Page/Budget'
import Settings from './Page/Settings'
import Minigame from './Page/Minigame'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <Rootlayout />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/wallets', element: <Wallets /> },
          { path: '/budget', element: <Budget /> },
          { path: '/settings', element: <Settings /> },
          { path: '/minigame', element: <Minigame /> },
        ],
      },
    ],
  },
])

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}
