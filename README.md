# My Portfolio & AI Agent

This is my personal portfolio website. It features a custom AI agent that can actually answer questions about my background, projects, and skills.

## How It Works

I implemented a **Tool-Use / Function-Calling** architecture (inspired by the [Model Context Protocol](https://modelcontextprotocol.io/)). This means the LLM doesn't just guess or rely on pre-trained knowledge; it has access to specific "tools" that let it query my portfolio data in real-time.

### The Flow
When you ask, *"What experience do you have with MLOps?"*:
1. The model analyzes the request and decides it needs to check my resume.
2. It calls the `get_resume_section` tool.
3. My backend runs that function, grabs the specific data from my JSON files, and sends it back to the model.
4. The model uses that exact data to write the final answer.

## Deployment to Production

### Vercel (Recommended)

This project works best on Vercel.

1.  **Improt Project**: Connnect your GitHub repo to Vercel.
2.  **Environment Variables**: You MUST set these in the Vercel Dashboard:
    *   `HF_API_KEY`: Your HuggingFace API key.
    *   `HF_MODEL`: `meta-llama/Llama-3.1-8B-Instruct` (or your preferred model).
    *   `UPSTASH_REDIS_REST_URL`: (Optional but Recommended) For Rate Limiting.
    *   `UPSTASH_REDIS_REST_TOKEN`: (Optional but Recommended) For Rate Limiting.
3.  **Deploy**: Click deploy.

**Note on Rate Limiting**: 
By default, the app uses in-memory rate limiting. On serverless (Vercel), this is not effective. For true DDoS protection, create a free database at [Upstash](https://upstash.com/) and add the Redis credentials above.

## Running Locally

1.  **Install**:
    ```bash
    pnpm install
    ```

2.  **Setup Keys**:
    ```bash
    cp .env.example .env
    # Add your HF_API_KEY
    ```

3.  **Run**:
    ```bash
    pnpm dev
    ```
