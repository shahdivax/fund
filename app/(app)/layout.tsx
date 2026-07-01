import { BottomNav } from "@/components/layout/bottom-nav";
import { FundProvider } from "@/lib/store/fund-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FundProvider>
        <div className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col pb-16">
          {children}
        </div>
      </FundProvider>
      <BottomNav />
    </>
  );
}
