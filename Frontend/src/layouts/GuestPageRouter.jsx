import Login from "@/pages/Login"
import Register from "@/pages/Register"
import AboutUs from "@/pages/AboutUs"
import FAQ from "@/pages/FAQ"
import Home from "@/pages/Home"
import TOS from "@/pages/TOS"
import Socials from "@/pages/Socials"
import Studies from "@/pages/Studies"
import Guide from "@/pages/Guide"
import Fertilizer from "@/pages/Fertilizer"
import Modules from "@/pages/Modules"
import { Routes, Route, Navigate } from "react-router-dom"

export default function GuestPageRouter () {
    return (
        <Routes>
            <Route path="*" element={<h1>ERROR 401</h1>} />
            <Route 
                path='/'
                element={<Navigate replace to={'/home'}/>}
            />
            <Route 
                path='/home'
                element={<Home/>}
            />
            <Route 
                path='/login'
                element={<Login/>}
            />
            <Route 
                path='/register'
                element={<Register/>}
            />
            <Route 
                path='/about'
                element={<AboutUs/>}
            />
            <Route
                path='/terms'
                element={<TOS/>}
            />
            <Route 
                path='/faqs'
                element={<FAQ/>}
            />
            <Route 
                path='/socials'
                element={<Socials/>}
            />
            <Route 
                path='/studies'
                element={<Studies/>}
            />
            <Route
                path='/guide'
                element={<Guide/>}
            />
      <Route
        path="/fertilizer"
        element={
            <Fertilizer />
        }
      />
      <Route
        path="/modules"
        element={
            <Modules />
        }
      />
        </Routes>
    )
} 