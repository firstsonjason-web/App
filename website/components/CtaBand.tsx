import SectionReveal from "@/components/SectionReveal";
import AppStoreButton from "@/components/AppStoreButton";

type CtaBandProps = {
  title?: string;
  description?: string;
};

export default function CtaBand({
  title = "Ready to meet Lumo?",
  description = "Available on iPhone. Requires iOS 17 or later.",
}: CtaBandProps) {
  return (
    <section id="download" className="relative overflow-hidden py-24">
      <div
        className="absolute inset-0 bg-gradient-to-br from-lumo-mid/30 via-lumo-deep/50 to-lumo-ink"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <SectionReveal>
          <h2 className="text-3xl font-bold text-white md:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-md text-text-secondary">{description}</p>
          <div className="mt-8 flex justify-center">
            <AppStoreButton />
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
