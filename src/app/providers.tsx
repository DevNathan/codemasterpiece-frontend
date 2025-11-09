import React, { ReactNode, Suspense } from "react";
import { SidebarProvider } from "@/shared/components/shadcn/sidebar";
import { Tooltip } from "@/shared/components/shadcn/tooltip";
import ThemeProvider from "@/contexts/ThemeProvider";
import { UserContextProvider } from "@/contexts/UserContext";
import { Toaster as Sooner } from "sonner";
import AuthToastHandler from "@/app/LoginToastHandler";
import RQProvider from "@/contexts/RQProvider";
import { AuthDialogProvider } from "@/contexts/AuthDialogProvider";

type Props = { children: ReactNode };

export default async function Providers({ children }: Props) {
  return (
    <AuthDialogProvider>
      <UserContextProvider>
        <RQProvider>
          <ThemeProvider>
            <SidebarProvider defaultOpen={false}>
              <Tooltip delayDuration={500}>
                <Suspense>
                  <Sooner />
                  <AuthToastHandler />
                </Suspense>
                {children}
              </Tooltip>
            </SidebarProvider>
          </ThemeProvider>
        </RQProvider>
      </UserContextProvider>
    </AuthDialogProvider>
  );
}
