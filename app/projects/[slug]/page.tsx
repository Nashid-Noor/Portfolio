import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Github, Calendar, Tag } from "lucide-react";
import { getProjectBySlug, getProjectsContent } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import { SkillBadge } from "@/components/skill-badge";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { projects } = getProjectsContent();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: project.title,
    description: project.shortDescription,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-6">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to projects
        </Link>

        <div className="max-w-4xl">
          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="badge badge-accent">{project.status}</span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {formatDate(project.date)}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">
              {project.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6">
              {project.shortDescription}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/projects?tag=${encodeURIComponent(tag)}`}
                  className="badge hover:bg-muted/80"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Link>
              ))}
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <Github className="w-4 h-4" />
                  View Code
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </a>
              )}
              {project.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  <ExternalLink className="w-4 h-4" />
                  {link.label}
                </a>
              ))}
            </div>
          </header>

          {/* Model Card Style Content */}
          <div className="space-y-8">
            {/* Metrics Card */}
            <section className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Key Metrics
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(project.metrics).map(([key, value]) => (
                  <div key={key} className="bg-muted/50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-accent">{value}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Problem Statement */}
            <section className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Problem Statement
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                {project.problemStatement}
              </p>
            </section>

            {/* Solution */}
            <section className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Solution Approach
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                {project.solution}
              </p>
            </section>

            {/* Description */}
            <section className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Overview
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                {project.description}
              </p>
            </section>

            {/* Impact */}
            <section className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Impact & Results
              </h2>
              <ul className="space-y-3">
                {project.impact.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Tech Stack */}
            <section className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <SkillBadge key={tech} skill={tech} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
