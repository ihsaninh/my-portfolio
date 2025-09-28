import FooterGuard from "@/src/shared/components/FooterGuard";
import Header from "@/src/shared/components/Header";

interface PortfolioLayoutProps {
  children: React.ReactNode;
}

export default function PortfolioLayout({ children }: PortfolioLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="py-8 mt-0 lg:mt-8">{children}</main>
      <FooterGuard />
    </div>
  );
}