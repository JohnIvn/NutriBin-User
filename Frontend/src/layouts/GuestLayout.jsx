import Header from "@/components/partials/Header"
import Footer from "@/components/partials/Footer"
import PageRouter from "./PageRouter"

export default function GuestLayout() {
    return (
        <section className="min-h-screen w-full flex flex-col justify-start items-center h-auto bg-[#FFF5E4]">
            <Header/>
            <PageRouter/>
            <Footer/>
        </section>
    )
}