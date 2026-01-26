import BlogSection from "@/src/features/portfolio/components/blog";
import Home from "@/src/features/portfolio/components/home";
import ContactSection from "@/src/features/portfolio/components/lazy/ContactSection";
import SkillsSection from "@/src/features/portfolio/components/lazy/SkillsSection";
import WorkSection from "@/src/features/portfolio/components/lazy/WorkSection";

export default function IndexPage() {
  return (
    <>
      <Home />
      <SkillsSection />
      <WorkSection />
      <BlogSection />
      <ContactSection />
    </>
  );
}
