import { SidebarProvider } from "#frontx/components/ui/sidebar";
import { ThemeProvider } from "./theme.provider";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider defaultOpen={false}>{children}</SidebarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default Providers;
