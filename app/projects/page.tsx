import { Metadata } from "next";
import { getProjectsContent, getSiteContent } from "@/lib/content";
import { ProjectCard } from "@/components/project-card";
import { ProjectFilters } from "@/components/project-filters";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse my portfolio of data science and ML engineering projects",
};

interface PageProps {
  searchParams: Promise<{ tag?: string; search?: string; sort?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { projects } = getProjectsContent();
  const site = getSiteContent();
  const tag = params.tag;
  const search = params.search?.toLowerCase();
  const sort = params.sort || "impact";

  // Get all unique tags
  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort();

  // Filter projects
  let filteredProjects = projects;

  if (tag) {
    filteredProjects = filteredProjects.filter((p) =>
      p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  }

  if (search) {
    filteredProjects = filteredProjects.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.shortDescription.toLowerCase().includes(search) ||
        p.tags.some((t) => t.toLowerCase().includes(search)) ||
        p.techStack.some((t) => t.toLowerCase().includes(search))
    );
  }

  // Sort projects
  if (sort === "recent") {
    // Fallback for recent sort: just keep original order but maybe ensure consistent output or just no-op since date is gone
    // We'll just rely on the default sort which is featured first
    filteredProjects = [...filteredProjects];
  }

  // Default Sort: Original order in JSON which allows manual ordering
  // We removed the featured sort logic to respect the JSON order strictly.
  // filteredProjects.sort((a, b) => 0); // No-op, already in order

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-6">
        <Navigation items={site.navigation} name={site.name} />

        {/* Header */}
        <div className="max-w-2xl mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Projects
          </h1>
          <p className="text-lg text-muted-foreground">
            Selected projects demonstrating end-to-end AI systems from model development to production deployment.
          </p>
        </div>

        {/* Filters */}
        <ProjectFilters
          allTags={allTags}
          currentTag={tag}
          currentSearch={search || ""}
        />

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6">
          Showing {filteredProjects.length} of {projects.length} projects
          {tag && <span> in &quot;{tag}&quot;</span>}
          {search && <span> matching &quot;{search}&quot;</span>}
        </p>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              No projects found matching your criteria.
            </p>
            <a href="/projects" className="btn btn-secondary">
              Clear filters
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
