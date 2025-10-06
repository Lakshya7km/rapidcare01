Dr. Shyama Prasad Mukherjee International Institute of Information Technology, Naya Raipur

Minor Project / UG Research Report

- Work Title: RapidCare – Real-time Emergency Management for Hospitals
- Group Member(s) Name: [Add Names]
- Supervisor Name: [Add Name]
- Date: 05-10-2025

Contents
- Introduction
- Motivation: Issues and Challenges
- Literature Review
- Problem Definition and Research Gap
- Objectives
- Proposed Framework/Model/Methodology
- Block Diagram and Workflow
- Database Description
- Experimental Results and Discussion
- Plan of Action for the Project
- Conclusion and Future Directions

Introduction
RapidCare is a web-based, real-time system that streamlines emergency request handling between the public, ambulances, hospital reception, and doctors. It provides role-based portals (Public, Ambulance, Reception/Hospital, Doctor) to submit, triage, and respond to emergencies, along with staffing features such as doctor attendance (manual and QR-based). The platform uses Node.js/Express, MongoDB (Mongoose), and Socket.IO for real-time updates.

Motivation: Issues and Challenges
- Fragmented emergency intake: Calls and manual notes lead to delays and missing data.
- Broadcast overload: Requests reaching all hospitals create noise; need targeted routing.
- Limited visibility: Public and ambulance teams lack status visibility after submission.
- Staffing coordination: Tracking doctors’ availability and attendance is inconsistent.
- Data hygiene: Demo iterations leave stale or unused collections that bloat the DB.

Literature Review
The following table summarizes related efforts in emergency management and hospital information systems.

| References | Technique Used | Database Used | Accuracy/Measures | Remarks |
|------------|----------------|---------------|-------------------|---------|
| EMS dispatch triage (sample) | Rule-based triage + priority queues | Relational | Avg. response time, SLA adherence | Strong on dispatch, weak on hospital integration |
| Hospital Information Systems (sample) | CRUD + role-based access | Mixed (RDBMS/NoSQL) | Uptime, throughput | Limited real-time eventing |
| Real-time telemedicine (sample) | WebRTC + messaging | NoSQL | Latency, session success | Focused on video; not triage |

Problem Definition and Research Gap
- Problem: Build an integrated, hospital-centric emergency request system that ensures targeted routing (no broadcast), real-time bidirectional updates, and operational staffing features.
- Research Gaps: (i) Targeted routing for public emergencies tied to explicit hospital selection; (ii) Unified real-time feedback loops for ambulance/public users; (iii) Low-friction attendance capture integrated with hospital portals.

Objectives
- Route public emergency requests to the explicitly selected hospital only.
- Provide separate reception queues for Public vs Ambulance requests with rich detail view and actions.
- Offer Accept/Reject/Transfer workflows that notify stakeholders in real-time.
- Implement doctor attendance (manual + QR) and profile management.
- Maintain database hygiene with scripted cleanup.

Proposed Framework/Methodology
Stack: Node.js + Express (REST APIs), Socket.IO (real-time), MongoDB (Mongoose), Vanilla JS frontends. JWT-based auth for roles: hospital, doctor, ambulance.

High-level Steps
1. Authentication: Login issues JWT; clients store token in localStorage.
2. Public Flow: Public selects hospital and submits emergency; server persists and emits only to that hospital’s room.
3. Ambulance Flow: Authenticated ambulance submits to assigned hospital; reception receives and responds.
4. Reception Actions: Accept/Reject/Transfer endpoints update DB and emit real-time updates to relevant rooms.
5. Doctor Module: Profile update; attendance via manual form or QR scan endpoints.
6. Data Hygiene: `scripts/cleanupMongo.js` to drop unused collections.

Pseudo Code (Selected)
Public Emergency Submission (routes/emergency.js)
```
if (!payload.hospitalId) return 400
payload.submittedBy = 'public'
payload.status = 'Pending'
save(emergency)
emit to room `hospital_${hospitalId}` with event 'emergency:new:public'
```

Reception Accept Action
```
update emergency.status = 'Accepted', hospitalId = currentHospital
emit 'emergency:update' to `hospital_${hospitalId}` and ambulance room (if applicable)
```

Doctor Attendance QR Scan
```
GET /api/doctors/attendance/scan/:doctorId?set=Present|Absent&shift=...
upsert Attendance{ doctorId, date=today, availability=set, shift, markedBy='Doctor' }
return success page
```

Block Diagram and Workflow
```
[Public Portal] --submit--> [API /emergency/public] --persist--> [MongoDB]
     |                                              |
     v                                              v
 [Socket.IO] --emit to hospital_{id}--> [Reception Portal]
                                              |
                                [Accept/Reject/Transfer]
                                              |
                              [Socket.IO emits updates]
                     [Ambulance Portal]    [Public Status Poll]

[Doctor Portal] <--> [API /doctors] <--> [MongoDB]
  | manual + QR attendance
```

Database Description
| Dataset/Collection | Key Fields | Instances (example) | Remarks |
|--------------------|------------|----------------------|---------|
| hospitals | hospitalId, name, address, services | ~5-20 | Master data |
| doctors | doctorId, hospitalId, profile, shift | ~20-100 | Staff data |
| ambulances | ambulanceId, crew, status | ~5-50 | Operational fleet |
| beds | hospitalId, ward, bedType, status | ~50-500 | Capacity tracking |
| emergencyRequests | patient, submittedBy, hospitalId, status | 50+ | Core workflow |
| attendance | doctorId, date, availability, shift | Daily rows | HR/logging |

Experimental Results and Discussion
- Performance: Socket emissions scoped to hospital rooms reduce unnecessary traffic.
- Functional Validation: Public requests appear only at the selected hospital; ambulance updates reflect immediately.
- Protocols: JWT auth on protected routes; CORS/local deployment friendly.
- Evaluation Measures: End-to-end latency from submission to reception display (<1–2s locally), correctness of status propagation, data integrity under concurrent actions.
- Benchmarks: Local testing with simulated submissions shows consistent sub-second DB writes and emissions.

Plan of Action for the Project
- Short term: Add OTP-based public tracking link; audit trail for status transitions.
- Medium term: Intelligent hospital recommendations by specialty and bed availability; rate limiting and CAPTCHA on public endpoint.
- Long term: Progressive Web App (PWA) features for offline ambulance use; automated E2E tests and CI.

Conclusion and Future Directions
RapidCare demonstrates a practical, hospital-centric emergency management workflow with clear role separation, targeted routing, and real-time updates. Future work focuses on security hardening, public self-service tracking, and smarter hospital recommendations.

Thank You
Dr. Shyama Prasad Mukherjee International Institute of Information Technology, Naya Raipur

