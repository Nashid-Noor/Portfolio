import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.resolve(__dirname, "../../content");

// Content types
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
    languages: string[];
    ml_frameworks: string[];
    mlops: string[];
    cloud: string[];
    data: string[];
    tools: string[];
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

// Helper to read JSON content
function readContent<T>(filename: string): T {
  const filePath = path.join(contentDir, filename);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

// Get base URL from environment
function getBaseUrl(): string {
  return process.env.PORTFOLIO_BASE_URL || "http://localhost:3000";
}

// Create MCP server
const server = new Server(
  {
    name: "portfolio-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_site",
        description:
          "Search the portfolio website content for relevant information based on a query string. Returns matching sections with URLs.",
        inputSchema: {
          type: "object",
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
          type: "object",
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
          type: "object",
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
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_resume_section",
        description:
          "Get a specific section of the resume: summary, experience history, or education.",
        inputSchema: {
          type: "object",
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
        description:
          "Get public contact information and social media links.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const baseUrl = getBaseUrl();

  try {
    switch (name) {
      case "search_site": {
        const query = (args?.query as string || "").toLowerCase();
        const results: {
          type: string;
          title: string;
          snippet: string;
          url: string;
        }[] = [];

        const site = readContent<SiteContent>("site.json");
        const resume = readContent<ResumeContent>("resume.json");
        const { projects } = readContent<ProjectsContent>("projects.json");

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
            url: `${baseUrl}/about`,
          });
        }

        // Search resume
        if (resume.summary.toLowerCase().includes(query)) {
          results.push({
            type: "resume",
            title: "Professional Summary",
            snippet: resume.summary,
            url: `${baseUrl}/resume`,
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
              url: `${baseUrl}/resume`,
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
              url: `${baseUrl}/projects/${project.slug}`,
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
            url: `${baseUrl}/about`,
          });
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  query,
                  resultsCount: results.length,
                  results,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "list_projects": {
        const tag = args?.tag as string | undefined;
        const sort = (args?.sort as "impact" | "recent") || "impact";
        let { projects } = readContent<ProjectsContent>("projects.json");

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
          url: `${baseUrl}/projects/${p.slug}`,
          githubUrl: p.githubUrl,
          demoUrl: p.demoUrl,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  filters: { tag, sort },
                  count: projectList.length,
                  projects: projectList,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_project": {
        const slug = args?.slug as string;
        if (!slug) {
          return {
            content: [
              { type: "text", text: JSON.stringify({ error: "slug is required" }) },
            ],
            isError: true,
          };
        }

        const { projects } = readContent<ProjectsContent>("projects.json");
        const project = projects.find((p) => p.slug === slug);

        if (!project) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: `Project not found: ${slug}`,
                  availableSlugs: projects.map((p) => p.slug),
                }),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  ...project,
                  url: `${baseUrl}/projects/${project.slug}`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_skills": {
        const resume = readContent<ResumeContent>("resume.json");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  skills: resume.skills,
                  certifications: resume.certifications,
                  url: `${baseUrl}/about`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_resume_section": {
        const section = args?.section as "summary" | "experience" | "education";
        if (!section) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: "section is required" }),
              },
            ],
            isError: true,
          };
        }

        const resume = readContent<ResumeContent>("resume.json");
        const url = `${baseUrl}/resume`;

        switch (section) {
          case "summary":
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({ summary: resume.summary, url }, null, 2),
                },
              ],
            };
          case "experience":
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    { experience: resume.experience, url },
                    null,
                    2
                  ),
                },
              ],
            };
          case "education":
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      education: resume.education,
                      certifications: resume.certifications,
                      url,
                    },
                    null,
                    2
                  ),
                },
              ],
            };
        }
        break;
      }

      case "get_contact": {
        const site = readContent<SiteContent>("site.json");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  name: site.name,
                  location: site.location,
                  socials: site.socials,
                  url: `${baseUrl}/contact`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        return {
          content: [
            { type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: JSON.stringify({ error: message }) }],
      isError: true,
    };
  }

  // Fallback return (should never reach here)
  return {
    content: [{ type: "text", text: JSON.stringify({ error: "Unexpected error" }) }],
    isError: true,
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Portfolio MCP server running on stdio");
}

main().catch(console.error);
