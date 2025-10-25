import React from "react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";
import FoodLystNavbar from "@/components/manual/Navbar";
import AppWalletProvider from "@/components/manual/AppWalletProvider";
import { WebSocketProvider } from "@/components/manual/WebSocketProvider";


export default function MyLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <AppWalletProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <WebSocketProvider>
                        <FoodLystNavbar />
                    </WebSocketProvider>
                    {children}
                </ThemeProvider>
                <Toaster />
            </AppWalletProvider>
        </div>
    );
}
