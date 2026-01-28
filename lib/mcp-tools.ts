/**
 * Direct MCP Tools Implementation
 * 
 * This module provides the same functionality as the MCP server but as direct
 * function calls. This is more reliable for serverless environments (Vercel)
 * where spawning child processes may not work.
 * 
 * The MCP server (mcp-server/) is still useful for:
 * - Local development with MCP-compatible clients
 * - Desktop apps that use MCP protocol
 * - Testing MCP integration
 */

import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content");

// Types
interface SiteContent {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  avatar: string;
  location: string;
  socials: Record<string, string>;
  highlights: string[];
  currentFocus: string[];
  navigation: { label: string; href: string }[];
}

interface ResumeContent {
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
  certifications: string[];
  skills: {
    programming: string[];
    frameworks: string[];
    cloud_mlops: string[];
    llm: string[];
    ml: string[];
  };
}

interface Project {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  problemStatement: string;
  solution: string;
  impact: string[];
  metrics: Record<string, string>;
  techStack: string[];
  tags: string[];
  featured: boolean;
  date: string;
  status: string;
  githubUrl: string | null;
  demoUrl: string | null;
  links: { label: string; url: string }[];
}

interface ProjectsContent {
  projects: Project[];
}

// Content cache to avoid repeated disk reads
let siteCache: SiteContent | null = null;
let resumeCache: ResumeContent | null = null;
let projectsCache: ProjectsContent | null = null;

