import {
  Issue,
  IssueStatus,
  IssueStatusHistory,
  Department,
  ComplaintEmail,
  ResolutionProof,
  NGO,
  NGOEvent,
  EventRegistration,
  WardRepresentative,
  Profile,
  Badge,
  CitizenReporter
} from '../types';

// Default Hyderabad Departments (GHMC & HMWSSB)
export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept_pwd',
    name: 'GHMC Road Engineering & Potholes Cell',
    category: 'Potholes & Roads',
    city: 'Hyderabad',
    tier1_email: 'roads.engineering@ghmc.gov.in',
    tier2_email: 'chiefengineer.roads@ghmc.gov.in',
    tier3_email: 'commissioner@ghmc.gov.in',
    response_sla_days: 2,
  },
  {
    id: 'dept_sanitation',
    name: 'GHMC Health & Solid Waste Management Dept',
    category: 'Garbage & Sanitation',
    city: 'Hyderabad',
    tier1_email: 'sanitation.health@ghmc.gov.in',
    tier2_email: 'dycommissioner.swm@ghmc.gov.in',
    tier3_email: 'commissioner@ghmc.gov.in',
    response_sla_days: 1,
  },
  {
    id: 'dept_water',
    name: 'HMWSSB Water Supply & Sewerage Board',
    category: 'Water Supply',
    city: 'Hyderabad',
    tier1_email: 'water.board@hmwssb.in',
    tier2_email: 'superintending.water@hmwssb.in',
    tier3_email: 'managingdirector@hmwssb.in',
    response_sla_days: 1,
  },
  {
    id: 'dept_lighting',
    name: 'TSSPDCL & GHMC Street Lighting Division',
    category: 'Street Lighting',
    city: 'Hyderabad',
    tier1_email: 'electrical.lighting@ghmc.gov.in',
    tier2_email: 'ee.electrical@ghmc.gov.in',
    tier3_email: 'commissioner@ghmc.gov.in',
    response_sla_days: 1,
  },
  {
    id: 'dept_drainage',
    name: 'GHMC Urban Stormwater & Drainage Cell',
    category: 'Drainage & Sewage',
    city: 'Hyderabad',
    tier1_email: 'drainage.sewage@ghmc.gov.in',
    tier2_email: 'chiefengineer.drainage@ghmc.gov.in',
    tier3_email: 'commissioner@ghmc.gov.in',
    response_sla_days: 2,
  },
];

// Real Hyderabad Ward Representatives & Local Leaders
export const INITIAL_WARDS: WardRepresentative[] = [
  {
    id: 'ward_0',
    ward_number: 1,
    ward_name: 'GHMC Head Office (Greater Hyderabad Municipal Corp)',
    representative_name: 'Gadwal Vijayalakshmi',
    designation: 'Mayor / Chief Executive',
    party: 'BRS',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    office_address: 'GHMC Head Office, CC Complex, Tank Bund Road, Lower Tank Bund, Hyderabad - 500063',
    contact_phone: '+91 40 2111 1111',
    helpline_email: 'commissioner@ghmc.gov.in',
    department_name: 'GHMC Executive Council & Mayor Secretariat',
    time_period: 'Q3 2026 (Last 30 Days Audit)',
    total_complaints: 184,
    resolved_complaints: 152,
    pending_complaints: 24,
    ignored_breached_complaints: 8,
    avg_sla_days: 1.1,
  },
  {
    id: 'ward_1',
    ward_number: 101,
    ward_name: 'Jubilee Hills (Division 101 / Const. 61)',
    representative_name: 'Maganti Gopinath',
    designation: 'MLA / Ward Representative',
    party: 'BRS',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    office_address: 'Plot 120, Road No. 36, Jubilee Hills, Hyderabad - 500033',
    contact_phone: '+91 98490 12345',
    helpline_email: 'mla.jubileehills@telangana.gov.in',
    department_name: 'Khairatabad Zone Infrastructure & Engineering Dept',
    time_period: 'Q3 2026 (Last 30 Days Audit)',
    total_complaints: 48,
    resolved_complaints: 38,
    pending_complaints: 7,
    ignored_breached_complaints: 3,
    avg_sla_days: 1.5,
  },
  {
    id: 'ward_2',
    ward_number: 100,
    ward_name: 'Khairatabad (Division 100 / Const. 60)',
    representative_name: 'Danam Nagender',
    designation: 'MLA / Ward Representative',
    party: 'INC',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    office_address: 'H.No. 6-3-634, Raj Bhavan Road, Khairatabad, Hyderabad - 500004',
    contact_phone: '+91 98490 23456',
    helpline_email: 'mla.khairatabad@telangana.gov.in',
    department_name: 'GHMC Central Zone Sanitation & Public Works',
    time_period: 'Q3 2026 (Last 30 Days Audit)',
    total_complaints: 52,
    resolved_complaints: 39,
    pending_complaints: 9,
    ignored_breached_complaints: 4,
    avg_sla_days: 1.8,
  },
  {
    id: 'ward_3',
    ward_number: 102,
    ward_name: 'Sanathnagar (Division 102 / Const. 62)',
    representative_name: 'Talasani Srinivas Yadav',
    designation: 'MLA / Ward Representative',
    party: 'BRS',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    office_address: 'Nehru Nagar, West Marredpally, Secunderabad, Hyderabad - 500026',
    contact_phone: '+91 98490 34567',
    helpline_email: 'mla.sanathnagar@telangana.gov.in',
    department_name: 'GHMC Secunderabad Zone Electrical & Lighting Dept',
    time_period: 'Q3 2026 (Last 30 Days Audit)',
    total_complaints: 61,
    resolved_complaints: 50,
    pending_complaints: 8,
    ignored_breached_complaints: 3,
    avg_sla_days: 1.4,
  },
  {
    id: 'ward_4',
    ward_number: 107,
    ward_name: 'Serilingampally - HITEC City (Division 107 / Const. 112)',
    representative_name: 'Arekapudi Gandhi',
    designation: 'MLA / Ward Representative',
    party: 'BRS',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    office_address: 'Opp. Cyber Towers, Mindspace Junction, Madhapur, Hyderabad - 500081',
    contact_phone: '+91 98490 45678',
    helpline_email: 'mla.serilingampally@telangana.gov.in',
    department_name: 'GHMC Serilingampally Cyberabad Urban Infrastructure',
    time_period: 'Q3 2026 (Last 30 Days Audit)',
    total_complaints: 74,
    resolved_complaints: 59,
    pending_complaints: 11,
    ignored_breached_complaints: 4,
    avg_sla_days: 1.2,
  },
  {
    id: 'ward_5',
    ward_number: 146,
    ward_name: 'Secunderabad (Division 146 / Const. 63)',
    representative_name: 'T. Padma Rao Goud',
    designation: 'MLA / Ex-Deputy Speaker',
    party: 'BRS',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    office_address: 'Station Road, Clock Tower Square, Secunderabad - 500003',
    contact_phone: '+91 98490 56789',
    helpline_email: 'mla.secunderabad@telangana.gov.in',
    department_name: 'GHMC Secunderabad Water Works & Drainage Wing',
    time_period: 'Q3 2026 (Last 30 Days Audit)',
    total_complaints: 41,
    resolved_complaints: 31,
    pending_complaints: 6,
    ignored_breached_complaints: 4,
    avg_sla_days: 2.0,
  },
  {
    id: 'ward_6',
    ward_number: 48,
    ward_name: 'Charminar (Division 48 / Const. 67)',
    representative_name: 'Mir Zulfeqar Ali',
    designation: 'MLA / Ward Representative',
    party: 'AIMIM',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    office_address: 'Near Darulshifa Grounds, Charminar, Hyderabad - 500024',
    contact_phone: '+91 98490 67890',
    helpline_email: 'mla.charminar@telangana.gov.in',
    department_name: 'GHMC South Zone Heritage & Municipal Services',
    time_period: 'Q3 2026 (Last 30 Days Audit)',
    total_complaints: 55,
    resolved_complaints: 36,
    pending_complaints: 12,
    ignored_breached_complaints: 7,
    avg_sla_days: 2.4,
  },
  {
    id: 'ward_7',
    ward_number: 118,
    ward_name: 'Kukatpally (Division 118 / Const. 114)',
    representative_name: 'Madhavaram Krishna Rao',
    designation: 'MLA / Ward Representative',
    party: 'BRS',
    photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    office_address: 'KPHB Colony Phase 1, Main Road, Kukatpally, Hyderabad - 500072',
    contact_phone: '+91 98490 78901',
    helpline_email: 'mla.kukatpally@telangana.gov.in',
    department_name: 'GHMC Kukatpally Zone Storm Water Drain & Roads Wing',
    time_period: 'Q3 2026 (Last 30 Days Audit)',
    total_complaints: 68,
    resolved_complaints: 54,
    pending_complaints: 10,
    ignored_breached_complaints: 4,
    avg_sla_days: 1.6,
  },
];

