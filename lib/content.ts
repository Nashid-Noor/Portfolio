import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content");

export interface SiteContent {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  avatar: string;
  location: string;
  socials: {
    github: string;
    linkedin: string;
    x: string;
    email: string;
  };
  highlights: string;
  currentFocus: string[];
  navigation: { label: string; href: string }[];
}

export interface ResumeContent {
  summary: string;
  experience: {
    company: string;
    role: string;
    period: string;
    location: string;
    highlights: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    focus: string;
    period: string;
  }[];

  skills: {
    programming: string[];
    frameworks: string[];
    cloud_mlops: string[];
    llm: string[];
    ml: string[];
  };
  pdfUrl: string;
}

export interface ProjectMetrics {
  [key: string]: string;
}

export interface Project {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  problemStatement: string;
  solution: string;
  impact: string[];
  metrics: ProjectMetrics;
  techStack: string[];
  tags: string[];
  featured: boolean;

  status: string;
  githubUrl: string | null;
  demoUrl: string | null;
  links: { label: string; url: string }[];
}

export interface ProjectsContent {
  projects: Project[];
}

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(contentDir, filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent) as T;
}

export function getSiteContent(): SiteContent {
  return readJsonFile<SiteContent>("site.json");
}

export function getResumeContent(): ResumeContent {
  return readJsonFile<ResumeContent>("resume.json");
}

export function getProjectsContent(): ProjectsContent {
  return readJsonFile<ProjectsContent>("projects.json");
}

export function getProjectBySlug(slug: string): Project | null {
  const { projects } = getProjectsContent();
  return projects.find((p) => p.slug === slug) || null;
}

export function getFeaturedProjects(): Project[] {
  const { projects } = getProjectsContent();
  return projects.filter((p) => p.featured);
}

export function getAllSkills(): ResumeContent["skills"] {
  const resume = getResumeContent();
  return resume.skills;
}

export function searchContent(query: string): {
  type: string;
  title: string;
  content: string;
  url: string;
}[] {
  const results: { type: string; title: string; content: string; url: string }[] = [];
  const lowerQuery = query.toLowerCase();
  const baseUrl = process.env.PORTFOLIO_BASE_URL || "http://localhost:3000";

  const site = getSiteContent();
  if (
    site.bio.toLowerCase().includes(lowerQuery) ||
    site.highlights.toLowerCase().includes(lowerQuery)
  ) {
    results.push({
      type: "about",
      title: "About " + site.name,
      content: site.bio,
      url: `${baseUrl}/about`,
    });
  }

  const resume = getResumeContent();
  if (resume.summary.toLowerCase().includes(lowerQuery)) {
    results.push({
      type: "resume",
      title: "Resume Summary",
      content: resume.summary,
      url: `${baseUrl}/resume`,
    });
  }

  resume.experience.forEach((exp) => {
    if (
      exp.company.toLowerCase().includes(lowerQuery) ||
      exp.role.toLowerCase().includes(lowerQuery) ||
      exp.highlights.some((h) => h.toLowerCase().includes(lowerQuery))
    ) {
      results.push({
        type: "experience",
        title: `${exp.role} at ${exp.company}`,
        content: exp.highlights.join(". "),
        url: `${baseUrl}/resume`,
      });
    }
  });

  const { projects } = getProjectsContent();
  projects.forEach((project) => {
    if (
      project.title.toLowerCase().includes(lowerQuery) ||
      project.description.toLowerCase().includes(lowerQuery) ||
      project.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
      project.techStack.some((t) => t.toLowerCase().includes(lowerQuery))
    ) {
      results.push({
        type: "project",
        title: project.title,
        content: project.shortDescription,
        url: `${baseUrl}/projects/${project.slug}`,
      });
    }
  });

  const allSkills = Object.values(resume.skills).flat();
  const matchedSkills = allSkills.filter((s) => s.toLowerCase().includes(lowerQuery));
  if (matchedSkills.length > 0) {
    results.push({
      type: "skills",
      title: "Skills",
      content: `Matching skills: ${matchedSkills.join(", ")}`,
      url: `${baseUrl}/about`,
    });
  }

  return results;
}
