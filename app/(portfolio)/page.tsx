import BlogSection from "@/src/features/portfolio/components/blog";
import Home from "@/src/features/portfolio/components/home";
import ContactSection from "@/src/features/portfolio/components/lazy/ContactSection";
import ResumeSection from "@/src/features/portfolio/components/lazy/ResumeSection";
import SkillsSection from "@/src/features/portfolio/components/lazy/SkillsSection";
import WorkSection from "@/src/features/portfolio/components/lazy/WorkSection";

export default function IndexPage() {
  return (
    <>
      <Home />
      <ResumeSection />
      <SkillsSection />
      <WorkSection />
      <BlogSection />
      <ContactSection />
    </>
  );
}