import SectionReveal from "@/components/SectionReveal";

type PageHeaderProps = {
  title: string;
  description: string;
  centered?: boolean;
};

export default function PageHeader({ title, description, centered }: PageHeaderProps) {
  return (
    <SectionReveal className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h1>
      <p className="mt-5 text-lg leading-relaxed text-text-secondary">{description}</p>
    </SectionReveal>
  );
}