// Initial Seed Issues for Hyderabad
export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'issue_hyd_101',
    reporter_id: 'user_cit_01',
    reporter_name: 'Ananya Reddy',
    category: 'Potholes & Roads',
    description: 'Dangerous 10-inch deep pothole near Road No. 36 Metro Station pillar in Jubilee Hills, causing frequent two-wheeler slipping during evening traffic hours.',
    lat: 17.4325,
    lng: 78.4070,
    address: 'Road No. 36, Near Jubilee Hills Check Post Metro Station, Jubilee Hills, Hyderabad - 500033',
    photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    status: 'escalated_tier2',
    department_id: 'dept_pwd',
    current_tier: 2,
    deadline_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago (overdue)
    tracking_code: 'CS-HYD-84920',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    ward_id: 'ward_1',
    sla_minutes: 2,
    physical_verification_status: 'physically_verified_true',
    verified_by_volunteer_name: 'HydSwachhata Volunteer Inspector',
    physical_verification_notes: 'On-ground physical inspection conducted. Pothole measured 10 inches deep near Metro Pillar 24. Immediate repair required.',
    physical_verified_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'issue_hyd_102',
    reporter_id: null, // Anonymous
    category: 'Garbage & Sanitation',
    description: 'Massive open garbage dump accumulating near Cyber Towers junction entrance in HITEC City. Overflowing waste spreading onto the main carriageway.',
    lat: 17.4504,
    lng: 78.3808,
    address: 'Cyber Towers Junction, Madhapur, HITEC City, Hyderabad - 500081',
    photo_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    status: 'open_for_ngo',
    department_id: 'dept_sanitation',
    current_tier: 3,
    deadline_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    tracking_code: 'CS-HYD-99124',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    ward_id: 'ward_4',
    sla_minutes: 2,
  },
  {
    id: 'issue_hyd_103',
    reporter_id: 'user_cit_02',
    reporter_name: 'Srinivas Rao',
    category: 'Water Supply',
    description: 'Major drinking water pipeline breach near Khairatabad Flyover junction on Raj Bhavan Road. Clean drinking water leaking onto the main road continuously.',
    lat: 17.4123,
    lng: 78.4600,
    address: 'Raj Bhavan Road, Khairatabad Flyover Junction, Somajiguda, Hyderabad - 500004',
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=80',
    status: 'claimed_resolved_by_official',
    department_id: 'dept_water',
    current_tier: 1,
    deadline_at: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
    tracking_code: 'CS-HYD-33411',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    ward_id: 'ward_2',
    sla_minutes: 2,
  },
  {
    id: 'issue_hyd_104',
    reporter_id: 'user_cit_03',
    reporter_name: 'Mohammed Asif',
    category: 'Street Lighting',
    description: 'Streetlights non-functional on main heritage corridor near Clock Tower on MG Road, Secunderabad. Unsafe dark stretch for pedestrians.',
    lat: 17.4401,
    lng: 78.4983,
    address: 'Clock Tower Corridor, MG Road, Secunderabad, Hyderabad - 500003',
    photo_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
    status: 'resolved',
    department_id: 'dept_lighting',
    current_tier: 1,
    deadline_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    tracking_code: 'CS-HYD-12009',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    ward_id: 'ward_5',
    sla_minutes: 2,
  },
  {
    id: 'issue_hyd_105',
    reporter_id: 'user_cit_04',
    reporter_name: 'Kavitha Varma',
    category: 'Drainage & Sewage',
    description: 'Overflowing sewage manhole near Charminar Unani Hospital on High Court Road. Dark wastewater leaking onto Laad Bazaar approach lane.',
    lat: 17.3616,
    lng: 78.4747,
    address: 'High Court Road, Near Unani Hospital, Charminar, Hyderabad - 500002',
    photo_url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    status: 'filed',
    department_id: 'dept_drainage',
    current_tier: 1,
    deadline_at: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
    tracking_code: 'CS-HYD-77218',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    ward_id: 'ward_6',
    sla_minutes: 2,
  },
];

