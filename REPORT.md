## RapidCare - Project Report

### 1. Title and Purpose
RapidCare: Real-time hospital emergency management for public and ambulance workflows, reception triage, doctor attendance, and role-based administration.

### 2. Tech Stack
- Backend: Node.js, Express, Socket.IO, MongoDB (Mongoose)
- Frontend: Plain HTML/CSS/JS served from Express (deployed-friendly), Vercel-ready static pages
- Auth: JWT-based (roles: admin/hospital, doctor, ambulance)
- Infra: PDFKit, QRCode for attendance QR generation

### 3. Modules Implemented
- User Authentication (JWT), login flows for Hospital (Reception), Doctor, Ambulance
- Role-based Dashboards
  - Reception: Hospital info, beds, doctors, ambulances, live emergencies
  - Doctor: Profile, password change, attendance (manual + QR)
  - Ambulance: Profile, emergency submission, live responses
- Emergency Request Management
  - Public requests now route only to selected hospital
  - Ambulance requests route to the assigned hospital
  - Reception actions: Accept, Reject (with reason), Transfer (with alternate hospital + reason)
  - Real-time updates to hospital rooms; ambulance receives responses live
- Attendance System
  - Doctor attendance model with shift support
  - Reception marking and per-doctor history
  - Hospital-wide attendance QR landing and downloadable QR PDF
- Profile Update
  - Doctor and Ambulance profile and password flows

### 4. Recent Fixes and Improvements
- Public Emergency Routing
  - Updated `routes/emergency.js` to require `hospitalId` and emit to `hospital_{id}` room only
  - Reception now fetches public requests scoped to the current hospital
- Reception UI Simplification
  - Clear tabs to filter public vs ambulance requests
  - Detailed modal with quick Accept/Reject/Transfer, validations for reasons
- Doctor Portal
  - Ensured shared client utilities load; auto-login behavior based on localStorage
- Attendance Enhancements
  - QR-based attendance scan page per hospital
  - Hospital-wide QR PDF generator

### 5. Data Model (Core Collections)
- `users` (if present), `hospitals`, `doctors`, `ambulances`, `beds`, `emergencyRequests`, `attendance`

### 6. Database Hygiene
- Script `scripts/cleanupMongo.js` drops any collections not among the core list
- Run with: `MONGODB_URI=... node scripts/cleanupMongo.js`

### 7. How the Flows Work
- Public
  1) Public fills form and chooses hospital → POST `/api/emergency/public` with `hospitalId`
  2) Request stored as Pending; emitted to `hospital_{hospitalId}` only
  3) Reception processes in `Emergencies` → Accept/Reject/Transfer
  4) Status visible to reception; optional notifications to ambulance only when applicable
- Ambulance
  1) Ambulance logs in → submits emergency to a hospital → emitted to `hospital_{id}`
  2) Reception responds; ambulance receives `emergency:update`
- Doctor
  1) Login → profile/attendance → QR or manual attendance; reception can also mark

### 8. Future Improvements
- Public-facing status tracking link (OTP-secured)
- Bed auto-recommendations by specialty and live capacity
- Rate limiting and CAPTCHA on public emergency endpoint
- Audit trails for all status changes
- E2E tests (Playwright) for critical flows

### 9. Deployment Notes
- Configure `JWT_SECRET` and `BASE_URL`
- Ensure Mongo URI provided via `MONGODB_URI`
- Reverse proxy websockets (Socket.IO) for production


