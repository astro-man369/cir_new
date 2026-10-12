import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Issue, NGO, NGOEvent, EventRegistration, ResolutionProof, ComplaintEmail } from '../types';

// Retrieve credentials from either Node process.env (server) or Vite import.meta.env (client)
export const getSupabaseCredentials = () => {
  let url = '';
  let key = '';

  // Server-side environment
  if (typeof process !== 'undefined' && process.env) {
    url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  }

  // Client-side Vite environment
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : null;
  if (!url && metaEnv) {
    url = (metaEnv.VITE_SUPABASE_URL as string) || (metaEnv.SUPABASE_URL as string) || '';
    key = (metaEnv.VITE_SUPABASE_ANON_KEY as string) || (metaEnv.SUPABASE_ANON_KEY as string) || '';
  }

  return {
    url: url.trim(),
    key: key.trim(),
    isConfigured: Boolean(url.trim() && key.trim() && !url.includes('placeholder')),
  };
};

let cachedClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: typeof window !== 'undefined',
          autoRefreshToken: true,
        },
      });
      console.log(`[SUPABASE] Initialized Supabase client connecting to: ${url}`);
    } catch (err) {
      console.error('[SUPABASE] Failed to create Supabase client:', err);
      return null;
    }
  }

  return cachedClient;
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseCredentials().isConfigured;
};

/**
 * Test connectivity to Supabase and verify required tables
 */
export const testSupabaseConnection = async (): Promise<{
  configured: boolean;
  connected: boolean;
  message: string;
  url?: string;
  tablesFound?: string[];
  latencyMs?: number;
}> => {
  const { url, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return {
      configured: false,
      connected: false,
      message: 'Supabase credentials not configured in environment variables (SUPABASE_URL and SUPABASE_ANON_KEY).',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      configured: true,
      connected: false,
      message: 'Failed to instantiate Supabase client.',
      url,
    };
  }

  const startTime = Date.now();
  try {
    // Attempt querying the issues table
    const { data, error } = await client.from('issues').select('id').limit(1);
    const latency = Date.now() - startTime;

    if (error) {
      // If table doesn't exist yet, it's still reachable
      if (error.code === '42P01') {
        return {
          configured: true,
          connected: true,
          message: 'Connected to Supabase project! Schema tables need to be created using the provided SQL migration.',
          url,
          tablesFound: [],
          latencyMs: latency,
        };
      }
      return {
        configured: true,
        connected: false,
        message: `Supabase query error: ${error.message} (Code: ${error.code})`,
        url,
        latencyMs: latency,
      };
    }

    return {
      configured: true,
      connected: true,
      message: `Successfully connected to Supabase Cloud Database! (Response time: ${latency}ms)`,
      url,
      tablesFound: ['issues'],
      latencyMs: latency,
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      message: `Connection exception: ${err?.message || 'Unknown network error'}`,
      url,
    };
  }
};

/**
 * Upsert Issue to Supabase
 */
export const upsertIssueToSupabase = async (issue: Issue): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const payload = {
      id: issue.id,
      tracking_code: issue.tracking_code,
      reporter_id: issue.reporter_id || null,
      reporter_name: issue.reporter_name || null,
      reporter_email: issue.reporter_email || null,
      reporter_phone: issue.reporter_phone || null,
      category: issue.category,
      description: issue.description,
      lat: issue.lat,
      lng: issue.lng,
      address: issue.address,
      photo_url: issue.photo_url,
      status: issue.status,
      department_id: issue.department_id,
      current_tier: issue.current_tier,
      deadline_at: issue.deadline_at,
      ward_id: issue.ward_id || null,
      sla_minutes: issue.sla_minutes || 2,
      notify_email: issue.notify_email ?? true,
      notify_whatsapp: issue.notify_whatsapp ?? true,
      ai_verified: issue.ai_verified ?? true,
      ai_confidence: issue.ai_confidence || 95,
      ai_verification_note: issue.ai_verification_note || null,
      ai_photo_valid: issue.ai_photo_valid ?? true,
      ai_photo_validity_reason: issue.ai_photo_validity_reason || null,
      points_awarded: issue.points_awarded || 80,
      physical_verification_status: issue.physical_verification_status || 'unverified',
      verified_by_volunteer_name: issue.verified_by_volunteer_name || null,
      physical_verification_notes: issue.physical_verification_notes || null,
      physical_verification_photo: issue.physical_verification_photo || null,
      physical_verified_at: issue.physical_verified_at || null,
      created_at: issue.created_at,
    };

    const { error } = await client.from('issues').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('[SUPABASE] Failed to upsert issue to Supabase:', error.message);
      return false;
    }
    console.log(`[SUPABASE] Issue #${issue.tracking_code} synced to Supabase.`);
    return true;
  } catch (err) {
    console.error('[SUPABASE] Exception upserting issue:', err);
    return false;
  }
};

/**
 * Fetch all Issues from Supabase
 */