export const INITIAL_EMAILS: ComplaintEmail[] = [
  {
    id: 'email_01',
    issue_id: 'issue_hyd_101',
    direction: 'outbound',
    to_email: 'roads.engineering@ghmc.gov.in',
    from_email: 'complaints@cir.gov.in',
    subject: '[CIR #CS-HYD-84920] Official Notice: Potholes & Roads Complaint on Road No. 36 Jubilee Hills',
    body: `Respected Officer (Tier 1 Road Engineering),

An official civic complaint #CS-HYD-84920 has been filed by a citizen of Hyderabad.

Issue Category: Potholes & Roads
Location: Road No. 36, Near Jubilee Hills Check Post Metro Station, Jubilee Hills, Hyderabad - 500033
Description: Dangerous 10-inch deep pothole near Road No. 36 Metro Station pillar in Jubilee Hills...

Response SLA Deadline: 2 Days.
Please inspect and upload proof of work. In case of delay, this complaint will automatically escalate to Chief Engineer (Tier 2).

Regards,
CIR Automated Public Accountability Engine`,
    sent_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'email_02',
    issue_id: 'issue_hyd_101',
    direction: 'outbound',
    to_email: 'chiefengineer.roads@ghmc.gov.in',
    from_email: 'escalation@cir.gov.in',
    subject: '[URGENT ESCALATION TIER 2] Overdue Complaint #CS-HYD-84920 - Jubilee Hills Pothole',
    body: `Respected Chief Engineer (Tier 2),

Complaint #CS-HYD-84920 has exceeded Tier 1 SLA without official resolution.

This email serves as an automated Tier 2 Escalation. Please intervene immediately.

CC: GHMC Municipal Commissioner Office`,
    sent_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'email_03',
    issue_id: 'issue_hyd_103',
    direction: 'inbound',
    to_email: 'complaints@cir.gov.in',
    from_email: 'water.board@hmwssb.in',
    subject: 'Re: [CIR #CS-HYD-33411] Status Update from HMWSSB Water Dept',
    body: `Dear CIR Team,

Our HMWSSB emergency maintenance crew visited Khairatabad Flyover junction at 11:30 AM today and patched the broken pipeline valve. Water leakage has been arrested completely.

Marking this issue as resolved from HMWSSB end.

Executive Engineer S. K. Reddy
HMWSSB Water Board`,
    sent_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

export const INITIAL_PROOFS: ResolutionProof[] = [
  {
    id: 'proof_104',
    issue_id: 'issue_hyd_104',
    submitted_by: 'HydSwachhata Volunteers',
    photo_url: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=600&auto=format&fit=crop&q=80',
    submitted_role: 'volunteer_verification',
    ai_match_notes: 'Gemini AI Match Score: 96% Confidence. Streetlight array in frame is verified illuminated with clear asphalt ground match.',
    verified: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];

export const INITIAL_HISTORIES: IssueStatusHistory[] = [
  // issue_hyd_101
  {
    id: 'hist_101_1',
    issue_id: 'issue_hyd_101',
    from_status: null,
    to_status: 'submitted',
    note: 'Complaint registered by citizen Ananya Reddy for Jubilee Hills Road No. 36 pothole.',
    changed_by: 'Ananya Reddy',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'hist_101_2',
    issue_id: 'issue_hyd_101',
    from_status: 'submitted',
    to_status: 'filed',
    note: 'AUTOMATED FILING: Categorized via Gemini AI. Dispatched official notice to Tier 1 Ward Officer (roads.engineering@ghmc.gov.in). SLA: 2 Hours.',
    changed_by: 'CIR AI Engine',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1000 * 60 * 2).toISOString(),
  },
  {
    id: 'hist_101_3',
    issue_id: 'issue_hyd_101',
    from_status: 'filed',
    to_status: 'escalated_tier2',
    note: 'AUTOMATED ESCALATION: Tier 1 response SLA breached without repair. Re-sent notice & escalated to Tier 2 Executive Engineer (chiefengineer.roads@ghmc.gov.in).',
    changed_by: 'CIR Escalation Engine',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'hist_101_4',
    issue_id: 'issue_hyd_101',
    from_status: 'escalated_tier2',
    to_status: 'escalated_tier2',
    note: 'VOLUNTEER PHYSICAL AUDIT: HydSwachhata Volunteer Inspector conducted on-ground site inspection. Confirmed 10-inch deep pothole near Metro Pillar 24.',
    changed_by: 'HydSwachhata Volunteer Inspector',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3 + 1000 * 60 * 15).toISOString(),
  },

  // issue_hyd_102
  {
    id: 'hist_102_1',
    issue_id: 'issue_hyd_102',
    from_status: null,
    to_status: 'submitted',
    note: 'Anonymous citizen complaint filed for Cyber Towers open garbage dump.',
    changed_by: 'Citizen',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'hist_102_2',
    issue_id: 'issue_hyd_102',
    from_status: 'submitted',
    to_status: 'filed',
    note: 'Dispatched official notice to GHMC Health & Solid Waste Dept (sanitation.health@ghmc.gov.in).',
    changed_by: 'CIR AI Engine',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'hist_102_3',
    issue_id: 'issue_hyd_102',
    from_status: 'filed',
    to_status: 'escalated_tier2',
    note: 'Tier 1 response SLA breached. Escalated to Tier 2 Deputy Commissioner (dycommissioner.swm@ghmc.gov.in).',
    changed_by: 'CIR Escalation Engine',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'hist_102_4',
    issue_id: 'issue_hyd_102',
    from_status: 'escalated_tier2',
    to_status: 'escalated_tier3',
    note: 'Tier 2 SLA breached. Escalated to Tier 3 Municipal Commissioner (commissioner@ghmc.gov.in).',
    changed_by: 'CIR Escalation Engine',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'hist_102_5',
    issue_id: 'issue_hyd_102',
    from_status: 'escalated_tier3',
    to_status: 'open_for_ngo',
    note: 'All municipal SLAs breached. Converted to Open Community Issue for NGO volunteer cleanup drive.',
    changed_by: 'CIR Escalation Engine',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },

  // issue_hyd_103
  {
    id: 'hist_103_1',
    issue_id: 'issue_hyd_103',
    from_status: null,
    to_status: 'submitted',
    note: 'Water pipeline leak reported at Khairatabad Flyover junction.',
    changed_by: 'Srinivas Rao',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'hist_103_2',
    issue_id: 'issue_hyd_103',
    from_status: 'submitted',
    to_status: 'filed',
    note: 'Dispatched official notice to HMWSSB Water Board (water.board@hmwssb.in).',
    changed_by: 'CIR AI Engine',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 2).toISOString(),
  },
  {
    id: 'hist_103_3',
    issue_id: 'issue_hyd_103',
    from_status: 'filed',
    to_status: 'claimed_resolved_by_official',
    note: 'Inbound email from Executive Engineer S. K. Reddy (water.board@hmwssb.in): Emergency maintenance patched valve. Official claimed resolved. On-ground physical verification pending.',
    changed_by: 'water.board@hmwssb.in',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },

  // issue_hyd_104
  {
    id: 'hist_104_1',
    issue_id: 'issue_hyd_104',
    from_status: null,
    to_status: 'submitted',
    note: 'Streetlight outage reported near Secunderabad Clock Tower.',
    changed_by: 'Mohammed Asif',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'hist_104_2',
    issue_id: 'issue_hyd_104',
    from_status: 'submitted',
    to_status: 'filed',
    note: 'Dispatched official notice to TSSPDCL & GHMC Electrical Division.',
    changed_by: 'CIR AI Engine',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48 + 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'hist_104_3',
    issue_id: 'issue_hyd_104',
    from_status: 'filed',
    to_status: 'claimed_resolved_by_official',
    note: 'GHMC Electrical Dept reported repair complete with replacement LED luminaires.',
    changed_by: 'GHMC Electrical Dept',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'hist_104_4',
    issue_id: 'issue_hyd_104',
    from_status: 'claimed_resolved_by_official',
    to_status: 'resolved',
    note: 'VOLUNTEER PHYSICAL VERIFICATION PASSED: On-ground site inspection by HydSwachhata Volunteers confirmed all streetlights illuminated. Case officially RESOLVED.',
    changed_by: 'HydSwachhata Volunteers',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },

  // issue_hyd_105
  {
    id: 'hist_105_1',
    issue_id: 'issue_hyd_105',
    from_status: null,
    to_status: 'submitted',
    note: 'Sewage overflow complaint registered near Charminar Unani Hospital.',
    changed_by: 'Kavitha Varma',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'hist_105_2',
    issue_id: 'issue_hyd_105',
    from_status: 'submitted',
    to_status: 'filed',
    note: 'Dispatched official notice to GHMC Urban Stormwater & Drainage Cell (drainage.sewage@ghmc.gov.in).',
    changed_by: 'CIR AI Engine',
    created_at: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
  },
];

