import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  skill: string;
  className?: string;
}

export function SkillBadge({ skill, className }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-foreground/80 hover:bg-muted/80 transition-colors",
        className
      )}
    >
      {skill}
    </span>
  );
}
