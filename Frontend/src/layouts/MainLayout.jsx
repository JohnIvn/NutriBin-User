import MainHeader from "@/components/partials/MainHeader";
import MainFooter from "@/components/partials/MainFooter";
import PageRouter from "./PageRouter";

export default function MainLayout() {
  return (
    <section className="min-h-screen w-full flex flex-col justify-start items-center h-auto bg-[#FFF5E4]">
      <MainHeader />
      <PageRouter />
      <MainFooter />
    </section>
  );
}