export const INITIAL_NGOS: NGO[] = [
  {
    id: 'ngo_1',
    name: 'HydSwachhata Collective',
    acronym: 'HSC',
    description: 'A community-led environmental and civic action collective dedicated to waste management, pothole mapping, urban forestry, and lake restoration across Greater Hyderabad.',
    legal_structure: 'Society',
    darpan_id: 'TS/2021/0298412',
    registration_number: 'REG-HYD-5512/2021',
    tax_exemption_80g: true,
    fcra_registered: true,
    contact_email: 'contact@hydswachhata.org',
    contact_phone: '+91 40 2334 5566',
    office_address: 'Plot 45, Road No. 12, Banjara Hills, Hyderabad - 500034',
    chief_functionary_name: 'Dr. Ramesh N. Varma',
    chief_functionary_role: 'Founder & President',
    active_volunteers_count: 320,
    verified: true,
    areas_served: ['Jubilee Hills', 'Khairatabad', 'Serilingampally', 'Madhapur', 'Banjara Hills'],
    focus_domains: ['Road Safety & Potholes', 'Solid Waste Management', 'Lake Cleanup', 'Tree Plantation'],
    annual_audit_verified: true,
  },
  {
    id: 'ngo_2',
    name: 'Nirmaan Organization Hyderabad',
    acronym: 'NIRMAAN',
    description: 'Promoting participatory urban governance, citizen advocacy, ward representative dialogues, youth volunteer mobilization, and emergency flood response.',
    legal_structure: 'Section 8 Company',
    darpan_id: 'TS/2019/0187654',
    registration_number: 'CIN-U85300TG2019NPO1',
    tax_exemption_80g: true,
    fcra_registered: true,
    contact_email: 'info@nirmaan.org',
    contact_phone: '+91 98491 11223',
    office_address: 'Building 10B, Mindspace IT Park, HITEC City, Madhapur, Hyderabad - 500081',
    chief_functionary_name: 'Mayur Patnala',
    chief_functionary_role: 'Chief Executive Officer',
    active_volunteers_count: 580,
    verified: true,
    areas_served: ['Charminar', 'Goshamahal', 'Secunderabad', 'Sanathnagar', 'HITEC City'],
    focus_domains: ['Civic Accountability', 'Youth Leadership', 'Emergency Relief', 'Digital Governance'],
    annual_audit_verified: true,
  },
  {
    id: 'ngo_3',
    name: 'Swayam Krushi Civic Foundation',
    acronym: 'SKCF',
    description: 'Youth-driven student association organizing weekly weekend cleanups, pothole warning markers, traffic safety awareness, and tree plantation drives.',
    legal_structure: 'Trust',
    darpan_id: 'TS/2023/0341109',
    registration_number: 'TRUST-HYD-1190/2023',
    tax_exemption_80g: true,
    fcra_registered: false,
    contact_email: 'connect@swayamkrushi.org',
    contact_phone: '+91 99887 65432',
    office_address: 'KPHB Colony Phase 3, Kukatpally, Hyderabad - 500072',
    chief_functionary_name: 'Pooja Reddy',
    chief_functionary_role: 'Managing Trustee',
    active_volunteers_count: 140,
    verified: true,
    areas_served: ['Kukatpally', 'HITEC City', 'Gachibowli', 'Miyapur'],
    focus_domains: ['Weekend Cleanups', 'Pothole Safety Markers', 'Student Volunteers'],
    annual_audit_verified: true,
  },
];

export const INITIAL_EVENTS: NGOEvent[] = [
  {
    id: 'event_1',
    ngo_id: 'ngo_1',
    ngo_name: 'HydSwachhata Collective',
    title: 'HITEC City & Madhapur Green Cleanliness Drive',
    description: 'Join 25+ Hyderabad volunteers to clear uncleared garbage points around Cyber Towers junction and install community awareness bins.',
    lat: 17.4504,
    lng: 78.3808,
    event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    volunteers_needed: 20,
    created_at: new Date().toISOString(),
    organizer_name: 'Dr. Suresh Kumar (HydSwachhata Lead)',
    organizer_phone: '+91 98490 88211',
    organizer_email: 'suresh.kumar@hydswachhata.org',
    assembly_point: 'Gate No. 2, Cyber Towers Entrance Junction, Madhapur, HITEC City',
    gear_instructions: 'Gloves, trash grabbers, and high-visibility vests will be provided. Please wear closed-toe shoes and bring a reusable water bottle.',
  },
  {
    id: 'event_2',
    ngo_id: 'ngo_2',
    ngo_name: 'Nirmaan Organization Hyderabad',
    title: 'Jubilee Hills & Banjara Hills Pothole Safety Audit',
    description: 'Audit 5 major corridors in Jubilee Hills and Khairatabad. Paint high-visibility reflective warning circles around hazardous potholes for rider safety.',
    lat: 17.4325,
    lng: 78.4070,
    event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    volunteers_needed: 15,
    created_at: new Date().toISOString(),
    organizer_name: 'Pooja Reddy (Nirmaan Program Officer)',
    organizer_phone: '+91 98490 44102',
    organizer_email: 'pooja.reddy@nirmaan.org',
    assembly_point: 'Jubilee Hills Check Post Metro Station Bus Stop (Pillar No. 24)',
    gear_instructions: 'Reflective paint kits and measuring tapes provided. Please wear comfortable walking shoes and sun protection caps.',
  },
];

