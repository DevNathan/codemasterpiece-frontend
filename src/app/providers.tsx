import React, { ReactNode, Suspense } from "react";
import { SidebarProvider } from "@/shared/components/shadcn/sidebar";
import { Tooltip } from "@/shared/components/shadcn/tooltip";
import ThemeProvider from "@/contexts/ThemeProvider";
import { UserContextProvider } from "@/contexts/UserContext";
import { Toaster as Sooner } from "sonner";
import AuthToastHandler from "@/app/LoginToastHandler";
import RQProvider from "@/contexts/RQProvider";
import { AuthDialogProvider } from "@/contexts/AuthDialogProvider";
import { ImageViewerProvider } from "@/contexts/ImageViewProvider";
import PolicyDialogProvider from "@/contexts/PolicyDialogProvider";

type Props = { children: ReactNode };

export default async function Providers({ children }: Props) {
  return (
    <AuthDialogProvider>
      <UserContextProvider>
        <RQProvider>
          <PolicyDialogProvider>
            <ThemeProvider>
              <SidebarProvider defaultOpen={false}>
                <Tooltip delayDuration={500}>
                  <ImageViewerProvider>
                    <Suspense>
                      <Sooner />
                      <AuthToastHandler />
                    </Suspense>
                    {children}
                  </ImageViewerProvider>
                </Tooltip>
              </SidebarProvider>
            </ThemeProvider>
          </PolicyDialogProvider>
        </RQProvider>
      </UserContextProvider>
    </AuthDialogProvider>
  );
}
