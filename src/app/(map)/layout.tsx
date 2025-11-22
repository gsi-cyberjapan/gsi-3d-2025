import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui";

const MapLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="h-dvh flex flex-col">
      <Header />
      <SidebarProvider>
        <Sidebar />
        <main className="relative">
          <SidebarTrigger className="absolute top-1 left-1" />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
};

export default MapLayout;
