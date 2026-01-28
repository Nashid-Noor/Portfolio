"use client";

import { ExternalLink, Github } from "lucide-react";

interface ProjectCard {
  title: string;
  description: string;
  url: string;
  metrics?: Record<string, string>;
  tags?: string[];
  githubUrl?: string | null;
  demoUrl?: string | null;
}

interface ChatProjectCardProps {
  card: ProjectCard;
}

export function ChatProjectCard({ card }: ChatProjectCardProps) {
  // Get top metric if available
  const topMetric = card.metrics
    ? Object.entries(card.metrics)[0]
    : null;

  return (
    <div className="bg-muted/50 border border-border rounded-xl p-3 text-sm">
      {/* Title and links */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <a
          href={card.url}
          className="font-medium text-accent hover:underline"
        >
          {card.title}
        </a>
        <div className="flex gap-1 flex-shrink-0">
          {card.githubUrl && (
            <a
              href={card.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label="View on GitHub"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
          {card.demoUrl && (
            <a
              href={card.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label="View demo"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-xs mb-2 line-clamp-2">
        {card.description}
      </p>

      {/* Bottom row: metric and tags */}
      <div className="flex items-center justify-between gap-2">
        {/* Metric */}
        {topMetric && (
          <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
            {topMetric[1]}
          </span>
        )}

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {card.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
