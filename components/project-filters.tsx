"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectFiltersProps {
  allTags: string[];
  currentTag?: string;
  currentSearch: string;
}

export function ProjectFilters({
  allTags,
  currentTag,
  currentSearch,
}: ProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/projects?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("search") as HTMLInputElement;
    updateParams("search", input.value || null);
  };

  const clearFilters = () => {
    router.push("/projects");
  };

  const hasFilters = currentTag || currentSearch;

  return (
    <div className="space-y-4 mb-8">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          name="search"
          defaultValue={currentSearch}
          placeholder="Search projects..."
          className="input pl-10 pr-4"
        />
      </form>

      {/* Tags and Sort */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort */}


        {/* Tag Pills */}
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                updateParams("tag", currentTag === tag ? null : tag)
              }
              className={cn(
                "badge cursor-pointer transition-colors",
                currentTag === tag
                  ? "badge-accent"
                  : "hover:bg-muted/80"
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
