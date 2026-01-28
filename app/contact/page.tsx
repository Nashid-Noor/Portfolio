import { Metadata } from "next";
import { Github, Linkedin, Mail, MapPin } from "lucide-react";
import { getSiteContent } from "@/lib/content";
import { Navigation } from "@/components/navigation";
import { XIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with me",
};

export default function ContactPage() {
  const site = getSiteContent();

  const socialLinks = [
    {
      name: "Email",
      href: `mailto:${site.socials.email}`,
      icon: Mail,
      value: site.socials.email,
      description: "Best way to reach me",
    },
    {
      name: "GitHub",
      href: site.socials.github,
      icon: Github,
      value: site.socials.github.replace("https://github.com/", "@"),
      description: "Check out my code",
    },
    {
      name: "LinkedIn",
      href: site.socials.linkedin,
      icon: Linkedin,
      value: "Connect with me",
      description: "Professional network",
    },
    {
      name: "X",
      href: site.socials.x,
      icon: XIcon,
      value: site.socials.x.replace("https://twitter.com/", "@").replace("https://x.com/", "@"),
      description: "Follow for updates",
    },
  ];

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-6">
        <Navigation items={site.navigation} name={site.name} />

        {/* Header - Centered Max Width or Full Width? Keeping left aligned but full width container context */}
        <div className="max-w-4xl mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Get in Touch
          </h1>
          <p className="text-muted-foreground mb-8">
            Let&apos;s work together to build something amazing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Row 1 Left: Email (Primary) */}
          <div className="lg:col-span-2">
            {socialLinks.filter(l => l.name === "Email").map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="card group flex items-center gap-4 p-8 hover:border-accent/50 transition-all hover:scale-[1.02] h-full"
              >
                <div className="flex items-center justify-center rounded-full bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors w-16 h-16 flex-shrink-0">
                  <link.icon className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xl mb-1">{link.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{link.description}</p>
                </div>
                <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block font-mono bg-muted/50 px-4 py-2 rounded-lg whitespace-nowrap">
                  {link.value}
                </span>
              </a>
            ))}
          </div>

          {/* Row 1 Right: Response Time */}
          <div className="lg:col-span-1">
            <div className="card h-full p-6 flex flex-col justify-center bg-muted/30 border border-border/50">
              <h3 className="font-semibold mb-2">Response Time</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                I typically respond to emails within 24-48 hours. For urgent matters,
                feel free to reach out via LinkedIn or email.
              </p>
            </div>
          </div>

          {/* Row 2 Left: Other Socials */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              {socialLinks.filter(l => l.name !== "Email").map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card group flex flex-col items-start justify-between p-6 gap-4 hover:border-accent/50 transition-all hover:scale-[1.05] h-full"
                >
                  <div className="flex items-center justify-center rounded-full bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors w-12 h-12">
                    <link.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{link.name}</h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Row 2 Right: Quick Questions */}
          <div className="lg:col-span-1">
            <div className="card h-full p-6 flex flex-col justify-center border border-border">
              <h3 className="font-semibold mb-2">Quick Questions?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Use the chat widget in the bottom right corner to ask questions about
                my projects, skills, or experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
