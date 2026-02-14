import Link from "next/link";
import { ArrowRight, Github, ExternalLink } from "lucide-react";
import { Project } from "@/lib/content";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  // Get top 2 metrics for display
  const topMetrics = Object.entries(project.metrics).slice(0, 2);

  return (
    <article
      className={cn(
        "card group flex flex-col h-full",
        project.featured && "border-accent/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          {project.featured && (
            <span className="badge badge-accent text-xs mb-2">Featured</span>
          )}
          <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
            <Link href={`/projects/${project.slug}`}>{project.title}</Link>
          </h3>
        </div>

      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-4 flex-grow">
        {project.shortDescription}
      </p>

      {/* Metrics */}
      {topMetrics.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {topMetrics.map(([key, value]) => (
            <div key={key} className="bg-muted/50 rounded-lg p-2">
              <p className="text-sm font-semibold text-accent">{value}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="badge text-xs">
            {tag}
          </span>
        ))}
        {project.tags.length > 3 && (
          <span className="badge text-xs">+{project.tags.length - 3}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="View on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="View demo"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
        >
          Details
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
