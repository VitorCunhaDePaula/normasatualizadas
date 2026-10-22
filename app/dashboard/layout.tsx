import { Suspense } from "react";
import InternalHeader from "@/components/InternalHeader";
import InternalFooter from "@/components/InternalFooter";

export default function TabelasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-theme flex flex-1 flex-col">
      <div
        aria-hidden
        className="fixed inset-y-0 left-0 z-5 w-2"
        style={{
          background:
            "linear-gradient(#f5e30a 0 25%,#c8102e 25% 40%,#e4002b 40% 70%,#8f0c1d 70% 85%,#bfeee8 85%)",
        }}
      />
      <Suspense fallback={<div className="h-[66px] bg-(--app-card)" />}>
        <InternalHeader />
      </Suspense>
      <div className="flex flex-1 flex-col">{children}</div>
      <InternalFooter />
    </div>
  );
}
