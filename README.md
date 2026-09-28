# UHF Solutions Digital Card & Dynamic QR System

An enterprise-grade Digital Business Card, Dynamic QR Code, and Contact Management platform designed for **UHF Solutions**.

Employees receive their own personalized digital contact card (`/card/[employeeId]`), vector/high-resolution QR code, and downloadable `.vcf` VCard for seamless single-tap saving into iOS and Android contact apps.

---

## 1. Features Overview

* **Two Distinct User Roles (RBAC)**:
  * **ADMIN**: Full dashboard, employee lifecycle management (create, edit, toggle active/inactive, reset password, delete), company settings management, and QR badge export.
  * **EMPLOYEE**: Employee dashboard, allowed profile editing (phone, WhatsApp, bio, social links, portrait photo), personal dynamic QR code, shareable digital card, and secure password changes. An employee cannot escalate their role or modify restricted company fields.
* **Public Digital Business Cards (`/card/[employeeId]`)**:
  * Clean, corporate software-company aesthetic (UHF Solutions branding).
  * Direct action buttons: **Call**, **WhatsApp**, **Email**, **LinkedIn**, **Share Card**, and **Show QR**.
  * Highly visible, prominent **Save Contact to Phone** button triggering standards-compliant VCard `.vcf` downloads.
  * Polished deactivated/unavailable state when an employee is disabled.
* **Dynamic QR Code System**:
  * Encodes the permanent URL (`/card/[employeeId]`), not static text. When an employee changes phone or designation, printed badges stay valid!
  * Instant generation and download as high-res PNG and vector SVG for print badges.
* **Firebase Backend & Cloud Integration**:
  * Provisioned Cloud Firestore database (`firebase-applet-config.json`).
  * `firestore.rules` deployed enforcing strict owner, public-card, and admin-only rules.
  * `storage.rules` configured for secure employee avatar and asset uploads.
  * Firebase SDK configured in `src/lib/firebase.ts`.
* **Privacy & Access Control**:
  * Admin-configurable visibility toggles for phone, WhatsApp, email, LinkedIn, and office address.
  * Passwords hashed using `bcrypt` (10 rounds).
  * Strict session verification via JWT tokens.
  * No password hashes or internal secrets exposed in API responses or public views.

---

## 2. Default Seed Credentials (Development)

The system automatically initializes and seeds the database on first run:

| Role | Employee ID | Email | Password |
|---|---|---|---|
| **Administrator** | `ADMIN-001` | `admin@uhfsolutions.com` | `AdminPassword123!` |
| **Employee (Dev)** | `UHF-001` | `ahmed@uhfsolutions.com` | `Password123!` |
| **Employee (Design)** | `UHF-002` | `ali@uhfsolutions.com` | `Password123!` |
| **Employee (PMO)** | `UHF-003` | `usman@uhfsolutions.com` | `Password123!` |

*(Clicking the demo buttons on the login page autofills these credentials instantly for testing).*

---

## 3. Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
* **Backend**: Express 4, Node.js (v22+), JWT Authentication, Bcrypt password hashing
* **Firebase Services**:
  * Cloud Firestore
  * Firebase Authentication
  * Firebase Storage rules (`storage.rules`)
  * Firestore Security rules (`firestore.rules`)
* **QR Generation**: `qrcode` library with High error correction, PNG data URL, and SVG vector strings.
* **VCard Engine**: RFC 2426 vCard 3.0 specification generator with CRLF formatting and field escaping.

---

## 4. Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Public URL of the deployed application
APP_URL=http://localhost:3000

# JWT signing secret for sessions
JWT_SECRET=uhf_solutions_jwt_secret_key_prod_minimum_32_characters_long

# Firebase Client Configuration
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="gen-lang-client-0238637067.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="gen-lang-client-0238637067"
VITE_FIREBASE_STORAGE_BUCKET="gen-lang-client-0238637067.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="621756043106"
VITE_FIREBASE_APP_ID="1:621756043106:web:1e9646c8738b54e4f0a63b"

# Port & Runtime
PORT=3000
NODE_ENV=development
```

---

## 5. Development & Running

### Install dependencies:
```bash
npm install
```

### Start full-stack development server:
```bash
npm run dev
```
The server runs on `http://localhost:3000`, serving both the backend API endpoints (`/api/*`) and the Vite React frontend.

### Production build:
```bash
npm run build
npm start
```

---

## 6. How the Features Work

### Dynamic QR Codes
Dynamic QR codes encode the permanent URL (`https://your-domain.com/card/[employeeId]`) rather than static vCard text directly inside the QR bitmap. This ensures that when an employee updates their phone number or receives a promotion, physical cards and ID badges do not need to be reprinted. The code can be downloaded in high-resolution PNG or crisp vector SVG format.

### Standards-Compliant VCard (.vcf)
Clicking **Save Contact to Phone** creates an RFC 2426 vCard 3.0 file with correct MIME type `text/vcard` and CRLF line endings. The `.vcf` file includes name, title, company, phone, email, website, LinkedIn, and headquarters address, importing directly into the native contacts app on iPhone, Android, Outlook, and macOS.

### Role-Based Access Control (RBAC)
- **Admin**: Has access to `/admin/dashboard`, `/admin/employees`, `/admin/employees/new`, `/admin/employees/:id/edit`, and `/admin/company-settings`.
- **Employee**: Has access to `/employee/dashboard`, `/employee/profile`, `/employee/card`, `/employee/qr`, and `/employee/settings`.
- **Public**: Has direct access to `/card/:employeeId`. When an account is marked inactive, the public card immediately reflects a polite "Card Temporarily Unavailable" notice.
