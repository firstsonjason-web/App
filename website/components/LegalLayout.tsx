type LegalLayoutProps = {
  title: string;
  updated: string;
  effective: string;
  children: React.ReactNode;
};

export default function LegalLayout({
  title,
  updated,
  effective,
  children,
}: LegalLayoutProps) {
  return (
    <div className="bg-lumo-ink pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h1>
        <div className="mt-4 space-y-1 text-sm text-text-secondary">
          <p>
            <strong className="text-white/80">Last updated:</strong> {updated}
          </p>
          <p>
            <strong className="text-white/80">Effective:</strong> {effective}
          </p>
        </div>
        <div className="prose prose-invert mt-12 max-w-none space-y-8 text-text-secondary prose-headings:text-white prose-a:text-lumo-teal prose-strong:text-white">
          {children}
        </div>
      </div>
    </div>
  );
}
