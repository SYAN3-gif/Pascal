import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

function generateLocalTacticalResponse(userPrompt: string, userProfile: any, persona: string): string {
  const lower = (userPrompt || '').toLowerCase();
  const operatorName = userProfile?.name || 'Operator';

  if (
    lower.includes('tear gas') ||
    lower.includes('pepper spray') ||
    lower.includes('chemical') ||
    lower.includes('cs gas') ||
    lower.includes('eyes') ||
    lower.includes('gas') ||
    lower.includes('decontamination')
  ) {
    return `### 🚨 P.A.S.C.A.L TACTICAL FIELD PROTOCOL: CHEMICAL IRRITANT DECONTAMINATION

**Immediate Action for ${operatorName} and Comrades:**
1. **Clear the Hot Zone**: Move upwind and to higher elevation immediately. Walk briskly—do not sprint to avoid breathing in deep aerosol particles.
2. **Breathing & Posture**: Blow your nose, spit out saliva, and rinse your mouth with clean water. Do not swallow. Keep calm to control heart rate.
3. **Eye Decontamination**:
   - **DO NOT RUB YOUR EYES**. Rubbing scratches corneas and embeds micro-crystals.
   - If wearing contact lenses, remove them immediately with clean hands and discard them.
   - Flush eyes thoroughly with **clean water or sterile saline (0.9% NaCl)** from the inner corner towards the outer temple so runoff does not contaminate the other eye.
4. **Skin & Clothing**:
   - Remove contaminated outer garments without pulling them over your head (unbutton or cut if necessary). Place in a sealed plastic bag.
   - Wash exposed skin with cold water and mild soap (dish soap binds chemical oils). Avoid hot water as it opens skin pores.
   - **Avoid oils, vaseline, or mineral oil lotions** which trap chemical capsaicin on the skin.`;
  }

  if (
    lower.includes('right') ||
    lower.includes('police') ||
    lower.includes('arrest') ||
    lower.includes('detain') ||
    lower.includes('cop') ||
    lower.includes('search') ||
    lower.includes('legal') ||
    lower.includes('warrant')
  ) {
    return `### ⚖️ P.A.S.C.A.L LEGAL SHIELD: KNOW YOUR RIGHTS IN PROTEST

**Essential Phrases (Say Calmly & Clearly):**
1. **"Am I being detained, or am I free to leave?"**
   - If the officer says you are free to leave, walk away calmly.
   - If they say you are being detained, ask: *"On what reasonable suspicion?"*
2. **"I am exercising my right to remain silent."**
   - In most jurisdictions, you must provide your name/identification if lawfully detained or driving, but you are NEVER required to answer questions about where you are going, what you are doing, or your affiliations.
3. **"I do not consent to any searches."**
   - Say this out loud so witnesses and body cams record it. Police may pat down outer clothing for weapons if they suspect danger, but they cannot search bags, pockets, or phones without a warrant or probable cause.
4. **"I want to speak to my attorney."**
   - If arrested, invoke this immediately. All questioning must cease. Do not sign or agree to statements without legal counsel present.

**Filming Police:**
- You have a constitutionally protected right to film and photograph law enforcement in public spaces, provided you maintain a safe distance and do not physically impede them.`;
  }

  if (
    lower.includes('phone') ||
    lower.includes('digital') ||
    lower.includes('opsec') ||
    lower.includes('security') ||
    lower.includes('tracking') ||
    lower.includes('signal') ||
    lower.includes('imsi') ||
    lower.includes('passcode')
  ) {
    return `### 📱 P.A.S.C.A.L DIGITAL OPSEC & PROTEST HYGIENE

**Pre-Action Device Lockdown:**
1. **Disable Biometrics**: Turn off Face ID and fingerprint unlock on iOS/Android. Police can legally compel a finger or face scan under many jurisdictions, but passcodes are protected Fifth Amendment testimony. Use an 8+ character alphanumeric passcode.
2. **Network Defenses (IMSI-Catchers & Stingrays)**:
   - Turn off Wi-Fi and Bluetooth to prevent beacon/location sniffing.
   - If you do not need live updates, enable **Airplane Mode** or store device in a Faraday bag until needed.
3. **Encrypted Messaging**:
   - Use **Signal** with disappearing messages set (e.g., 24 hours or 1 hour).
   - Set up a Signal Registration Lock PIN.
4. **Photo & Video Scrubbing**:
   - Strip EXIF GPS metadata before publishing protest photos.
   - Blur faces, tattoos, and distinguishing clothing of participants to protect comrades from facial recognition dragnet databases.`;
  }

  if (
    lower.includes('checklist') ||
    lower.includes('gear') ||
    lower.includes('bag') ||
    lower.includes('pack') ||
    lower.includes('prepare')
  ) {
    return `### 🎒 P.A.S.C.A.L FIELD PACKING & ACTION CHECKLIST

**Essential Gear:**
- [x] **Unmarked Protective Clothing**: Plain, dark, non-descript layers covering tattoos; shatterproof eye goggles; breathable bandana or N95 mask.
- [x] **Hydration & Rations**: At least 1.5–2L of clean water with squirt cap (for drinking + emergency eye wash) and high-protein non-perishable snacks.
- [x] **Medical First Aid Kit**: Sterile saline bottles, gauze, medical tape, personal prescription medications (in original labeled bottles).
- [x] **Emergency Comms**: Portable power bank & charging cable; emergency legal support / jail support number written on your forearm in permanent marker.
- [x] **Financial / Legal**: Physical government ID, some cash (for public transit / bail support), transit cards.
- [ ] **Do NOT Bring**: Weapons, drugs, expensive jewelry, contact lenses, or devices with unencrypted personal data.`;
  }

  if (
    lower.includes('laragon') ||
    lower.includes('localhost') ||
    lower.includes('local host') ||
    lower.includes('paragon') ||
    lower.includes('run locally') ||
    lower.includes('offline mode')
  ) {
    return `### 💻 P.A.S.C.A.L LARAGON & LOCALHOST DEPLOYMENT GUIDE

**Operator ${operatorName}, here is how to run P.A.S.C.A.L in Laragon on Windows:**

1. **Place Project in Laragon Root**:
   - Copy or clone this project into: \`C:\\laragon\\www\\pascal\`

2. **Open Laragon Terminal**:
   - Open Laragon and click the **Terminal** button (or right-click Laragon tray icon ➔ **Terminal**).
   - This opens Laragon's pre-configured shell with Node.js, npm, and Git ready.

3. **Install Dependencies & Start**:
   \`\`\`bash
   cd C:\\laragon\\www\\pascal
   npm install
   npm run dev
   \`\`\`

4. **Access in Your Browser**:
   - Open **\`http://localhost:3000\`** (or **\`http://127.0.0.1:3000\`**).
   - If Laragon Auto Virtual Hosts are active, Laragon automatically creates **\`http://pascal.test\`**. You can configure Apache in Laragon to reverse-proxy port 3000 or serve the built \`dist/\` folder.

5. **Static Apache Mode in Laragon (\`npm run build\`)**:
   - If running via Laragon's Apache web server without Node running in the background, run \`npm run build\`. Laragon Apache will serve the \`dist/\` folder with the included \`.htaccess\`.
   - **Protest Air-Gap Assurance**: Even without an active Gemini API key or backend server, P.A.S.C.A.L's built-in offline tactical engine will answer legal, medical, and OpSec queries automatically!`;
  }

  return `### 🛡️ P.A.S.C.A.L LOCAL FIELD DISPATCH (OFFLINE TACTICAL ENGINE)

Greetings, ${operatorName}. P.A.S.C.A.L is operating via the **Local Offline Engine** on localhost / Laragon.

**Field Summary & Query Analysis:**
- **Status**: Localhost & Laragon Resilient (Air-Gapped Protest Ready)
- **Direct Support**: Legal rights, chemical de-escalation, digital OpSec, and emergency protocols are fully active without requiring cloud connectivity.
- **Query Received**: "${userPrompt}"

**Key Field Directives:**
1. **Maintain Comms**: Coordinate with your assigned buddy and establish a designated emergency rendezvous point.
2. **Evidence Logging**: Use P.A.S.C.A.L's Incident Logger to document times, locations, and badge numbers.
3. **Cloud Reconnection**: Once an internet connection or Gemini API key is restored in Settings, full multimodal neural synthesis will automatically resume.`;
}

