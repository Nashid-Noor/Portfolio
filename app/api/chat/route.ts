import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chat, getSystemPrompt, ChatMessage } from "@/lib/chat-client";
import { toolDefinitions, callTool } from "@/lib/mcp-tools";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

// Request validation schema
const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .min(1)
    .max(20),
  sessionId: z.string().optional(),
});

// Response shape for UI
interface ProjectCard {
  title: string;
  description: string;
  url: string;
  metrics?: Record<string, string>;
  tags?: string[];
  githubUrl?: string | null;
  demoUrl?: string | null;
}

interface ChatApiResponse {
  answer: string;
  cards?: ProjectCard[];
}

// Extract project cards from tool results
function extractProjectCards(toolResults: string[]): ProjectCard[] {
  const cards: ProjectCard[] = [];

  for (const result of toolResults) {
    try {
      const data = JSON.parse(result);

      // Handle list_projects response
      if (data.projects && Array.isArray(data.projects)) {
        for (const p of data.projects) {
          cards.push({
            title: p.title,
            description: p.shortDescription,
            url: p.url,
            metrics: p.metrics,
            tags: p.tags,
            githubUrl: p.githubUrl,
            demoUrl: p.demoUrl,
          });
        }
      }

      // Handle get_project response
      if (data.slug && data.title && data.url) {
        cards.push({
          title: data.title,
          description: data.shortDescription || data.description,
          url: data.url,
          metrics: data.metrics,
          tags: data.tags,
          githubUrl: data.githubUrl,
          demoUrl: data.demoUrl,
        });
      }

      // Handle search_site response with projects
      if (data.results && Array.isArray(data.results)) {
        for (const r of data.results) {
          if (r.type === "project") {
            cards.push({
              title: r.title,
              description: r.snippet,
              url: r.url,
            });
          }
        }
      }
    } catch {
      // Not JSON or different format, skip
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  return cards.filter((card) => {
    if (seen.has(card.url)) return false;
    seen.add(card.url);
    return true;
  });
}

// Get client IP for rate limiting
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

// Maximum tool call iterations to prevent infinite loops
const MAX_TOOL_ITERATIONS = 5;

// Allow execution up to 60 seconds (Vercel Hobby Limit)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = await checkRateLimit(clientIP);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt),
      }
    );
  }

  try {
    // Parse and validate request
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { messages: userMessages } = parsed.data;

    // Build system prompt with tool definitions
    const systemPrompt = getSystemPrompt(toolDefinitions);

    // Build conversation messages
    const conversationMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...userMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Tool calling loop
    let iterations = 0;
    const allToolResults: string[] = [];

    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      // Call the LLM
      const response = await chat(conversationMessages, toolDefinitions);

      // If we have tool calls, execute them
      if (response.toolCalls && response.toolCalls.length > 0) {
        for (const toolCall of response.toolCalls) {
          const toolName = toolCall.function.name;
          let toolArgs: Record<string, unknown> = {};

          try {
            toolArgs = JSON.parse(toolCall.function.arguments);
          } catch {
            toolArgs = {};
          }

          // Execute tool directly (no subprocess needed)
          try {
            const toolResult = await callTool(toolName, toolArgs);
            allToolResults.push(toolResult);

            // Add assistant message with tool call
            conversationMessages.push({
              role: "assistant",
              content: response.content || "",
              tool_calls: [toolCall],
            });

            // Add tool result
            conversationMessages.push({
              role: "tool",
              content: toolResult,
              tool_call_id: toolCall.id,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Tool execution failed";

            conversationMessages.push({
              role: "assistant",
              content: response.content || "",
              tool_calls: [toolCall],
            });

            conversationMessages.push({
              role: "tool",
              content: JSON.stringify({ error: errorMessage }),
              tool_call_id: toolCall.id,
            });
          }
        }
        // Continue the loop to get the final answer
        continue;
      }

      // No more tool calls, we have the final answer
      if (response.content) {
        const cards = extractProjectCards(allToolResults);

        const apiResponse: ChatApiResponse = {
          answer: response.content,
          cards: cards.length > 0 ? cards.slice(0, 5) : undefined,
        };

        return NextResponse.json(apiResponse, {
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt),
        });
      }

      // No content and no tool calls - unexpected state
      break;
    }

    // If we exhausted iterations or got stuck
    return NextResponse.json(
      {
        answer:
          "I apologize, but I'm having trouble processing your request. Could you try rephrasing your question?",
      } as ChatApiResponse,
      {
        headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt),
      }
    );
  } catch (error) {
    console.error("Chat API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // Don't expose internal errors
    const userMessage = "An error occurred while processing your request.";

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
