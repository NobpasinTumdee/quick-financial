import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

const Rootlayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default Rootlayout
