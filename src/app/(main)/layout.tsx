import React, { ReactNode } from "react";
import ResponsiveHeader from "@/shared/components/header/Header";
import NavSection from "@/shared/components/nav/NavSection";
import Footer from "@/shared/components/footer/Footer";

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col justify-center w-full h-full relative">
      <ResponsiveHeader />

      <div className="flex h-full w-full">
        <NavSection />

        <div className="bg-background flex-1 text-foreground transition-colors duration-500 ease flex flex-col w-full min-h-[100dvh]">
          <main className="flex-1 w-full flex flex-col">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
