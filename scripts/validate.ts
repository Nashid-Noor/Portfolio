import fs from "fs";
import path from "path";
import { z } from "zod";

const contentDir = path.join(process.cwd(), "content");

// Schema definitions
const siteSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  bio: z.string().min(1),
  avatar: z.string(),
  location: z.string(),
  socials: z.object({
    github: z.string().url(),
    linkedin: z.string().url(),
    email: z.string().email(),
    x: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }),
  highlights: z.array(z.string()).min(1),
  currentFocus: z.array(z.string()).min(1),
  navigation: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
    })
  ),
});

const resumeSchema = z.object({
  summary: z.string().min(1),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      period: z.string(),
      location: z.string(),
      highlights: z.array(z.string()),
    })
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      focus: z.string(),
      period: z.string(),
    })
  ),
  certifications: z.array(z.string()),
  skills: z.object({
    programming: z.array(z.string()),
    frameworks: z.array(z.string()),
    cloud_mlops: z.array(z.string()),
    llm: z.array(z.string()),
    ml: z.array(z.string()),
  }),
  pdfUrl: z.string(),
});

const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  shortDescription: z.string().min(1),
  description: z.string().min(1),
  problemStatement: z.string().min(1),
  solution: z.string().min(1),
  impact: z.array(z.string()).min(1),
  metrics: z.record(z.string()),
  techStack: z.array(z.string()).min(1),
  tags: z.array(z.string()).min(1),
  featured: z.boolean(),
  date: z.string().regex(/^\d{4}-\d{2}$/),
  status: z.string(),
  githubUrl: z.string().url().nullable(),
  demoUrl: z.string().url().nullable(),
  links: z.array(
    z.object({
      label: z.string(),
      url: z.string().url(),
    })
  ),
});

const projectsSchema = z.object({
  projects: z.array(projectSchema).min(1),
});

// Validation functions
function validateFile<T>(
  filename: string,
  schema: z.ZodSchema<T>
): { success: boolean; errors?: string[] } {
  const filePath = path.join(contentDir, filename);

  if (!fs.existsSync(filePath)) {
    return { success: false, errors: [`File not found: ${filename}`] };
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`
      );
      return { success: false, errors };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, errors: [`Parse error: ${message}`] };
  }
}

// MCP tool smoke tests
async function testMCPTools(): Promise<{ success: boolean; errors?: string[] }> {
  const errors: string[] = [];

  // Import MCP tools
  const { callTool, toolDefinitions } = await import("../lib/mcp-tools");

  try {
    // Test tool definitions exist
    if (toolDefinitions.length !== 6) {
      errors.push(`Expected 6 tools, got ${toolDefinitions.length}`);
    }

    // Test search_site
    const searchResult = await callTool("search_site", { query: "ML" });
    const searchData = JSON.parse(searchResult);
    if (typeof searchData.resultsCount !== "number") {
      errors.push("search_site: invalid response structure");
    }

    // Test list_projects
    const listResult = await callTool("list_projects", {});
    const listData = JSON.parse(listResult);
    if (!Array.isArray(listData.projects)) {
      errors.push("list_projects: invalid response structure");
    }

    // Test get_project with valid slug
    if (listData.projects.length > 0) {
      const projectResult = await callTool("get_project", {
        slug: listData.projects[0].slug,
      });
      const projectData = JSON.parse(projectResult);
      if (!projectData.title) {
        errors.push("get_project: invalid response structure");
      }
    }

    // Test get_skills
    const skillsResult = await callTool("get_skills", {});
    const skillsData = JSON.parse(skillsResult);
    if (!skillsData.skills) {
      errors.push("get_skills: invalid response structure");
    }

    // Test get_resume_section
    const resumeResult = await callTool("get_resume_section", { section: "summary" });
    const resumeData = JSON.parse(resumeResult);
    if (!resumeData.summary) {
      errors.push("get_resume_section: invalid response structure");
    }

    // Test get_contact
    const contactResult = await callTool("get_contact", {});
    const contactData = JSON.parse(contactResult);
    if (!contactData.socials) {
      errors.push("get_contact: invalid response structure");
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, errors: [`MCP test error: ${message}`] };
  }
}

// Main validation
async function main() {
  console.log("🔍 Validating portfolio content...\n");

  let hasErrors = false;

  // Validate site.json
  console.log("📄 Checking site.json...");
  const siteResult = validateFile("site.json", siteSchema);
  if (siteResult.success) {
    console.log("   ✅ Valid\n");
  } else {
    console.log("   ❌ Invalid");
    siteResult.errors?.forEach((e) => console.log(`      - ${e}`));
    console.log();
    hasErrors = true;
  }

  // Validate resume.json
  console.log("📄 Checking resume.json...");
  const resumeResult = validateFile("resume.json", resumeSchema);
  if (resumeResult.success) {
    console.log("   ✅ Valid\n");
  } else {
    console.log("   ❌ Invalid");
    resumeResult.errors?.forEach((e) => console.log(`      - ${e}`));
    console.log();
    hasErrors = true;
  }

  // Validate projects.json
  console.log("📄 Checking projects.json...");
  const projectsResult = validateFile("projects.json", projectsSchema);
  if (projectsResult.success) {
    console.log("   ✅ Valid\n");
  } else {
    console.log("   ❌ Invalid");
    projectsResult.errors?.forEach((e) => console.log(`      - ${e}`));
    console.log();
    hasErrors = true;
  }

  // Smoke test MCP tools
  console.log("🔧 Testing MCP tools...");
  const mcpResult = await testMCPTools();
  if (mcpResult.success) {
    console.log("   ✅ All tools working\n");
  } else {
    console.log("   ❌ Tool tests failed");
    mcpResult.errors?.forEach((e) => console.log(`      - ${e}`));
    console.log();
    hasErrors = true;
  }

  // Summary
  console.log("─".repeat(40));
  if (hasErrors) {
    console.log("❌ Validation failed. Please fix the errors above.");
    process.exit(1);
  } else {
    console.log("✅ All validations passed!");
    process.exit(0);
  }
}

main().catch(console.error);