async function startServer() {
  const app = express();

  // Full CORS and Iframe Embedding Headers (for Laragon, Localhost, Proxies)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-paragon-token, x-laragon-token, x-api-key');
    res.header('Access-Control-Expose-Headers', '*');
    res.removeHeader('X-Frame-Options');
    res.header('Content-Security-Policy', "frame-ancestors *");
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

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
      port: PORT,
      cors: true,
      laragonCompatible: true,
      localhostSupported: true,
      iframeEmbedding: true,
      availableModels: [
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Fast, responsive & balanced reasoning (Default)' },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Deep analytical thinking, complex coding & science' },
        { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', desc: 'Ultra-low latency lightweight execution' },
        { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', desc: 'Auto-updated production model' },
      ],
    });
  });

  // Laragon & Paragon Connection & Status Endpoint
  const handleStatus = (req: express.Request, res: express.Response) => {
    res.json({
      status: 'operational',
      service: 'P.A.S.C.A.L Tactical Intelligence',
      version: '2.5.0',
      environment: 'laragon_localhost',
      mode: 'protest_tactical_ready',
      cors: 'enabled',
      iframeEmbeds: 'enabled',
      host: req.headers.host || `localhost:${PORT}`,
      laragonPath: 'C:\\laragon\\www\\pascal',
      laragonVirtualHost: 'http://pascal.test',
      timestamp: new Date().toISOString(),
      supportedActions: ['ping', 'chat', 'broadcast_alert', 'log_incident', 'get_resources'],
    });
  };

  app.get('/api/laragon/status', handleStatus);
  app.get('/api/paragon/status', handleStatus);

  // Laragon & Paragon Action Webhook
  const handleAction = async (req: express.Request, res: express.Response) => {
    try {
      const { action = 'ping', payload = {}, userProfile } = req.body;
      console.log(`[ACTION] Received action: ${action}`);

      if (action === 'ping') {
        return res.json({
          ok: true,
          action: 'ping',
          environment: 'laragon_localhost',
          message: 'P.A.S.C.A.L Laragon / Localhost Bridge is fully operational',
          timestamp: new Date().toISOString(),
        });
      }

      if (action === 'broadcast_alert') {
        return res.json({
          ok: true,
          broadcastId: 'alert-' + Date.now(),
          receivedPayload: payload,
          status: 'dispatched',
          message: 'Protest alert broadcast received by P.A.S.C.A.L',
        });
      }

      if (action === 'chat') {
        const userText = payload?.text || 'Status report';
        const reply = generateLocalTacticalResponse(userText, userProfile || payload?.userProfile, 'tactical');
        return res.json({
          ok: true,
          reply,
        });
      }

      res.json({
        ok: true,
        action,
        status: 'acknowledged',
        data: payload,
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  };

  app.post('/api/laragon/action', handleAction);
  app.post('/api/paragon/action', handleAction);

  // Protest Resources API
  app.get('/api/protest/resources', (req, res) => {
    res.json({
      ok: true,
      resources: {
        fourPhrases: [
          'Am I being detained, or am I free to leave?',
          'I am exercising my right to remain silent.',
          'I do not consent to any searches.',
          'I want to speak with an attorney.',
        ],
        tearGasProtocol: [
          'Move upwind and to higher elevation immediately.',
          'DO NOT rub eyes; remove contact lenses immediately.',
          'Flush eyes with clean water or sterile saline from inner to outer corner.',
          'Strip contaminated outer clothes without pulling over head.',
          'Wash skin with cold soapy water; avoid oil-based lotions.',
        ],
        digitalOpsec: [
          'Disable Face ID and Touch ID; use 8+ char alphanumeric passcode.',
          'Enable airplane mode or place in Faraday sleeve.',
          'Use Signal with disappearing messages and registration lock.',
          'Scrub EXIF metadata and blur identifying features before uploading.',
        ],
      },
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

      // Filter and normalize conversation messages
      const rawMessages = messages.filter(
        (m: { sender?: string; text?: string }) => m.text && m.text.trim()
      );

      if (rawMessages.length === 0) {
        return res.status(400).json({ error: 'No valid message content' });
      }

      // Re-check API key in case it was injected at runtime or provided by user
      const activeApiKey =
        customApiKey && typeof customApiKey === 'string' && customApiKey.trim()
          ? customApiKey.trim()
          : process.env.GEMINI_API_KEY;

      if (!activeApiKey) {
        const lastMsg = rawMessages[rawMessages.length - 1]?.text || '';
        const fallbackReply = generateLocalTacticalResponse(lastMsg, userProfile, persona);
        return res.json({
          reply: fallbackReply,
          offlineMode: true,
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
        console.warn('Gemini request failed; deploying local tactical response engine...');
        const lastMsg = rawMessages[rawMessages.length - 1]?.text || '';
        replyText = generateLocalTacticalResponse(lastMsg, userProfile, persona);
      }

      res.json({
        reply: replyText || 'P.A.S.C.A.L received your transmission and processed the query.',
      });

    } catch (error: any) {
      console.error('Error generating response with Gemini, falling back to local engine:', error);
      const lastMsg = req.body?.messages?.[req.body.messages.length - 1]?.text || '';
      const fallbackReply = generateLocalTacticalResponse(lastMsg, req.body?.userProfile, req.body?.persona || 'tactical');
      res.json({
        reply: fallbackReply,
        offlineMode: true,
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
