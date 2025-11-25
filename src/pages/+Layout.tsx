import { ReactNode } from "react";
import "./styles.css";
import { clientOnly } from "vike-react/clientOnly";
import { Toaster } from "#frontx/components/ui/sonner";
import { TailwindIndicator } from "#frontx/components/tailwindIndicator";
import { MenuLayout } from "#frontx/layout/MenuLayout";

const Providers = clientOnly(() => import("#frontx/provider/Providers"));

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Providers>
      <Toaster richColors={true} />
      <div className="min-w-screen min-h-screen">
        <MenuLayout />
        {children}
      </div>
      <TailwindIndicator />
    </Providers>
  );
};
