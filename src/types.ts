export type UserRole = 'citizen' | 'ngo_admin' | 'volunteer' | 'admin';

export type Language = 'en' | 'hi' | 'bn' | 'mr' | 'te' | 'ta';

export type IssueStatus =
  | 'submitted'
  | 'filed'
  | 'escalated_tier2'
  | 'escalated_tier3'
  | 'claimed_resolved_by_official'
  | 'open_for_ngo'
  | 'ngo_claimed'
  | 'resolved'
  | 'closed';

export type IssueCategory =
  | 'Potholes & Roads'
  | 'Garbage & Sanitation'
  | 'Water Supply'
  | 'Street Lighting'
  | 'Drainage & Sewage'
  | 'Parks & Public Spaces'
  | 'Encroachment & Traffic';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlocked_at?: string;
}

export interface CitizenReporter {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  points: number;
  rank: number;
  verified_reports_count: number;
  resolved_reports_count: number;
  ward_name: string;
  badges: Badge[];
  streak_days: number;
  joined_date?: string;
}

export interface Profile {
  id: string;
  name: string | null;
  email?: string;
  preferred_language: Language;
  role: UserRole;
  ngo_id?: string;
  points?: number;
  badges?: Badge[];
  rank?: number;
}

export interface Department {
  id: string;
  name: string;
  category: IssueCategory;
  city: string;
  tier1_email: string;
  tier2_email: string;
  tier3_email: string;
  response_sla_days: number;
}

export interface Issue {
  id: string;
  reporter_id: string | null;
  reporter_name?: string;
  category: IssueCategory;
  description: string;
  lat: number;
  lng: number;
  address: string;
  photo_url: string;
  status: IssueStatus;
  department_id: string;
  current_tier: number; // 1, 2, or 3
  deadline_at: string; // ISO date string
  tracking_code: string;
  created_at: string; // ISO date string
  ward_id?: string;
  sla_minutes?: number; // compressed SLA setting for demo purposes
  notify_email?: boolean;
  reporter_email?: string;
  notify_whatsapp?: boolean;
  reporter_phone?: string;
  ai_verified?: boolean;
  ai_confidence?: number;
  ai_verification_note?: string;
  ai_photo_valid?: boolean;
  ai_photo_validity_reason?: string;
  points_awarded?: number;
  physical_verification_status?: 'unverified' | 'physically_verified_true' | 'physically_verified_false';
  verified_by_volunteer_name?: string;
  physical_verification_notes?: string;
  physical_verification_photo?: string;
  physical_verified_at?: string;
}

export interface WhatsAppMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  media_url?: string;
  action_buttons?: { label: string; action: string; payload?: string }[];
}

export interface IssueStatusHistory {
  id: string;
  issue_id: string;
  from_status: IssueStatus | null;
  to_status: IssueStatus;
  note: string;
  changed_by: string;
  created_at: string;
}

export interface ComplaintEmail {
  id: string;
  issue_id: string;
  direction: 'outbound' | 'inbound';
  to_email: string;
  from_email: string;
  subject: string;
  body: string;
  sent_at: string;
}

export interface ResolutionProof {
  id: string;
  issue_id: string;
  submitted_by: string;
  photo_url: string;
  before_photo_url?: string;
  after_photo_url?: string;
  submitted_role: 'official_claim' | 'volunteer_verification' | 'citizen_verification';
  ai_match_notes: string;
  ai_notes?: string;
  ai_confidence_score?: number;
  verified_by_ai?: boolean;
  verified: boolean;
  physical_inspection_result?: 'verified_true' | 'verified_false';
  inspector_notes?: string;
  created_at: string;
}

export interface NGO {
  id: string;
  name: string;
  acronym?: string;
  description: string;
  legal_structure?: 'Society' | 'Trust' | 'Section 8 Company' | 'Volunteer Collective';
  darpan_id?: string;
  registration_number?: string;
  tax_exemption_80g?: boolean;
  fcra_registered?: boolean;
  contact_email: string;
  contact_phone?: string;
  office_address?: string;
  chief_functionary_name?: string;
  chief_functionary_role?: string;
  chief_functionary_id_no?: string;
  active_volunteers_count?: number;
  verified: boolean;
  areas_served: string[];
  focus_domains?: string[];
  annual_audit_verified?: boolean;
}

export interface NGOEvent {
  id: string;
  ngo_id: string;
  ngo_name?: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  event_date: string;
  volunteers_needed: number;
  created_at: string;
  organizer_name?: string;
  organizer_phone?: string;
  organizer_email?: string;
  assembly_point?: string;
  gear_instructions?: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  phone?: string;
  age?: number;
  occupation?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  t_shirt_size?: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  skills?: string[];
  previous_experience?: string;
  health_notes?: string;
  attended: boolean;
  certificate_issued: boolean;
  certificate_id?: string;
  registered_at?: string;
}

export interface WardRepresentative {
  id: string;
  ward_number: number;
  ward_name: string;
  representative_name: string;
  designation: string;
  party: string;
  photo_url: string;
  office_address?: string;
  contact_phone?: string;
  helpline_email?: string;
  department_name?: string;
  time_period?: string;
  total_complaints: number;
  resolved_complaints: number;
  pending_complaints?: number;
  ignored_breached_complaints?: number;
  avg_sla_days: number;
}
