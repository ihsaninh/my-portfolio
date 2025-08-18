import BlogSection from "@/src/components/blog";
import Contact from "@/src/components/contact";
import Home from "@/src/components/home";
import Resume from "@/src/components/resume";
import Work from "@/src/components/work";

const sections = [Home, Resume, Work, BlogSection, Contact];

export default function IndexPage() {
  return (
    <>
      {sections.map((Section, index) => (
        <Section key={index} />
      ))}
    </>
  );
}
