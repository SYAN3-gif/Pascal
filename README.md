# P.A.S.C.A.L — Tactical AI Assistant & Field Protest System

> **Personal Automated System for Computing Assistance and Learning**  
> Advanced neural assistant featuring speech synthesis, biometric authentication, optical gesture control, and a dedicated **Protest Field Hub** with full **Laragon (Windows) & Localhost Support** and **Air-Gapped Resiliency**.

---

## ⚡ Running in Laragon on Windows

Laragon is a popular, fast development environment for Windows. P.A.S.C.A.L is fully optimized to run inside Laragon on `localhost:3000` or via Laragon's automatic virtual host `http://pascal.test`.

### Method 1: Laragon Terminal (Full Dev Server — Recommended)
1. **Copy or clone the repository** into your Laragon `www` directory:
   ```bash
   C:\laragon\www\pascal
   ```
2. **Open Laragon Terminal**:
   - Right-click the Laragon tray icon ➔ click **Terminal** (or click the **Terminal** button on the Laragon window).
3. **Navigate & Install**:
   ```bash
   cd C:\laragon\www\pascal
   npm install
   ```
4. **Start the Application**:
   ```bash
   npm run dev
   ```
5. **Open in Your Browser**:
   - Navigate to: **`http://localhost:3000`**
   - If Laragon Auto Virtual Hosts are active, you can also map and access **`http://pascal.test`**.

### Method 2: Laragon Apache Web Server (Static Production Build)
1. In the Laragon Terminal inside `C:\laragon\www\pascal`, run:
   ```bash
   npm run build
   ```
2. Laragon's Apache will serve the output directory (`dist/`) directly.
3. The project includes a configured **`.htaccess`** that manages single-page application (SPA) routing and CORS headers automatically in Laragon Apache.

### Method 3: Air-Gapped Protest Demonstration Mode
- When demonstrating or protesting in the field where cellular networks are jammed, unconfigured, or disconnected, P.A.S.C.A.L automatically activates its **Client-Side Tactical Response Engine**.
- Legal rights, tear gas decontamination, OpSec checklists, emergency screen beacons, and audio sirens work 100% locally with zero internet required.

---

## ⚡ Quick Start: Standard Localhost

Anyone on Windows, macOS, or Linux can run this application locally:

### 1. Clone & Install
```bash
git clone <repository-url>
cd pascal
npm install
```

### 2. Configure Environment (Optional)
Create a `.env` file in the root directory:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note for Protest & Offline Use:** An API key is **not required**. If no key or internet is available, P.A.S.C.A.L automatically deploys its **Local Tactical Engine** to provide immediate guidance!

### 3. Launch Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🔗 Laragon & Localhost API Endpoints

P.A.S.C.A.L provides dedicated REST endpoints for Laragon local environments:

### 1. Status & Bridge Check
```http
GET /api/laragon/status
```
Returns system operational state, Laragon path (`C:\laragon\www\pascal`), virtual host info (`http://pascal.test`), and active mode.

### 2. Laragon Action Execution
```http
POST /api/laragon/action
Content-Type: application/json

{
  "action": "ping" | "chat" | "broadcast_alert",
  "payload": {
    "text": "Status report",
    "alertLevel": "high"
  }
}
```
### 3. Protest Safety Data API
```http
GET /api/protest/resources
```
  Returns pre-compiled 4 Golden Phrases, chemical decontamination instructions, and digital OpSec checklists.

---

## 🛡️ Protest Field Hub (Direct Action Toolkit)

Designed for demonstrations, marches, and community organizing:

1. **Legal Shield & 4 Golden Phrases:**
   - *"Am I free to leave or am I being detained?"*
   - *"I am exercising my right to remain silent."*
   - *"I do not consent to any searches."*
   - *"I want to speak with an attorney."*
   - Right to film police guidelines.
   - Customizable **Forearm Emergency Numbers** (Jail Support, Legal Observers, Trusted Buddy) with one-click copy.

2. **Tear Gas & Chemical Decontamination:**
   - Immediate triage for CS Gas, OC Pepper Spray, and chemical irritants.
   - Step-by-step eye flushing procedure (inner-to-outer corner using clean water/saline).
   - Clothing removal & cold water wash protocols.

3. **Digital OpSec & Gear Checklist:**
   - 10-point field readiness checklist (disable Face ID/Touch ID, alphanumeric passcode, airplane mode / Faraday shield, Signal disappearing messages).
   - Saved locally in browser storage (`localStorage`).

4. **Emergency Screen Beacon & Siren:**
   - High-candela flashing screen beacon (Tactical Amber, Emergency Red Strobe, S.O.S High Contrast).
   - Oscillating acoustic tone generator to signal allies or call for medics in crowded environments.

5. **Field Incident & Evidence Locker:**
   - Timestamped recording of locations, officer badge numbers, patrol vehicle IDs, and incident descriptions.
   - One-click export to `.json` for legal defense organizations (ACLU, National Lawyers Guild).

---

## 🛠️ Build for Production
To bundle and run the optimized production build:
```bash
npm run build
npm start
```
Runs on `http://0.0.0.0:3000` (or the port specified by `$PORT`).
