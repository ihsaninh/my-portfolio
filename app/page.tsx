import BlogSection from "@/src/components/blog";
import Home from "@/src/components/home";
import ContactSection from "@/src/components/lazy/ContactSection";
import ResumeSection from "@/src/components/lazy/ResumeSection";
import SkillsSection from "@/src/components/lazy/SkillsSection";
import WorkSection from "@/src/components/lazy/WorkSection";

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