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
* **Cloud / Persistence:**
  * Netlify Blobs provides persistent application data and image storage on the free Netlify plan.
  * The primary application database is the `uhf-solutions-data` Netlify Blobs store.
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

* **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
* **Backend**: Express 4, Node.js (v22+), JWT Authentication, Bcrypt password hashing
* **Deployment persistence**:
  * Netlify Functions
  * Netlify Blobs (persistent JSON database + image assets)
  * JWT + bcrypt authentication
* **QR Generation**: `qrcode` library with High error correction, PNG data URL, and SVG vector strings.
* **VCard Engine**: RFC 2426 vCard 3.0 specification generator with CRLF formatting and field escaping.

---

## 4. Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Public URL of the deployed application
APP_URL=http://localhost:3000

# JWT signing secret for sessions
JWT_SECRET=replace_with_a_random_32_plus_character_secret_or_leave_unset_on_netlify

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


## 7. Netlify deployment

This project is designed to run without a payment card on Netlify's Free plan. Netlify Functions provide the API and Netlify Blobs provide persistent data and image storage.

The application can generate and persist its JWT secret automatically in a private Netlify Blobs store. You may still set `JWT_SECRET` manually (32+ characters) if you prefer to control it.

After deployment, test:

- `/api/health`
- `/login`
- Admin demo login: `ADMIN-001` / `AdminPassword123!`
- `/card/UHF-001`

Do not distribute the demo credentials publicly. Change or delete the seeded demo accounts before real production use.
