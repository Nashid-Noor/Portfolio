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