export const INITIAL_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'reg_1',
    event_id: 'event_1',
    user_id: 'user_cit_01',
    user_name: 'Ananya Reddy',
    user_email: 'ananya.reddy@example.com',
    phone: '+91 98490 11223',
    age: 24,
    occupation: 'Software Engineer @ Tech Mahindra',
    emergency_contact_name: 'Venkatesh Reddy (Father)',
    emergency_contact_phone: '+91 98490 99887',
    t_shirt_size: 'M',
    skills: ['First Aid Certified', 'Photography & Social Media', 'Logistics'],
    previous_experience: 'Volunteered in 3 Lake cleanup drives in Gachibowli in 2025.',
    health_notes: 'No allergies. Vegetarian.',
    attended: true,
    certificate_issued: true,
    certificate_id: 'CERT-HYD-2026-10492',
    registered_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'reg_2',
    event_id: 'event_1',
    user_id: 'user_cit_02',
    user_name: 'Srinivas Rao',
    user_email: 'srinivas.rao@example.com',
    phone: '+91 98490 55667',
    age: 29,
    occupation: 'Data Analyst',
    emergency_contact_name: 'Lakshmi Rao (Spouse)',
    emergency_contact_phone: '+91 98490 33221',
    t_shirt_size: 'L',
    skills: ['Crowd Management', 'Technical Audit'],
    previous_experience: 'Community volunteer for local ward cleanliness awareness.',
    health_notes: 'None.',
    attended: false,
    certificate_issued: false,
    registered_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge_scout',
    name: 'Civic Scout',
    description: 'Reported your first verified civic issue with live GPS on-site proof',
    icon: '🛡️',
    category: 'Reporting',
    level: 'bronze',
  },
  {
    id: 'badge_pothole_hunter',
    name: 'Pothole Hunter',
    description: 'Reported 3+ verified road craters or hazardous potholes in Hyderabad',
    icon: '🚧',
    category: 'Roads',
    level: 'silver',
  },
  {
    id: 'badge_clean_sentinel',
    name: 'Cleanliness Guardian',
    description: 'Reported 3+ garbage hotspots or sanitation hazards in GHMC wards',
    icon: '🗑️',
    category: 'Sanitation',
    level: 'silver',
  },
  {
    id: 'badge_water_watch',
    name: 'Water Sentinel',
    description: 'Reported 2+ pipe bursts, drainage overflows or water supply failures',
    icon: '💧',
    category: 'Water',
    level: 'silver',
  },
  {
    id: 'badge_ward_champion',
    name: 'Ward 101 Champion',
    description: 'Top active citizen contributor in Jubilee Hills / West Zone division',
    icon: '🥇',
    category: 'Community',
    level: 'gold',
  },
  {
    id: 'badge_impact_master',
    name: 'Resolution Champion',
    description: '5+ complaints reported by you were successfully repaired and resolved',
    icon: '🏆',
    category: 'Impact',
    level: 'gold',
  },
  {
    id: 'badge_master_inspector',
    name: 'Certified Physical Auditor',
    description: 'Conducted verified on-ground physical inspection with photo proof',
    icon: '💎',
    category: 'Audit',
    level: 'platinum',
  },
  {
    id: 'badge_streak_master',
    name: '7-Day Vigilance Streak',
    description: 'Maintained active civic reporting and vigilance for 7 consecutive days',
    icon: '🔥',
    category: 'Engagement',
    level: 'gold',
  },
];

export const INITIAL_LEADERBOARD: CitizenReporter[] = [
  {
    id: 'user_cit_01',
    name: 'Ananya Reddy',
    email: 'ananya.reddy@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    points: 1450,
    rank: 1,
    verified_reports_count: 18,
    resolved_reports_count: 15,
    ward_name: 'Division 101 - Jubilee Hills',
    streak_days: 12,
    badges: [
      INITIAL_BADGES[0],
      INITIAL_BADGES[1],
      INITIAL_BADGES[4],
      INITIAL_BADGES[5],
      INITIAL_BADGES[6],
    ],
    joined_date: 'Jan 2026',
  },
  {
    id: 'user_cit_02',
    name: 'Rajesh Kumar Varma',
    email: 'rajesh.varma@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    points: 1120,
    rank: 2,
    verified_reports_count: 14,
    resolved_reports_count: 11,
    ward_name: 'Division 100 - Khairatabad',
    streak_days: 8,
    badges: [
      INITIAL_BADGES[0],
      INITIAL_BADGES[2],
      INITIAL_BADGES[5],
    ],
    joined_date: 'Feb 2026',
  },
  {
    id: 'user_cit_03',
    name: 'Sneha Patel',
    email: 'sneha.patel@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    points: 980,
    rank: 3,
    verified_reports_count: 12,
    resolved_reports_count: 9,
    ward_name: 'Division 107 - Serilingampally / HITEC City',
    streak_days: 6,
    badges: [
      INITIAL_BADGES[0],
      INITIAL_BADGES[1],
      INITIAL_BADGES[3],
    ],
    joined_date: 'Feb 2026',
  },
  {
    id: 'user_cit_04',
    name: 'Vikram Rao',
    email: 'vikram.rao@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    points: 850,
    rank: 4,
    verified_reports_count: 10,
    resolved_reports_count: 8,
    ward_name: 'Division 102 - Sanathnagar',
    streak_days: 5,
    badges: [
      INITIAL_BADGES[0],
      INITIAL_BADGES[1],
      INITIAL_BADGES[2],
    ],
    joined_date: 'Mar 2026',
  },
  {
    id: 'user_cit_05',
    name: 'Kavitha Sundaram',
    email: 'kavitha.s@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    points: 720,
    rank: 5,
    verified_reports_count: 8,
    resolved_reports_count: 6,
    ward_name: 'Division 146 - Secunderabad',
    streak_days: 4,
    badges: [
      INITIAL_BADGES[0],
      INITIAL_BADGES[3],
    ],
    joined_date: 'Mar 2026',
  },
  {
    id: 'user_cit_06',
    name: 'Mohammed Farooq',
    email: 'm.farooq@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    points: 640,
    rank: 6,
    verified_reports_count: 7,
    resolved_reports_count: 5,
    ward_name: 'Division 48 - Charminar',
    streak_days: 3,
    badges: [
      INITIAL_BADGES[0],
      INITIAL_BADGES[2],
    ],
    joined_date: 'Mar 2026',
  },
  {
    id: 'user_cit_07',
    name: 'Aniket Reddy',
    email: 'aniket.reddy@hyderabad.gov.in',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    points: 420,
    rank: 7,
    verified_reports_count: 4,
    resolved_reports_count: 3,
    ward_name: 'Division 101 - Jubilee Hills',
    streak_days: 3,
    badges: [
      INITIAL_BADGES[0],
      INITIAL_BADGES[1],
    ],
    joined_date: 'Apr 2026',
  },
];

