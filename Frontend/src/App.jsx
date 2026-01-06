import './App.css'
import { BrowserRouter } from "react-router-dom"
import GuestLayout from "@/layouts/GuestLayout"
import MainLayout from './layouts/MainLayout'

export default function App() {
  const isAuthenticated = true //scaffold for auth

  return (
    <BrowserRouter>
      {isAuthenticated ? <MainLayout/> : <GuestLayout/>}
    </BrowserRouter>
  )
}