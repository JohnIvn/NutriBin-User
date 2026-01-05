import GuestHeader from "@/components/partials/GuestHeader"
import GuestFooter from "@/components/partials/GuestFooter"
import GuestPageRouter from "./GuestPageRouter"

export default function GuestLayout() {
    return (
        <section className="min-h-screen w-full flex flex-col justify-start items-center h-auto bg-[#FFF5E4]">
            <GuestHeader/>
            <GuestPageRouter/>
            <GuestFooter/>
        </section>
    )
}