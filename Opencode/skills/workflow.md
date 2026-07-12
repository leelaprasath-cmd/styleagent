# Workflow Optimization Protocol

This protocol defines the routing of tasks between LLMs to optimize quota usage and performance.

## Routing Rules
1. **Simple Tasks (Documentation, Minor Edits, Boilerplate)**:
   - Route to **Free Connected LLMs** (e.g., Minimax 2.5, Llama 3 via Groq/OpenRouter).
   - Use these models for fast, low-cost generation of standard code structures.

2. **Complex Tasks (Logic, Architecture, Debugging)**:
   - Route to **Primary Antigravity Quota** (e.g., Claude 3.5 Sonnet, GPT-4o).
   - Use these models for intricate problem-solving, full application design, and deep codebase refactoring.

## Instructions
- When using the Open Code extension, switch your active model using the model selector based on the current task's complexity.
- For generating standard modules like landing pages, use the free models along with the configured skills.
