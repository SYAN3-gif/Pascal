// P.A.S.C.A.L Tactical Field & Laragon Localhost Response Engine
// Operates 100% client-side or server-side without requiring internet connection.

export function generateClientTacticalResponse(
  userPrompt: string,
  userProfile?: { name?: string; role?: string }
): string {
  const lower = (userPrompt || '').toLowerCase();
  const operatorName = userProfile?.name || 'Operator';

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
   - This opens Laragon's pre-configured shell with Node.js and Git ready.

3. **Install Dependencies & Start**:
   \`\`\`bash
   cd C:\\laragon\\www\\pascal
   npm install
   npm run dev
   \`\`\`

4. **Access in Your Browser**:
   - Open **\`http://localhost:3000\`** (or **\`http://127.0.0.1:3000\`**).
   - If Laragon Auto Virtual Hosts are active, Laragon maps \`C:\\laragon\\www\\pascal\` to **\`http://pascal.test\`**. You can configure Apache in Laragon to reverse-proxy port 3000 or serve the built \`dist/\` folder.

5. **Static Apache Mode in Laragon (\`npm run build\`)**:
   - If running via Laragon's Apache web server without Node running in the background, run \`npm run build\`. Laragon Apache will serve the \`dist/\` folder with the included \`.htaccess\`.
   - **Protest Air-Gap Assurance**: Even without an active Gemini API key or backend server, P.A.S.C.A.L's built-in offline tactical engine will answer legal, medical, and OpSec queries automatically!`;
  }

  if (
    lower.includes('tear gas') ||
    lower.includes('pepper spray') ||
    lower.includes('cs gas') ||
    lower.includes('chemical') ||
    lower.includes('irritant') ||
    lower.includes('eyes') ||
    lower.includes('gas') ||
    lower.includes('decontamination')
  ) {
    return `### 🚨 P.A.S.C.A.L TACTICAL FIELD PROTOCOL: CHEMICAL IRRITANT DECONTAMINATION

**Immediate Action for ${operatorName} and Comrades:**
1. **Clear the Hot Zone**: Move upwind and to higher elevation immediately. Walk briskly—do not sprint to avoid breathing in aerosol particles.
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

  return `### 🛡️ P.A.S.C.A.L LOCAL FIELD DISPATCH (OFFLINE TACTICAL ENGINE)

Greetings, ${operatorName}. P.A.S.C.A.L is operating via the **Local Offline Engine** (Laragon & Localhost Ready).

**Field Summary & Query Analysis:**
- **Status**: Localhost & Offline Resilient (Laragon & Air-Gapped Ready)
- **Direct Support**: Legal rights, chemical de-escalation, digital OpSec, and emergency protocols are fully active without requiring cloud connectivity.
- **Query Received**: "${userPrompt}"

**Key Field Directives:**
1. **Maintain Comms**: Coordinate with your assigned buddy and establish a designated emergency rendezvous point.
2. **Evidence Logging**: Use P.A.S.C.A.L's Incident Logger to document times, locations, and badge numbers.
3. **Cloud Reconnection**: Once an internet connection or Gemini API key is restored in Settings, full multimodal neural synthesis will automatically resume.`;
}
