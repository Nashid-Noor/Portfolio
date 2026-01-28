import Link from "next/link";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";
import { getSiteContent, getFeaturedProjects, getResumeContent } from "@/lib/content";
import { ProjectCard } from "@/components/project-card";
import { SkillBadge } from "@/components/skill-badge";
import { Typewriter } from "@/components/ui/typewriter";
import { HeroSection } from "@/components/hero-section";
import { XIcon } from "@/components/icons";

export default function HomePage() {
  const site = getSiteContent();
  const featuredProjects = getFeaturedProjects();
  const resume = getResumeContent();
  const allSkills = Object.values(resume.skills).flat().slice(0, 12);

  const socialIcons: Record<string, React.ReactNode> = {
    github: <Github className="w-5 h-5" />,
    linkedin: <Linkedin className="w-5 h-5" />,
    x: <XIcon className="w-4 h-4 p-[1px]" />,
    email: <Mail className="w-5 h-5" />,
  };

  return (
    <div className="flex-1 flex flex-col">
      <HeroSection site={site} />
    </div>
  );
}