function readContent<T>(filename: string): T {
  const filePath = path.join(contentDir, filename);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

function getSite(): SiteContent {
  if (!siteCache) {
    siteCache = readContent<SiteContent>("site.json");
  }
  return siteCache;
}

function getResume(): ResumeContent {
  if (!resumeCache) {
    resumeCache = readContent<ResumeContent>("resume.json");
  }
  return resumeCache;
}

function getProjects(): Project[] {
  if (!projectsCache) {
    projectsCache = readContent<ProjectsContent>("projects.json");
  }
  return projectsCache.projects;
}



// Tool definitions
export const toolDefinitions = [
  {
    name: "search_site",
    description:
      "Search the portfolio website content for relevant information based on a query string. Returns matching sections with URLs.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query to find relevant content",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list_projects",
    description:
      "List all projects in the portfolio with optional filtering by tag and sorting by impact or recency.",
    inputSchema: {
      type: "object" as const,
      properties: {
        tag: {
          type: "string",
          description: "Filter projects by tag (e.g., 'NLP', 'MLOps')",
        },
        sort: {
          type: "string",
          enum: ["impact", "recent"],
          description: "Sort order: 'impact' for featured first, 'recent' for date order",
        },
      },
    },
  },
  {
    name: "get_project",
    description:
      "Get detailed information about a specific project by its slug identifier.",
    inputSchema: {
      type: "object" as const,
      properties: {
        slug: {
          type: "string",
          description: "Project slug identifier (e.g., 'mixture-of-agents-optimizer')",
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "get_skills",
    description:
      "Get all technical skills organized by category (languages, ML frameworks, MLOps tools, cloud platforms, etc.).",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_resume_section",
    description:
      "Get a specific section of the resume: summary, experience history, or education.",
    inputSchema: {
      type: "object" as const,
      properties: {
        section: {
          type: "string",
          enum: ["summary", "experience", "education"],
          description: "Which resume section to retrieve",
        },
      },
      required: ["section"],
    },
  },
  {
    name: "get_contact",
    description: "Get public contact information and social media links.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
];

// Tool implementations
export async function callTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  switch (name) {
    case "search_site": {
      const query = ((args?.query as string) || "").toLowerCase();
      const results: {
        type: string;
        title: string;
        snippet: string;
      }[] = [];

      const site = getSite();
      const resume = getResume();
      const projects = getProjects();

      // Search site info
      if (
        site.bio.toLowerCase().includes(query) ||
        site.name.toLowerCase().includes(query) ||
        site.highlights.some((h) => h.toLowerCase().includes(query))
      ) {
        results.push({
          type: "about",
          title: `About ${site.name}`,
          snippet: site.bio,
        });
      }

      // Search resume
      if (resume.summary.toLowerCase().includes(query)) {
        results.push({
          type: "resume",
          title: "Professional Summary",
          snippet: resume.summary,
        });
      }

      // Search experience
      resume.experience.forEach((exp) => {
        if (
          exp.company.toLowerCase().includes(query) ||
          exp.role.toLowerCase().includes(query) ||
          exp.highlights.some((h) => h.toLowerCase().includes(query))
        ) {
          results.push({
            type: "experience",
            title: `${exp.role} at ${exp.company}`,
            snippet: exp.highlights.slice(0, 2).join(". "),
          });
        }
      });

      // Search projects
      projects.forEach((project) => {
        if (
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.tags.some((t) => t.toLowerCase().includes(query)) ||
          project.techStack.some((t) => t.toLowerCase().includes(query))
        ) {
          results.push({
            type: "project",
            title: project.title,
            snippet: project.shortDescription,
          });
        }
      });

      // Search skills
      const allSkills = Object.values(resume.skills).flat();
      const matchedSkills = allSkills.filter((s) =>
        s.toLowerCase().includes(query)
      );
      if (matchedSkills.length > 0) {
        results.push({
          type: "skills",
          title: "Technical Skills",
          snippet: `Matching skills: ${matchedSkills.join(", ")}`,
        });
      }

      return JSON.stringify({ query, resultsCount: results.length, results }, null, 2);
    }

    case "list_projects": {
      const tag = args?.tag as string | undefined;
      const sort = (args?.sort as "impact" | "recent") || "impact";
      let projects = [...getProjects()];

      // Filter by tag
      if (tag) {
        projects = projects.filter((p) =>
          p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
        );
      }

      // Sort
      if (sort === "impact") {
        projects.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      } else {
        projects.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }

      const projectList = projects.map((p) => ({
        slug: p.slug,
        title: p.title,
        shortDescription: p.shortDescription,
        tags: p.tags,
        metrics: p.metrics,
        featured: p.featured,
        date: p.date,
        status: p.status,
        githubUrl: p.githubUrl,
        demoUrl: p.demoUrl,
      }));

      return JSON.stringify(
        { filters: { tag, sort }, count: projectList.length, projects: projectList },
        null,
        2
      );
    }

    case "get_project": {
      const slug = args?.slug as string;
      if (!slug) {
        return JSON.stringify({ error: "slug is required" });
      }

      const projects = getProjects();
      const project = projects.find((p) => p.slug === slug);

      if (!project) {
        return JSON.stringify({
          error: `Project not found: ${slug}`,
          availableSlugs: projects.map((p) => p.slug),
        });
      }

      return JSON.stringify(
        { ...project },
        null,
        2
      );
    }

    case "get_skills": {
      const resume = getResume();
      return JSON.stringify(
        {
          skills: resume.skills,
          certifications: resume.certifications,
        },
        null,
        2
      );
    }

    case "get_resume_section": {
      const section = args?.section as "summary" | "experience" | "education";
      if (!section) {
        return JSON.stringify({ error: "section is required" });
      }

      const resume = getResume();

      switch (section) {
        case "summary":
          return JSON.stringify({ summary: resume.summary }, null, 2);
        case "experience":
          return JSON.stringify({ experience: resume.experience }, null, 2);
        case "education":
          return JSON.stringify(
            { education: resume.education, certifications: resume.certifications },
            null,
            2
          );
        default:
          return JSON.stringify({ error: `Unknown section: ${section}` });
      }
    }

    case "get_contact": {
      const site = getSite();
      return JSON.stringify(
        {
          name: site.name,
          location: site.location,
          socials: site.socials,
        },
        null,
        2
      );
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// Clear cache (useful for development hot reload)
export function clearCache(): void {
  siteCache = null;
  resumeCache = null;
  projectsCache = null;
}
