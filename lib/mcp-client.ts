import { spawn, ChildProcess } from "child_process";
import path from "path";
import { ToolDefinition } from "./chat-client";

// MCP message types
interface MCPRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: { code: number; message: string };
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface MCPToolResult {
  content: { type: string; text: string }[];
  isError?: boolean;
}

/**
 * Simple MCP Client using stdio transport
 * Spawns the MCP server as a child process and communicates via JSON-RPC
 */
class MCPClient {
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<
    number,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  >();
  private buffer = "";
  private initialized = false;

  async connect(): Promise<void> {
    if (this.process) {
      return;
    }

    const serverPath = path.join(process.cwd(), "mcp-server", "src", "index.ts");

    this.process = spawn("npx", ["tsx", serverPath], {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        PORTFOLIO_BASE_URL: process.env.PORTFOLIO_BASE_URL || "http://localhost:3000",
      },
    });

    if (!this.process.stdout || !this.process.stdin) {
      throw new Error("Failed to create MCP server process");
    }

    // Handle stdout (responses)
    this.process.stdout.on("data", (data: Buffer) => {
      this.buffer += data.toString();
      this.processBuffer();
    });

    // Handle stderr (logs)
    this.process.stderr?.on("data", (data: Buffer) => {
      console.error("[MCP Server]", data.toString());
    });

    // Handle process exit
    this.process.on("exit", (code) => {
      console.error(`MCP server exited with code ${code}`);
      this.process = null;
      this.initialized = false;
    });

    // Initialize the connection
    await this.initialize();
  }

  private processBuffer(): void {
    // MCP uses newline-delimited JSON
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const response = JSON.parse(line) as MCPResponse;
        const pending = this.pendingRequests.get(response.id);
        if (pending) {
          this.pendingRequests.delete(response.id);
          if (response.error) {
            pending.reject(new Error(response.error.message));
          } else {
            pending.resolve(response.result);
          }
        }
      } catch (e) {
        console.error("Failed to parse MCP response:", line, e);
      }
    }
  }

  private async sendRequest(method: string, params?: Record<string, unknown>): Promise<unknown> {
    if (!this.process?.stdin) {
      throw new Error("MCP client not connected");
    }

    const id = ++this.requestId;
    const request: MCPRequest = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`MCP request timeout: ${method}`));
      }, 30000);

      this.pendingRequests.set(id, {
        resolve: (value) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      this.process!.stdin!.write(JSON.stringify(request) + "\n");
    });
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "portfolio-chat-client",
        version: "1.0.0",
      },
    });

    await this.sendRequest("notifications/initialized", {});
    this.initialized = true;
  }

  async listTools(): Promise<ToolDefinition[]> {
    await this.connect();
    const result = (await this.sendRequest("tools/list", {})) as { tools: MCPTool[] };
    return result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    await this.connect();
    const result = (await this.sendRequest("tools/call", {
      name,
      arguments: args,
    })) as MCPToolResult;

    if (result.isError) {
      throw new Error(`Tool error: ${result.content[0]?.text || "Unknown error"}`);
    }

    return result.content.map((c) => c.text).join("\n");
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.initialized = false;
    }
  }
}

// Singleton instance
let mcpClient: MCPClient | null = null;

export function getMCPClient(): MCPClient {
  if (!mcpClient) {
    mcpClient = new MCPClient();
  }
  return mcpClient;
}

export type { MCPClient };
