import { Metadata } from "next";
import Link from "next/link";
import { Download, Building, GraduationCap, Award } from "lucide-react";
import { getResumeContent, getSiteContent } from "@/lib/content";
import { SkillBadge } from "@/components/skill-badge";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Resume",
  description: "View my professional experience, education, and skills",
};

export default function ResumePage() {
  const resume = getResumeContent();
  const site = getSiteContent();

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-6">
        <Navigation items={site.navigation} name={site.name} />

        <div className="max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
                Resume
              </h1>
              <p className="text-muted-foreground">
                {site.name} · {site.title}
              </p>
            </div>
            <a
              href={resume.pdfUrl}
              download
              className="btn btn-primary self-start"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Main Content: Summary & Experience */}
            <div className="lg:col-span-2 space-y-12">
              {/* Summary */}
              <section>
                <h2 className="text-xl font-bold font-display mb-4">Summary</h2>
                <div className="p-6 bg-muted/30 rounded-xl border border-border/50">
                  <p className="text-foreground/80 leading-relaxed">{resume.summary}</p>
                </div>
              </section>

              {/* Experience */}
              <section>
                <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                  <Building className="w-5 h-5 text-accent" />
                  Experience
                </h2>
                <div className="space-y-8">
                  {resume.experience.map((exp, i) => (
                    <div key={i} className="relative pl-6 border-l-2 border-border group">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-border group-hover:bg-accent transition-colors" />
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold">{exp.role}</h3>
                        <p className="text-accent font-medium text-lg">{exp.company}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {exp.period} · {exp.location}
                        </p>
                      </div>
                      <ul className="space-y-3">
                        {exp.highlights.map((highlight, j) => (
                          <li key={j} className="flex items-start gap-3 text-foreground/80 text-base leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent/50 mt-2.5 flex-shrink-0" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar: Education, Skills, Certs */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Education */}
                <section>
                  <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-accent" />
                    Education
                  </h2>
                  <div className="space-y-4">
                    {resume.education.map((edu, i) => (
                      <div key={i} className="card flex flex-col gap-1.5 p-5">
                        <h3 className="text-base font-bold leading-tight">{edu.degree}</h3>
                        <p className="text-accent text-sm font-medium leading-none">{edu.institution}</p>
                        <p className="text-xs text-muted-foreground mt-1">{edu.focus}</p>
                        <p className="text-xs text-muted-foreground">{edu.period}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Skills */}
                <section>
                  <h2 className="text-xl font-bold font-display mb-6">Skills</h2>
                  <div className="space-y-6">
                    {Object.entries(resume.skills).map(([category, skills]) => (
                      <div key={category}>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          {category.replace('_', ' ').replace('llm', 'LLM').replace('ml', 'ML').replace('mlops', 'MLOps')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <SkillBadge key={skill} skill={skill} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>



                {/* CTA */}
                <div className="p-6 bg-muted/30 rounded-xl text-center border border-border/50 mt-8">
                  <p className="text-base mb-4 font-medium text-foreground/90">
                    Interested in working together?
                  </p>
                  <Link href="/contact" className="btn btn-primary w-full justify-center">
                    Get in Touch
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
