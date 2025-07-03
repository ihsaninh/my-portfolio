import Home from "@/src/components/home";
import Resume from "@/src/components/resume";
import Work from "@/src/components/work";
import Contact from "@/src/components/contact";

const sections = [Home, Resume, Work, Contact];

export default function IndexPage() {
  return (
    <>
      {sections.map((Section, index) => (
        <Section key={index} />
      ))}
    </>
  );
}
