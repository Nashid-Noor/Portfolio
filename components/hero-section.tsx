"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";
import { Typewriter } from "@/components/ui/typewriter";
import { Navigation } from "@/components/navigation";
import { XIcon } from "@/components/icons";

interface HeroSectionProps {
    site: {
        name: string;
        tagline: string;
        bio: string;
        highlights: string;
        socials: Record<string, string>;
        navigation: { label: string; href: string }[];
    };
}

export function HeroSection({ site }: HeroSectionProps) {
    const socialIcons: Record<string, React.ReactNode> = {
        github: <Github className="w-5 h-5" />,
        linkedin: <Linkedin className="w-5 h-5" />,
        x: <XIcon className="w-4 h-4" />,
        email: <Mail className="w-5 h-5" />,
    };

    return (
        <section className="py-8 md:py-12">
            <div className="container mx-auto px-6">
                <Navigation items={site.navigation} name={site.name} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Left Column: Content */}
                    <div className="order-2 md:order-1 flex flex-col items-start text-left">
                        <p className="text-accent font-medium mb-4 animate-fade-in">
                            Hi, I&apos;m
                        </p>
                        <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-6 animate-slide-up text-card-foreground">
                            {site.name}
                        </h1>

                        {/* Animated Roles */}
                        <div className="text-xl md:text-2xl text-muted-foreground mb-6 animate-slide-up h-8">
                            <Typewriter
                                words={["AI Engineer", "Machine Learning Engineer", "Generative AI Engineer"]}
                                wait={2500}
                            />
                        </div>

                        <p className="text-lg text-foreground/80 mb-8 max-w-xl animate-slide-up leading-relaxed">
                            {site.tagline}
                        </p>

                        <p className="text-muted-foreground mb-8 max-w-xl animate-slide-up leading-relaxed">
                            {site.highlights}
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4 mb-8 animate-slide-up">
                            <Link href="/projects" className="btn btn-primary">
                                View Projects
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/resume" className="btn btn-secondary">
                                Resume
                            </Link>
                            <Link href="/contact" className="btn btn-ghost">
                                Contact
                            </Link>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-4 animate-slide-up">
                            {Object.entries(site.socials).map(([platform, url]) => (
                                <a
                                    key={platform}
                                    href={platform === "email" ? `mailto:${url}` : url}
                                    target={platform === "email" ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
                                    aria-label={platform}
                                >
                                    {socialIcons[platform] || platform}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Avatar */}
                    <div className="order-1 md:order-2 flex justify-center md:justify-end relative">
                        <div className="relative w-72 h-72 md:w-96 md:h-96">
                            {/* Decorative Pattern - Rotating Circle */}
                            <div className="absolute inset-0 rounded-full border border-dashed border-accent/30 animate-[spin_20s_linear_infinite]" />
                            <div className="absolute -inset-4 rounded-full border border-accent/10 animate-[spin_30s_linear_infinite_reverse]" />

                            {/* Avatar Image */}
                            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-background ring-2 ring-accent/20 shadow-2xl">
                                <Image
                                    src="/avatar-premium.png"
                                    alt={site.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
