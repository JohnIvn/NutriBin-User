import PageRouter from "./PageRouter";

export default function MainLayout() {
  return (
    <section className="min-h-screen pt-20 w-full flex flex-col justify-start items-center h-auto bg-[#FFF5E4]">
      <PageRouter />
    </section>
  );
}