export const fetchIssuesFromSupabase = async (): Promise<Issue[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[SUPABASE] Error fetching issues:', error.message);
      return null;
    }
    return (data as Issue[]) || [];
  } catch (err) {
    console.error('[SUPABASE] Error querying issues:', err);
    return null;
  }
};

/**
 * Add Proof to Supabase
 */
export const insertProofToSupabase = async (proof: ResolutionProof): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('resolution_proofs').upsert({
      id: proof.id,
      issue_id: proof.issue_id,
      submitted_by: proof.submitted_by,
      photo_url: proof.photo_url,
      before_photo_url: proof.before_photo_url || null,
      after_photo_url: proof.after_photo_url || null,
      submitted_role: proof.submitted_role,
      ai_match_notes: proof.ai_match_notes,
      ai_notes: proof.ai_notes || null,
      ai_confidence_score: proof.ai_confidence_score || null,
      verified_by_ai: proof.verified_by_ai ?? false,
      verified: proof.verified,
      created_at: proof.created_at,
    }, { onConflict: 'id' });

    if (error) {
      console.warn('[SUPABASE] Error inserting resolution proof:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[SUPABASE] Exception inserting proof:', err);
    return false;
  }
};

/**
 * Upsert NGO to Supabase
 */
export const upsertNgoToSupabase = async (ngo: NGO): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('ngos').upsert({
      id: ngo.id,
      name: ngo.name,
      acronym: ngo.acronym || null,
      description: ngo.description,
      legal_structure: ngo.legal_structure || null,
      darpan_id: ngo.darpan_id || null,
      registration_number: ngo.registration_number || null,
      tax_exemption_80g: ngo.tax_exemption_80g ?? false,
      fcra_registered: ngo.fcra_registered ?? false,
      contact_email: ngo.contact_email,
      contact_phone: ngo.contact_phone || null,
      office_address: ngo.office_address || null,
      chief_functionary_name: ngo.chief_functionary_name || null,
      chief_functionary_role: ngo.chief_functionary_role || null,
      chief_functionary_id_no: ngo.chief_functionary_id_no || null,
      active_volunteers_count: ngo.active_volunteers_count || 0,
      verified: ngo.verified,
      areas_served: ngo.areas_served,
      focus_domains: ngo.focus_domains || [],
      annual_audit_verified: ngo.annual_audit_verified ?? false,
    }, { onConflict: 'id' });

    if (error) {
      console.warn('[SUPABASE] Error upserting NGO:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[SUPABASE] Exception upserting NGO:', err);
    return false;
  }
};

/**
 * Upsert Event to Supabase
 */
export const upsertEventToSupabase = async (event: NGOEvent): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('ngo_events').upsert({
      id: event.id,
      ngo_id: event.ngo_id,
      ngo_name: event.ngo_name || null,
      title: event.title,
      description: event.description,
      lat: event.lat,
      lng: event.lng,
      event_date: event.event_date,
      volunteers_needed: event.volunteers_needed,
      organizer_name: event.organizer_name || null,
      organizer_phone: event.organizer_phone || null,
      organizer_email: event.organizer_email || null,
      assembly_point: event.assembly_point || null,
      gear_instructions: event.gear_instructions || null,
      created_at: event.created_at,
    }, { onConflict: 'id' });

    if (error) {
      console.warn('[SUPABASE] Error upserting NGO event:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[SUPABASE] Exception upserting event:', err);
    return false;
  }
};

/**
 * Insert Event Registration to Supabase
 */
export const insertRegistrationToSupabase = async (reg: EventRegistration): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('event_registrations').upsert({
      id: reg.id,
      event_id: reg.event_id,
      user_id: reg.user_id,
      user_name: reg.user_name,
      user_email: reg.user_email,
      phone: reg.phone || null,
      age: reg.age || null,
      occupation: reg.occupation || null,
      emergency_contact_name: reg.emergency_contact_name || null,
      emergency_contact_phone: reg.emergency_contact_phone || null,
      t_shirt_size: reg.t_shirt_size || null,
      skills: reg.skills || [],
      previous_experience: reg.previous_experience || null,
      health_notes: reg.health_notes || null,
      attended: reg.attended,
      certificate_issued: reg.certificate_issued,
      certificate_id: reg.certificate_id || null,
      registered_at: reg.registered_at || new Date().toISOString(),
    }, { onConflict: 'id' });

    if (error) {
      console.warn('[SUPABASE] Error inserting event registration:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[SUPABASE] Exception inserting registration:', err);
    return false;
  }
};

/**
 * Insert Complaint Email to Supabase
 */
export const insertEmailToSupabase = async (email: ComplaintEmail): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('complaint_emails').upsert({
      id: email.id,
      issue_id: email.issue_id,
      direction: email.direction,
      to_email: email.to_email,
      from_email: email.from_email,
      subject: email.subject,
      body: email.body,
      sent_at: email.sent_at,
    }, { onConflict: 'id' });

    if (error) {
      console.warn('[SUPABASE] Error inserting complaint email:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[SUPABASE] Exception inserting email:', err);
    return false;
  }
};