// In-Memory state store with LocalStorage Sync
class LocalDatabase {
  private issues: Issue[] = [];
  private history: IssueStatusHistory[] = [];
  private departments: Department[] = [];
  private emails: ComplaintEmail[] = [];
  private proofs: ResolutionProof[] = [];
  private ngos: NGO[] = [];
  private events: NGOEvent[] = [];
  private registrations: EventRegistration[] = [];
  private wards: WardRepresentative[] = [];
  private badges: Badge[] = [];
  private leaderboard: CitizenReporter[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const savedIssues = localStorage.getItem('cs_issues');
        const savedHistory = localStorage.getItem('cs_history');
        const savedEmails = localStorage.getItem('cs_emails');
        const savedProofs = localStorage.getItem('cs_proofs');
        const savedNgos = localStorage.getItem('cs_ngos');
        const savedEvents = localStorage.getItem('cs_events');
        const savedRegs = localStorage.getItem('cs_regs');
        const savedLeaderboard = localStorage.getItem('cs_leaderboard');

        if (savedIssues) {
          const parsedIssues = JSON.parse(savedIssues);
          // Auto-migrate if stored data is from old Pune city seed
          const isOldPuneData = Array.isArray(parsedIssues) && parsedIssues.some(
            (i: any) => i.tracking_code?.includes('PUN') || i.address?.includes('Pune')
          );

          if (isOldPuneData) {
            this.issues = [...INITIAL_ISSUES];
            this.history = [...INITIAL_HISTORIES];
            this.emails = [...INITIAL_EMAILS];
            this.proofs = [...INITIAL_PROOFS];
            this.ngos = [...INITIAL_NGOS];
            this.events = [...INITIAL_EVENTS];
            this.registrations = [...INITIAL_REGISTRATIONS];
            this.leaderboard = [...INITIAL_LEADERBOARD];
            this.saveToStorage();
          } else {
            this.issues = parsedIssues;
            this.history = savedHistory ? JSON.parse(savedHistory) : [...INITIAL_HISTORIES];
            this.emails = savedEmails ? JSON.parse(savedEmails) : [...INITIAL_EMAILS];
            this.proofs = savedProofs ? JSON.parse(savedProofs) : [...INITIAL_PROOFS];
            this.ngos = savedNgos ? JSON.parse(savedNgos) : [...INITIAL_NGOS];
            this.events = savedEvents ? JSON.parse(savedEvents) : [...INITIAL_EVENTS];
            this.registrations = savedRegs ? JSON.parse(savedRegs) : [...INITIAL_REGISTRATIONS];
            this.leaderboard = savedLeaderboard ? JSON.parse(savedLeaderboard) : [...INITIAL_LEADERBOARD];
          }
        } else {
          this.issues = [...INITIAL_ISSUES];
          this.history = [...INITIAL_HISTORIES];
          this.emails = [...INITIAL_EMAILS];
          this.proofs = [...INITIAL_PROOFS];
          this.ngos = [...INITIAL_NGOS];
          this.events = [...INITIAL_EVENTS];
          this.registrations = [...INITIAL_REGISTRATIONS];
          this.leaderboard = [...INITIAL_LEADERBOARD];
        }
      } else {
        this.issues = [...INITIAL_ISSUES];
        this.history = [...INITIAL_HISTORIES];
        this.emails = [...INITIAL_EMAILS];
        this.proofs = [...INITIAL_PROOFS];
        this.ngos = [...INITIAL_NGOS];
        this.events = [...INITIAL_EVENTS];
        this.registrations = [...INITIAL_REGISTRATIONS];
        this.leaderboard = [...INITIAL_LEADERBOARD];
      }
      this.departments = [...INITIAL_DEPARTMENTS];
      this.wards = [...INITIAL_WARDS];
      this.badges = [...INITIAL_BADGES];
    } catch {
      this.issues = [...INITIAL_ISSUES];
      this.history = [...INITIAL_HISTORIES];
      this.emails = [...INITIAL_EMAILS];
      this.proofs = [...INITIAL_PROOFS];
      this.ngos = [...INITIAL_NGOS];
      this.events = [...INITIAL_EVENTS];
      this.registrations = [...INITIAL_REGISTRATIONS];
      this.departments = [...INITIAL_DEPARTMENTS];
      this.wards = [...INITIAL_WARDS];
      this.badges = [...INITIAL_BADGES];
      this.leaderboard = [...INITIAL_LEADERBOARD];
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('cs_issues', JSON.stringify(this.issues));
        localStorage.setItem('cs_history', JSON.stringify(this.history));
        localStorage.setItem('cs_emails', JSON.stringify(this.emails));
        localStorage.setItem('cs_proofs', JSON.stringify(this.proofs));
        localStorage.setItem('cs_ngos', JSON.stringify(this.ngos));
        localStorage.setItem('cs_events', JSON.stringify(this.events));
        localStorage.setItem('cs_regs', JSON.stringify(this.registrations));
        localStorage.setItem('cs_leaderboard', JSON.stringify(this.leaderboard));
      }
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }

  // Gamification & Leaderboard Methods
  getBadges(): Badge[] {
    return [...this.badges];
  }

  getLeaderboard(): CitizenReporter[] {
    return [...this.leaderboard].sort((a, b) => b.points - a.points).map((reporter, idx) => ({
      ...reporter,
      rank: idx + 1,
    }));
  }

  awardCitizenPoints(
    reporterName: string,
    reporterEmail: string,
    pointsToAdd: number,
    category?: string
  ): { reporter: CitizenReporter; newBadges: Badge[] } {
    let reporter = this.leaderboard.find(
      r => (reporterEmail && r.email.toLowerCase() === reporterEmail.toLowerCase()) ||
           (reporterName && r.name.toLowerCase() === reporterName.toLowerCase())
    );

    const newlyUnlocked: Badge[] = [];

    if (!reporter) {
      reporter = {
        id: `cit_${Date.now()}`,
        name: reporterName || 'Citizen Reporter',
        email: reporterEmail || `citizen_${Date.now()}@hyderabad.gov.in`,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        points: 0,
        rank: this.leaderboard.length + 1,
        verified_reports_count: 0,
        resolved_reports_count: 0,
        ward_name: 'Division 101 - Jubilee Hills',
        streak_days: 1,
        badges: [],
        joined_date: 'Today',
      };
      this.leaderboard.push(reporter);
    }

    reporter.points += pointsToAdd;
    reporter.verified_reports_count += 1;

    // Check Badge Criteria:
    // 1. Civic Scout (First Report)
    if (!reporter.badges.some(b => b.id === 'badge_scout')) {
      const b = this.badges.find(bg => bg.id === 'badge_scout');
      if (b) {
        const unlocked = { ...b, unlocked_at: new Date().toISOString() };
        reporter.badges.push(unlocked);
        newlyUnlocked.push(unlocked);
      }
    }

    // 2. Pothole Hunter (3+ Pothole reports)
    if (category === 'Potholes & Roads') {
      const potholeCount = this.issues.filter(i => 
        (i.reporter_email === reporter?.email || i.reporter_name === reporter?.name) &&
        i.category === 'Potholes & Roads'
      ).length + 1;

      if (potholeCount >= 2 && !reporter.badges.some(b => b.id === 'badge_pothole_hunter')) {
        const b = this.badges.find(bg => bg.id === 'badge_pothole_hunter');
        if (b) {
          const unlocked = { ...b, unlocked_at: new Date().toISOString() };
          reporter.badges.push(unlocked);
          newlyUnlocked.push(unlocked);
        }
      }
    }

    // 3. Cleanliness Guardian (3+ Sanitation reports)
    if (category === 'Garbage & Sanitation') {
      const sanCount = this.issues.filter(i => 
        (i.reporter_email === reporter?.email || i.reporter_name === reporter?.name) &&
        i.category === 'Garbage & Sanitation'
      ).length + 1;

      if (sanCount >= 2 && !reporter.badges.some(b => b.id === 'badge_clean_sentinel')) {
        const b = this.badges.find(bg => bg.id === 'badge_clean_sentinel');
        if (b) {
          const unlocked = { ...b, unlocked_at: new Date().toISOString() };
          reporter.badges.push(unlocked);
          newlyUnlocked.push(unlocked);
        }
      }
    }

    // Re-sort ranks
    this.leaderboard.sort((a, b) => b.points - a.points);
    this.leaderboard.forEach((r, idx) => {
      r.rank = idx + 1;
    });

    this.saveToStorage();
    return { reporter, newBadges: newlyUnlocked };
  }

  // Issues CRUD
  getIssues(): Issue[] {
    return [...this.issues];
  }

  getIssueById(id: string): Issue | undefined {
    return this.issues.find(i => i.id === id);
  }

  getIssueByTrackingCode(code: string): Issue | undefined {
    return this.issues.find(i => i.tracking_code.toLowerCase() === code.trim().toLowerCase());
  }

  createIssue(issueData: Omit<Issue, 'id' | 'created_at' | 'tracking_code' | 'current_tier' | 'deadline_at' | 'status'> & { sla_minutes?: number }): Issue {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const tracking_code = `CS-HYD-${randomNum}`;
    const id = `issue_hyd_${Date.now()}`;
    const slaMins = issueData.sla_minutes || 2; // Default 2 mins for demo
    const deadline_at = new Date(Date.now() + slaMins * 60 * 1000).toISOString();

    // Calculate points awarded
    let points = issueData.points_awarded;
    if (points === undefined) {
      points = 50; // Base points for on-site GPS photo
      if (issueData.ai_photo_valid !== false) {
        points += 30; // Bonus for AI verified photo
      }
    }

    const newIssue: Issue = {
      ...issueData,
      id,
      tracking_code,
      status: 'submitted',
      current_tier: 1,
      deadline_at,
      created_at: new Date().toISOString(),
      sla_minutes: slaMins,
      points_awarded: points,
    };

    this.issues.unshift(newIssue);

    // Award points and check badges in citizen leaderboard
    if (issueData.reporter_name) {
      this.awardCitizenPoints(
        issueData.reporter_name,
        issueData.reporter_email || '',
        points,
        issueData.category
      );
    }

    this.addHistory(id, null, 'submitted', `Issue verified & reported with live GPS proof by citizen (${points} Civic Points earned)`, issueData.reporter_name || 'Citizen');
    this.saveToStorage();
    return newIssue;
  }

  updateIssueStatus(id: string, newStatus: IssueStatus, note: string, changedBy: string, tierOverride?: number, nextDeadlineISO?: string): Issue | null {
    const index = this.issues.findIndex(i => i.id === id);
    if (index === -1) return null;

    const oldStatus = this.issues[index].status;
    this.issues[index].status = newStatus;
    if (tierOverride) {
      this.issues[index].current_tier = tierOverride;
    }
    if (nextDeadlineISO) {
      this.issues[index].deadline_at = nextDeadlineISO;
    }

    this.addHistory(id, oldStatus, newStatus, note, changedBy);
    this.saveToStorage();
    return this.issues[index];
  }

  updateSubscription(id: string, notify_email?: boolean, reporter_email?: string, notify_whatsapp?: boolean, reporter_phone?: string): Issue | null {
    const issue = this.issues.find(i => i.id === id);
    if (!issue) return null;

    if (typeof notify_email === 'boolean') issue.notify_email = notify_email;
    if (reporter_email !== undefined) issue.reporter_email = reporter_email;
    if (typeof notify_whatsapp === 'boolean') issue.notify_whatsapp = notify_whatsapp;
    if (reporter_phone !== undefined) issue.reporter_phone = reporter_phone;

    this.saveToStorage();
    return issue;
  }

  addHistory(issue_id: string, from_status: IssueStatus | null, to_status: IssueStatus, note: string, changed_by: string) {
    const h: IssueStatusHistory = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      issue_id,
      from_status,
      to_status,
      note,
      changed_by,
      created_at: new Date().toISOString(),
    };
    this.history.unshift(h);
    this.saveToStorage();
  }

  getHistory(issue_id: string): IssueStatusHistory[] {
    return this.history
      .filter(h => h.issue_id === issue_id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Departments & Wards
  getDepartments(): Department[] {
    return this.departments;
  }

  getDepartmentById(id: string): Department | undefined {
    return this.departments.find(d => d.id === id);
  }

  getWards(): WardRepresentative[] {
    return this.wards;
  }

  // Emails
  getEmailsForIssue(issue_id: string): ComplaintEmail[] {
    return this.emails.filter(e => e.issue_id === issue_id);
  }

  addEmail(email: Omit<ComplaintEmail, 'id' | 'sent_at'>): ComplaintEmail {
    const newEmail: ComplaintEmail = {
      ...email,
      id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sent_at: new Date().toISOString(),
    };
    this.emails.unshift(newEmail);
    this.saveToStorage();
    return newEmail;
  }

  // Proofs
  getProofsForIssue(issue_id: string): ResolutionProof[] {
    return this.proofs.filter(p => p.issue_id === issue_id);
  }

  addProof(proof: Omit<ResolutionProof, 'id' | 'created_at'>): ResolutionProof {
    const newProof: ResolutionProof = {
      ...proof,
      id: `proof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    this.proofs.unshift(newProof);
    this.saveToStorage();
    return newProof;
  }

  verifyProof(proof_id: string, verified: boolean): boolean {
    const proof = this.proofs.find(p => p.id === proof_id);
    if (proof) {
      proof.verified = verified;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Volunteer On-Ground Physical Verification
  volunteerVerifyIssue(
    issue_id: string,
    is_true: boolean,
    notes: string,
    volunteer_name: string,
    photo_url?: string,
    action_type?: 'confirm_problem' | 'confirm_resolved' | 'mark_fake'
  ): Issue | null {
    const issue = this.issues.find(i => i.id === issue_id);
    if (!issue) return null;

    const isConfirmedResolved = action_type === 'confirm_resolved' || (is_true && issue.status === 'claimed_resolved_by_official');
    const isProblemConfirmed = action_type === 'confirm_problem' || (is_true && !isConfirmedResolved);
    const isFake = !is_true || action_type === 'mark_fake';

    const newStatus = isFake ? 'physically_verified_false' : 'physically_verified_true';
    issue.physical_verification_status = newStatus;
    issue.verified_by_volunteer_name = volunteer_name || 'Volunteer Inspector';
    issue.physical_verification_notes = notes;
    if (photo_url) {
      issue.physical_verification_photo = photo_url;
    }
    issue.physical_verified_at = new Date().toISOString();

    // Add resolution proof / audit record
    this.addProof({
      issue_id: issue.id,
      submitted_by: volunteer_name || 'Volunteer Inspector',
      photo_url: photo_url || issue.photo_url,
      submitted_role: 'volunteer_verification',
      ai_match_notes: `On-Ground Physical Verification Audit by ${volunteer_name || 'Volunteer'}: ${
        isConfirmedResolved
          ? 'CONFIRMED REPAIR RESOLUTION ON-SITE'
          : isProblemConfirmed
          ? 'CONFIRMED CIVIC PROBLEM GENUINE & ACTIVE ON-SITE'
          : 'CONFIRMED PHYSICALLY FALSE / FAKE CLAIM'
      }`,
      verified: !isFake,
      physical_inspection_result: isFake ? 'verified_false' : 'verified_true',
      inspector_notes: notes,
    });

    // Handle issue status transition based on physical verification
    if (isConfirmedResolved) {
      const oldStatus = issue.status;
      issue.status = 'resolved';
      this.addHistory(
        issue.id,
        oldStatus,
        'resolved',
        `VOLUNTEER PHYSICAL VERIFICATION PASSED: ${volunteer_name} physically inspected site and confirmed work is completed on-ground. Case officially RESOLVED and closed. Notes: "${notes}"`,
        volunteer_name
      );
    } else if (isProblemConfirmed) {
      this.addHistory(
        issue.id,
        issue.status,
        issue.status,
        `VOLUNTEER PHYSICAL AUDIT: ${volunteer_name} conducted on-ground site inspection. Confirmed problem is PHYSICALLY TRUE on site. Awaiting municipal repair execution. Notes: "${notes}"`,
        volunteer_name
      );
    } else {
      const oldStatus = issue.status;
      if (oldStatus === 'claimed_resolved_by_official') {
        issue.status = 'escalated_tier2';
        this.addHistory(
          issue.id,
          oldStatus,
          'escalated_tier2',
          `VOLUNTEER PHYSICAL AUDIT FAILED: ${volunteer_name} audited site and found official repair claim to be FALSE/INCOMPLETE. Re-opened & escalated to Tier 2 Executive Engineer. Notes: "${notes}"`,
          volunteer_name
        );
      } else {
        this.addHistory(
          issue.id,
          oldStatus,
          oldStatus,
          `VOLUNTEER AUDIT: ${volunteer_name} inspected site and flagged issue as physically FALSE or unverified on-ground. Notes: "${notes}"`,
          volunteer_name
        );
      }
    }

    this.saveToStorage();
    return issue;
  }

  // NGOs & Events
  getNgos(): NGO[] {
    return [...this.ngos];
  }

  createNgo(ngoData: Omit<NGO, 'id' | 'verified'>): NGO {
    const newNgo: NGO = {
      ...ngoData,
      id: `ngo_${Date.now()}`,
      verified: false,
    };
    this.ngos.push(newNgo);
    this.saveToStorage();
    return newNgo;
  }

  toggleNgoVerification(id: string, verified: boolean): NGO | null {
    const ngo = this.ngos.find(n => n.id === id);
    if (ngo) {
      ngo.verified = verified;
      this.saveToStorage();
      return ngo;
    }
    return null;
  }

  getEvents(): NGOEvent[] {
    return [...this.events];
  }

  createEvent(eventData: Omit<NGOEvent, 'id' | 'created_at'>): NGOEvent {
    const newEvent: NGOEvent = {
      ...eventData,
      id: `event_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.events.unshift(newEvent);
    this.saveToStorage();
    return newEvent;
  }

  getRegistrationsForEvent(event_id: string): EventRegistration[] {
    return this.registrations.filter(r => r.event_id === event_id);
  }

  registerForEvent(registration: Omit<EventRegistration, 'id' | 'attended' | 'certificate_issued'>): EventRegistration {
    const existing = this.registrations.find(r => r.event_id === registration.event_id && r.user_email === registration.user_email);
    if (existing) {
      // update details if re-submitting application
      Object.assign(existing, registration);
      this.saveToStorage();
      return existing;
    }

    const newReg: EventRegistration = {
      ...registration,
      id: `reg_${Date.now()}`,
      attended: false,
      certificate_issued: false,
      registered_at: new Date().toISOString(),
    };
    this.registrations.push(newReg);
    this.saveToStorage();
    return newReg;
  }

  updateRegistrationStatus(reg_id: string, attended: boolean, certificate_issued?: boolean): EventRegistration | null {
    const reg = this.registrations.find(r => r.id === reg_id);
    if (reg) {
      reg.attended = attended;
      if (certificate_issued !== undefined) {
        reg.certificate_issued = certificate_issued;
      }
      this.saveToStorage();
      return reg;
    }
    return null;
  }

  // Scheduled Escalation Engine Check (Overdue deadlines check)
  runEscalationCheck(): { escalatedCount: number; escalatedIssues: { id: string; code: string; newTier: number; newStatus: IssueStatus }[] } {
    const now = new Date();
    let count = 0;
    const escalatedList: { id: string; code: string; newTier: number; newStatus: IssueStatus }[] = [];

    this.issues.forEach(issue => {
      // Only escalate active open statuses that have passed deadline
      if (
        ['filed', 'escalated_tier2'].includes(issue.status) &&
        new Date(issue.deadline_at) < now
      ) {
        const dept = this.getDepartmentById(issue.department_id);
        const slaMins = issue.sla_minutes || 2;
        const nextDeadline = new Date(now.getTime() + slaMins * 60 * 1000).toISOString();

        if (issue.status === 'filed') {
          // Tier 1 -> Tier 2
          issue.status = 'escalated_tier2';
          issue.current_tier = 2;
          issue.deadline_at = nextDeadline;
          count++;

          this.addHistory(
            issue.id,
            'filed',
            'escalated_tier2',
            `AUTOMATED ESCALATION: Response deadline passed for Tier 1 officer. Re-sent & escalated to Tier 2 (${dept?.tier2_email || 'Chief Engineer'})`,
            'CIR Escalation Engine'
          );

          this.addEmail({
            issue_id: issue.id,
            direction: 'outbound',
            to_email: dept?.tier2_email || 'tier2@ghmc.gov.in',
            from_email: 'escalation@cir.gov.in',
            subject: `[OVERDUE ESCALATION TIER 2] Complaint #${issue.tracking_code} - ${issue.category}`,
            body: `ATTENTION: Senior Municipal Officer (Tier 2),\n\nComplaint #${issue.tracking_code} at location "${issue.address}" has breached Tier 1 SLA without action.\n\nDescription: ${issue.description}\n\nEscalated to Tier 2 for immediate action.\nNext Deadline: ${new Date(nextDeadline).toLocaleString()}`,
          });

          escalatedList.push({ id: issue.id, code: issue.tracking_code, newTier: 2, newStatus: 'escalated_tier2' });
        } else if (issue.status === 'escalated_tier2') {
          // Tier 2 -> Tier 3
          issue.status = 'escalated_tier3';
          issue.current_tier = 3;
          issue.deadline_at = nextDeadline;
          count++;

          this.addHistory(
            issue.id,
            'escalated_tier2',
            'escalated_tier3',
            `CRITICAL ESCALATION: Response deadline passed for Tier 2 officer. Escalated directly to Municipal Commissioner / Collector (${dept?.tier3_email || 'Commissioner Office'})`,
            'CIR Escalation Engine'
          );

          this.addEmail({
            issue_id: issue.id,
            direction: 'outbound',
            to_email: dept?.tier3_email || 'commissioner@ghmc.gov.in',
            from_email: 'collector-escalation@cir.gov.in',
            subject: `[CRITICAL ESCALATION TIER 3] Complaint #${issue.tracking_code} - ${issue.category}`,
            body: `URGENT NOTICE TO MUNICIPAL COMMISSIONER / COLLECTOR:\n\nComplaint #${issue.tracking_code} at "${issue.address}" has breached BOTH Tier 1 and Tier 2 response deadlines.\n\nCategory: ${issue.category}\nDescription: ${issue.description}\n\nThis issue has been highlighted in the Public Accountability Leaderboard.`,
          });

          escalatedList.push({ id: issue.id, code: issue.tracking_code, newTier: 3, newStatus: 'escalated_tier3' });
        }
      } else if (
        issue.status === 'escalated_tier3' &&
        new Date(issue.deadline_at) < now
      ) {
        // Tier 3 breach -> Open for NGO action!
        issue.status = 'open_for_ngo';
        count++;

        this.addHistory(
          issue.id,
          'escalated_tier3',
          'open_for_ngo',
          'PUBLIC NGO ESCALATION: Government SLA deadline completely lapsed after Tier 3. Complaint converted to Open Community Issue for NGO intervention.',
          'CIR Escalation Engine'
        );

        escalatedList.push({ id: issue.id, code: issue.tracking_code, newTier: 3, newStatus: 'open_for_ngo' });
      }
    });

    if (count > 0) {
      this.saveToStorage();
    }

    return { escalatedCount: count, escalatedIssues: escalatedList };
  }
}

export const db = new LocalDatabase();
