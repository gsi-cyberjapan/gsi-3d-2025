import { Sidebar } from "@/components/custom/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Header } from "@/components/custom/header";

const MapLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SidebarProvider>
      <Sidebar />
      <main className="w-full h-dvh flex flex-col">
        <Header sidebarTrigger={<SidebarTrigger />} />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default MapLayout;
