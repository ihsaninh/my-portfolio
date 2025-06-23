interface Props {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function ResumeContent({ title, description, children }: Props) {
  return (
    <div>
      <h3 className="text-2xl lg:text-3xl">{title}</h3>
      <p className="pt-4">{description}</p>
      {children}
    </div>
  );
}
