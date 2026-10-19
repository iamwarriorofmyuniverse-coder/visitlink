# VisitLink: Known Limitations & Next Steps (Post-MVP Roadmap)

This document transparently records current design boundaries, architectural assumptions, and the future development roadmap for VisitLink.

---

## 1. Intentionally Out-of-Scope for MVP

As mandated by product specifications, the following capabilities are deliberately omitted from the MVP:

1. **Monetary Transactions & Payments**:
   - *Current Behavior*: Industrial visits are coordinated on educational and CSR goodwill agreements. No fee collection or deposit holds are processed on-platform.
   - *Future Roadmap*: Integration with Razorpay / Stripe for subsidized industrial training fees, lab consumables reimbursement, or refundable security deposits.
2. **In-App Real-Time Messaging & Chat**:
   - *Current Behavior*: All communication occurs through asynchronous status updates, official manager notes, reschedule proposals, and transactional email notifications.
   - *Future Roadmap*: WebSockets / Supabase Realtime messaging channel for coordinators and plant managers with automatic profanity/spam filtering.
3. **Native Mobile App (iOS / Android)**:
   - *Current Behavior*: Mobile-first, fully responsive web application tested on viewports like iPhone 13 (390x844).
   - *Future Roadmap*: React Native or Flutter cross-platform mobile app leveraging native camera for on-site QR code badge scanning at factory security gates.
4. **Transport & Bus Fleet Booking**:
   - *Current Behavior*: Educational institutions arrange their own college buses or private charters.
   - *Future Roadmap*: Integration with verified institutional bus and fleet operators for end-to-end logistics.
5. **Predictive Attendance / No-Show Machine Learning Models**:
   - *Current Behavior*: The `visit_request_analytics` table logs tabular features (lead time, distance, group size, sector, turnaround time, outcome) to accumulate clean training data. No predictive model is deployed yet to avoid premature bias or false rejections.

---

## 2. Safety, Data Privacy & Legal Compliance

1. **Student Minor PII & Parental Consent**:
   - *Current State*: Rosters and parental consent scans are restricted to a private Supabase Storage bucket (`compliance-documents`) with Row Level Security. Signed URLs expire after 5 minutes and are only accessible by the requesting coordinator, the assigned facility manager, and platform admins.
   - *Next Step*: Integration with digital signature workflows (e.g., Aadhaar eSign / DigiLocker in India) so parents can authorize industrial visits paperlessly with cryptographic validity.
2. **Industrial Non-Disclosure (NDA) & Intellectual Property**:
   - *Current State*: Coordinators digitally acknowledge that visiting students will respect factory photo bans and intellectual property guidelines.
   - *Next Step*: Facility-specific customized NDA workflows with mandatory student digital acknowledgments prior to gate pass generation.

---

## 3. Geospatial & PostGIS Infrastructure

1. **Coordinate Accuracy & OpenStreetMap Limitations**:
   - *Current State*: Uses PostGIS `geography(Point, 4326)` for metric distance calculations via `ST_DWithin` and Leaflet with OpenStreetMap tiles. Free and open-source with zero API fees.
   - *Limitation*: OpenStreetMap tiles do not provide real-time turn-by-turn traffic routing or travel time estimations (e.g., peak morning industrial traffic on Avinashi Road).
   - *Next Step*: Optional OSRM (Open Source Routing Machine) or Google Maps Distance Matrix integration for driving-time-based radius filters.

---

## 4. AI & Retrieval Layer

1. **Embedding Model & Memory Footprint**:
   - *Current State*: `BAAI/bge-small-en-v1.5` (384 dimensions) runs in-container via ONNX Runtime / `fastembed`, consuming <250MB RAM and delivering ~15ms inference on CPU.
   - *Limitation*: Embedding text is currently evaluated primarily in English. Multilingual syllabi (Tamil / regional Indian languages) would require a multilingual model like `multilingual-e5-small`.
2. **Evaluation Datasets**:
   - *Current State*: The evaluation harness strictly enforces the zero-fabrication contract. It expects user-authored labels in `eval/data/matching_labeled_set.json` and `eval/data/triage_labeled_set.json` against the exported `seed_catalog.json`.
