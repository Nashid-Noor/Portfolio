"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
    words: string[];
    className?: string;
    cursorClassName?: string;
    wait?: number;
    speed?: number;
    deleteSpeed?: number;
}

export function Typewriter({
    words,
    className,
    cursorClassName,
    wait = 2000,
    speed = 50,
    deleteSpeed = 30,
}: TypewriterProps) {
    const [index, setIndex] = useState(0);
    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = words[index % words.length];

        const tick = () => {
            setText((prev) => {
                if (isDeleting) {
                    return currentWord.substring(0, prev.length - 1);
                } else {
                    return currentWord.substring(0, prev.length + 1);
                }
            });
        };

        let timer: NodeJS.Timeout;

        if (isDeleting) {
            timer = setTimeout(tick, deleteSpeed);
        } else {
            timer = setTimeout(tick, speed);
        }

        // State management
        if (!isDeleting && text === currentWord) {
            clearTimeout(timer);
            timer = setTimeout(() => setIsDeleting(true), wait);
        } else if (isDeleting && text === "") {
            setIsDeleting(false);
            setIndex((prev) => prev + 1);
        }

        return () => clearTimeout(timer);
    }, [text, isDeleting, index, words, wait, speed, deleteSpeed]);

    return (
        <span className={cn("inline-flex items-center", className)}>
            {text}
            <span
                className={cn(
                    "ml-1 w-[2px] h-[1em] bg-current animate-pulse",
                    cursorClassName
                )}
            />
        </span>
    );
}
