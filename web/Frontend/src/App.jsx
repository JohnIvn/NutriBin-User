import './App.css'
import { BrowserRouter } from "react-router-dom"
import GuestLayout from "@/layouts/GuestLayout"

export default function App() {
  return (
    <BrowserRouter>
      <GuestLayout/>
    </BrowserRouter>
  )
}