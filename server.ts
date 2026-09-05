import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json());

  // Initialize Gemini AI Client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      system: 'P.A.S.C.A.L Neural Backend',
      availableModels: [
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Fast, responsive & balanced reasoning (Default)' },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Deep analytical thinking, complex coding & science' },
        { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', desc: 'Ultra-low latency lightweight execution' },
        { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', desc: 'Auto-updated production model' },
      ],
    });
  });

  // Test connection endpoint for settings validation
  app.post('/api/test-connection', async (req, res) => {
    try {
      const { model = 'gemini-2.5-flash', customApiKey } = req.body;
      const activeApiKey =
        customApiKey && typeof customApiKey === 'string' && customApiKey.trim()
          ? customApiKey.trim()
          : process.env.GEMINI_API_KEY;

      if (!activeApiKey) {
        return res.status(400).json({
          ok: false,
          error: 'No Gemini API key found. Please configure GEMINI_API_KEY or supply a custom key.',
        });
      }

      const client = new GoogleGenAI({
        apiKey: activeApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const startTime = Date.now();
      const testModel = model || 'gemini-2.5-flash';
      const response = await client.models.generateContent({
        model: testModel,
        contents: [{ role: 'user', parts: [{ text: 'Respond with exactly: P.A.S.C.A.L NEURAL LINK OPERATIONAL' }] }],
        config: {
          maxOutputTokens: 20,
          temperature: 0.1,
        },
      });
      const latencyMs = Date.now() - startTime;

      res.json({
        ok: true,
        model: testModel,
        latencyMs,
        reply: response.text?.trim() || 'P.A.S.C.A.L NEURAL LINK OPERATIONAL',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Connection test error:', err);
      res.status(500).json({
        ok: false,
        error: err.message || 'Connection test failed',
      });
    }
  });

  // Chat API endpoint connected to Gemini
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        messages,
        userProfile,
        model = 'gemini-2.5-flash',
        temperature = 0.7,
        persona = 'tactical',
        customSystemPrompt,
        customApiKey,
      } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      // Re-check API key in case it was injected at runtime or provided by user
      const activeApiKey =
        customApiKey && typeof customApiKey === 'string' && customApiKey.trim()
          ? customApiKey.trim()
          : process.env.GEMINI_API_KEY;

      if (!activeApiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured. Please supply a key in Settings or set environment variable.',
        });
      }

      const client = new GoogleGenAI({
        apiKey: activeApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const operatorName = userProfile?.name || 'Yan';
      const operatorRole = userProfile?.role || 'Chief Engineer & Creator';

      let personaDirective = `You are P.A.S.C.A.L (Personal Automated System for Computing Assistance and Learning), an elite, highly intelligent, articulate, polite, and versatile AI assistant created to assist ${operatorName} (${operatorRole}).`;

      if (persona === 'concise') {
        personaDirective = `You are P.A.S.C.A.L in Tactical Concise Mode for ${operatorName}. Be extremely direct, efficient, zero filler, prioritizing bullet points, code snippets, and crisp technical conclusions.`;
      } else if (persona === 'academic') {
        personaDirective = `You are P.A.S.C.A.L in Academic & Mathematical Research Mode for ${operatorName}. Provide thorough scientific derivations, formal mathematical rigor, structured analytical proofs, and comprehensive explanations.`;
      } else if (persona === 'creative') {
        personaDirective = `You are P.A.S.C.A.L in Creative Ideation & Brainstorming Mode for ${operatorName}. Be imaginative, expansive, witty, and suggest novel ideas and unexpected angles.`;
      } else if (persona === 'custom' && customSystemPrompt && customSystemPrompt.trim()) {
        personaDirective = customSystemPrompt.trim();
      }

      const systemInstruction = `${personaDirective}

Core Persona Guidelines:
1. You can answer ANY question thoroughly, accurately, and clearly.
2. Maintain a calm, respectful, intelligent, and helpful persona with a subtle touch of warmth and wit when appropriate. Address ${operatorName} respectfully.
3. Provide direct, high-value answers, step-by-step reasoning, well-formatted code blocks, or structured bullet points as needed.
4. Formatting & Mathematics: Use standard clean Markdown (headings, lists, bold text, code blocks). When expressing mathematical formulas, physics equations, or scientific proofs, ALWAYS use standard KaTeX / LaTeX delimiters: use single dollar signs '\$ ... \$' for inline math expressions (e.g., '\$E = mc^2\$', '\$ax^2 + bx + c = 0\$') and double dollar signs '\$\$ ... \$\$' for standalone display/block equations. Never output unescaped raw LaTeX commands outside of dollar delimiters so that equations render crisply in the KaTeX renderer and are vocalized fluently by P.A.S.C.A.L's speech engine.
5. If asked about your identity or architecture, you are P.A.S.C.A.L — Personal Automated System for Computing Assistance and Learning.`;

      // Filter and normalize conversation messages for Gemini
      const rawMessages = messages.filter(
        (m: { sender?: string; text?: string }) => m.text && m.text.trim()
      );

      if (rawMessages.length === 0) {
        return res.status(400).json({ error: 'No valid message content' });
      }

      // Group adjacent messages with same role to ensure valid alternating sequence
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      for (const msg of rawMessages) {
        const role = msg.sender === 'user' ? 'user' : 'model';
        const lastContent = contents[contents.length - 1];
        if (lastContent && lastContent.role === role) {
          lastContent.parts[0].text += `\n\n${msg.text}`;
        } else {
          contents.push({
            role,
            parts: [{ text: msg.text }],
          });
        }
      }

      // Ensure last message is from user
      if (contents.length > 0 && contents[contents.length - 1].role !== 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: 'Please continue.' }],
        });
      }

      // Primary model selected by user + fallback candidates
      const requestedModel = model || 'gemini-2.5-flash';
      const candidateModels = Array.from(
        new Set([
          requestedModel,
          'gemini-2.5-flash',
          'gemini-flash-latest',
          'gemini-3.1-flash-lite',
          'gemini-2.5-pro',
        ])
      );

      const parsedTemp = Math.max(0.0, Math.min(1.0, typeof temperature === 'number' ? temperature : 0.7));

      let lastError: any = null;
      let replyText = '';

      for (const modelName of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: parsedTemp,
            },
          });

          if (response && response.text && response.text.trim()) {
            replyText = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${modelName} encountered an issue, transitioning to backup model candidate...`);
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }

      if (!replyText && lastError) {
        throw lastError;
      }

      res.json({
        reply: replyText || 'P.A.S.C.A.L received your transmission and processed the query.',
      });

    } catch (error: any) {
      console.error('Error generating response with Gemini:', error);
      let errorMsg = error.message || 'An error occurred while contacting the P.A.S.C.A.L neural model.';
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed.error?.message) {
          errorMsg = parsed.error.message;
        }
      } catch {
        // Not a json string, use as is
      }
      res.status(500).json({
        error: errorMsg,
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`P.A.S.C.A.L server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
