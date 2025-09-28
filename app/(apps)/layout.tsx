interface AppsLayoutProps {
  children: React.ReactNode;
}

export default function AppsLayout({ children }: AppsLayoutProps) {
  // Minimal layout for apps - no header/footer, full page experience
  return <div className="isolate">{children}</div>;
}