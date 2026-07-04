# StyleAgent 👗✨

StyleAgent is a premium AI-powered Personal Fashion Stylist web application. It uses a modular AI Agent architecture powered by the Google Gemini API to provide highly personalized, context-aware outfit recommendations, styling tips, and color palettes.

## 🌟 Features

- **Fashion-Exclusive Intelligence**: Smart intent detection ensures the AI only talks about fashion, politely rejecting off-topic queries.
- **Context-Aware Recommendations**: Analyzes weather, occasion, budget, dress code, and your wardrobe to suggest the perfect outfit.
- **Beautiful Premium UI**: A highly polished, responsive interface with smooth animations, dark/light mode, and an Apple-inspired glassmorphism aesthetic.
- **Structured Explanations**: Generates visual cards showing outfit pieces, color palettes, why it works, and alternatives.
- **Micro-Interactions**: Features a custom typing indicator, animated logo, markdown support, toast notifications, and skeleton loaders.

## 🚀 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Zero-dependency for maximum performance)
- **Backend**: Node.js, Express.js
- **AI Core**: Google Gemini API (`@google/generative-ai`)
- **Deployment**: Vercel ready

## 📦 Local Setup

1. **Clone or Download** the repository.
2. Ensure you have **Node.js** (v18+) installed.
3. Open a terminal in the project root folder.
4. Run `npm install` to install backend dependencies.
5. Rename `.env.example` to `.env`.
6. Get a free API key from [Google AI Studio](https://aistudio.google.com/) and add it to your `.env` file:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```
7. Start the server:
   ```bash
   npm run dev
   ```
8. Open your browser and navigate to `http://localhost:3000`.

## 🌐 Deployment (Vercel)

The app includes a `vercel.json` file for easy deployment.
1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New Project** and import your repository.
4. In the Environment Variables section, add `GEMINI_API_KEY`.
5. Deploy!

## 🤖 AI Architecture

The backend utilizes an agent controller pipeline:
1. **Intent Agent**: Fast classification to block non-fashion questions.
2. **Context Agent**: Extracts occasion, budget, and weather into structured metadata.
3. **Primary Agent**: Orchestrates styling logic, color theory, and outfit assembly via an advanced master system prompt.
4. **Formatter**: Converts the AI's logic into beautiful, structured JSON for the frontend to render as rich UI cards.

---
*Designed and built as a premium portfolio piece.*
