import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './src/lib/db';
import { classifyIssue, draftComplaintEmail, compareResolutionPhotos, analyzeAndVerifyComplaintPhoto } from './src/lib/ai';
import { sendEmailViaResend } from './src/lib/resend';
import {
  isSupabaseConfigured,
  testSupabaseConnection,
  upsertIssueToSupabase,
  insertProofToSupabase,
  upsertNgoToSupabase,
  upsertEventToSupabase,
  insertRegistrationToSupabase,
  insertEmailToSupabase,
  fetchIssuesFromSupabase,
  getSupabaseCredentials,
} from './src/lib/supabase';

dotenv.config();

const PORT = 3000;

async function dispatchCitizenStatusNotification(issue: any, oldStatus: string | null, newStatus: string, note: string) {
  if (!issue) return;

  const prettyStatus = newStatus.toUpperCase().replace(/_/g, ' ');

  // 1. Dispatch Email Notification if citizen enabled notify_email
  if (issue.notify_email && issue.reporter_email) {
    const subject = `[CIR #${issue.tracking_code}] Status Update: ${prettyStatus}`;
    const body = `Respected Citizen,\n\nYour reported civic issue #${issue.tracking_code} ("${issue.description}") at ${issue.address} has updated status.\n\n• Previous Status: ${oldStatus ? oldStatus.toUpperCase().replace(/_/g, ' ') : 'N/A'}\n• New Status: ${prettyStatus}\n\nUpdate Note:\n"${note}"\n\nYou can track real-time resolution progress or chat with our GHMC WhatsApp Bot anytime on CIR Hyderabad Platform.\n\nRegards,\nCIR Hyderabad Public Accountability System`;

    try {
      await sendEmailViaResend(issue.reporter_email, subject, body);
      db.addEmail({
        issue_id: issue.id,
        direction: 'outbound',
        to_email: issue.reporter_email,
        from_email: 'alerts@cir.gov.in',
        subject,
        body,
      });
      console.log(`[SUBSCRIPTION NOTIFICATION] Sent automated status email to ${issue.reporter_email} for #${issue.tracking_code}`);
    } catch (err) {
      console.error('Error dispatching citizen email notification:', err);
    }
  }

  // 2. Log WhatsApp notification alert if enabled
  if (issue.notify_whatsapp && issue.reporter_phone) {
    console.log(`[WHATSAPP ALERT LOG] Sent to ${issue.reporter_phone}: "🟢 Issue #${issue.tracking_code} status update: ${prettyStatus}. Note: ${note}"`);
  }
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '20mb' }));

  // API Routes

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', city: 'Greater Hyderabad Municipal Corporation', app: 'CIR', supabase_configured: isSupabaseConfigured() });
  });

  // Supabase Database Connection Diagnostics & Status Route
  app.get('/api/supabase/status', async (req, res) => {
    try {
      const result = await testSupabaseConnection();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({
        configured: isSupabaseConfigured(),
        connected: false,
        message: err?.message || 'Error checking Supabase status',
      });
    }
  });

  // Manual / Automated Full Sync between Local Database & Supabase Cloud
  app.post('/api/supabase/sync', async (req, res) => {
    try {
      if (!isSupabaseConfigured()) {
        return res.status(400).json({
          success: false,
          message: 'Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_ANON_KEY to your environment variables or Settings.',
        });
      }

      const issues = db.getIssues();
      const ngos = db.getNgos();
      const events = db.getEvents();

      let syncedIssues = 0;
      let syncedNgos = 0;
      let syncedEvents = 0;

      for (const issue of issues) {
        const ok = await upsertIssueToSupabase(issue);
        if (ok) syncedIssues++;
      }

      for (const ngo of ngos) {
        const ok = await upsertNgoToSupabase(ngo);
        if (ok) syncedNgos++;
      }

      for (const event of events) {
        const ok = await upsertEventToSupabase(event);
        if (ok) syncedEvents++;
      }

      res.json({
        success: true,
        message: `Synced ${syncedIssues} issues, ${syncedNgos} NGOs, and ${syncedEvents} events to Supabase Cloud!`,
        syncedIssues,
        syncedNgos,
        syncedEvents,
      });
    } catch (err: any) {
      console.error('Supabase sync error:', err);
      res.status(500).json({ success: false, error: err.message || 'Sync failed' });
    }
  });

  // Real-time GPS Reverse Geocoding & GHMC Ward Assignment Route
  app.get('/api/geocode/reverse', async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: 'Valid lat and lng query parameters are required' });
      }

      // Ward lookup logic based on Hyderabad coordinates or default
      let matchedWard = 'ward_101';
      let matchedDivision = 'Division 101 - Jubilee Hills Division';

      if (lat > 17.44 && lng > 78.36 && lng < 78.40) {
        matchedWard = 'ward_107';
        matchedDivision = 'Division 107 - Serilingampally / HITEC City';
      } else if (lat < 17.38 && lng < 78.48) {
        matchedWard = 'ward_48';
        matchedDivision = 'Division 48 - Charminar Division';
      } else if (lat > 17.43 && lng > 78.48) {
        matchedWard = 'ward_146';
        matchedDivision = 'Division 146 - Secunderabad Division';
      } else if (lat > 17.41 && lat < 17.43 && lng > 78.44 && lng < 78.47) {
        matchedWard = 'ward_100';
        matchedDivision = 'Division 100 - Khairatabad Division';
      } else if (lat > 17.47) {
        matchedWard = 'ward_118';
        matchedDivision = 'Division 118 - Kukatpally Division';
      }

      // Try Nominatim with timeout and fallback
      let formattedAddress = `Near Coordinates (${lat.toFixed(5)}, ${lng.toFixed(5)}), ${matchedDivision}, Hyderabad, Telangana - 500033`;
      let street = '';
      let suburb = '';
      let postcode = '500033';

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        const fetchRes = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'CIRHyderabad-MunicipalPlatform/1.0 (cir.ghmc@telangana.gov.in)',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (fetchRes.ok) {
          const data = await fetchRes.json();
          if (data && data.address) {
            const addr = data.address;
            street = addr.road || addr.street || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
            suburb = addr.suburb || addr.neighbourhood || addr.city_district || addr.residential || '';
            const city = addr.city || addr.town || addr.municipality || 'Hyderabad';
            postcode = addr.postcode || '500033';
            const state = addr.state || 'Telangana';

            const parts = [street, suburb, city, state, postcode].filter(Boolean);
            if (parts.length > 0) {
              formattedAddress = parts.join(', ');
            }
          }
        }
      } catch (e) {
        // Fallback to coordinates with matched ward
      }

      res.json({
        lat,
        lng,
        address: formattedAddress,
        ward_id: matchedWard,
        ward_name: matchedDivision,
        postcode,
      });
    } catch (err) {
      console.error('Reverse geocode error:', err);
      res.status(500).json({ error: 'Failed to reverse geocode' });
    }
  });

  // AI Photo Verification & Description Generation Route
  app.post('/api/ai/verify-and-describe', async (req, res) => {
    try {
      const { photo_url, address, ward_id, category } = req.body;
      if (!photo_url) {
        return res.status(400).json({ error: 'Photo is required for AI analysis' });
      }

      const analysis = await analyzeAndVerifyComplaintPhoto(photo_url, address || 'Hyderabad City', ward_id, category);
      res.json(analysis);
    } catch (err) {
      console.error('Error in /api/ai/verify-and-describe:', err);
      res.status(500).json({ error: 'Failed to verify photo and generate description' });
    }
  });

  // Get all issues or filter by tracking code
  app.get('/api/issues', (req, res) => {
    const { code } = req.query;
    if (code && typeof code === 'string') {
      const issue = db.getIssueByTrackingCode(code);
      return res.json({ issues: issue ? [issue] : [] });
    }
    const issues = db.getIssues();
    res.json({ issues });
  });

  // Get single issue details with history & emails & proofs
  app.get('/api/issues/:id', (req, res) => {
    const issue = db.getIssueById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    const history = db.getHistory(issue.id);
    const emails = db.getEmailsForIssue(issue.id);
    const proofs = db.getProofsForIssue(issue.id);
    const department = db.getDepartmentById(issue.department_id);

    res.json({ issue, history, emails, proofs, department });
  });

  // Toggle or update email & whatsapp subscription preferences for a complaint
  app.post('/api/issues/:id/subscription', (req, res) => {
    const { notify_email, reporter_email, notify_whatsapp, reporter_phone } = req.body;
    const issue = db.getIssueById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const updated = db.updateSubscription(
      issue.id,
      notify_email,
      reporter_email,
      notify_whatsapp,
      reporter_phone
    );

    res.json({ issue: updated, success: true });
  });

  // Interactive GHMC CIR WhatsApp Bot Assistant endpoint
  app.post('/api/whatsapp/bot', async (req, res) => {
    try {
      const { message, tracking_code, phone } = req.body;
      const text = (message || '').trim();
      const uppercaseText = text.toUpperCase();

      // Case 1: Search by specific tracking code or "CS-HYD-" / "CS-PUN-" keyword in text
      const codeMatch = text.match(/CS-(HYD|PUN)-\d{5}/i) || (tracking_code ? [tracking_code] : null);
      if (codeMatch) {
        const foundCode = codeMatch[0].toUpperCase();
        const issue = db.getIssueByTrackingCode(foundCode);
        if (issue) {
          const statusLabel = issue.status.replace(/_/g, ' ').toUpperCase();
          const replyText = `📍 *CIR Complaint Status* #${issue.tracking_code}\n\n• *Category:* ${issue.category}\n• *Location:* ${issue.address}\n• *Current Status:* ${statusLabel}\n• *Assigned Level:* Tier ${issue.current_tier}\n• *Deadline SLA:* ${new Date(issue.deadline_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\n📧 *Email Updates:* ${issue.notify_email ? '✅ Active (' + (issue.reporter_email || 'Subscribed') + ')' : '❌ Inactive'}\n💬 *WhatsApp Alerts:* ${issue.notify_whatsapp ? '✅ Active (' + (issue.reporter_phone || 'Subscribed') + ')' : '❌ Inactive'}\n\nReply *SUBSCRIBE* to activate alerts or *MENU* for main options.`;

          return res.json({
            reply: replyText,
            issue,
            action_buttons: [
              { label: '🔔 Toggle Email Alert', action: 'toggle_email', payload: issue.id },
              { label: '💬 Toggle WhatsApp Alert', action: 'toggle_whatsapp', payload: issue.id },
              { label: '📋 View Full Details', action: 'view_details', payload: issue.id },
            ],
          });
        } else {
          return res.json({
            reply: `❌ Sorry, no complaint record was found for code *${foundCode}*. Please double check your tracking code or reply *MENU*.`,
          });
        }
      }

      // Case 2: Welcome / Menu / Help commands
      if (['HI', 'HELLO', 'MENU', 'HELP', 'START', 'NAMASTE'].includes(uppercaseText)) {
        return res.json({
          reply: `🏛️ *Welcome to GHMC CIR Official WhatsApp Assistant* (గ్రేటర్ హైదరాబాద్ మున్సిపల్ కార్పొరేషన్)\n\nI can help you track complaints, manage automated status alerts, and access municipal helplines!\n\n*Quick Commands:*\n1️⃣ Send tracking code e.g., *CS-HYD-84920* to check real-time status.\n2️⃣ Reply *SUBSCRIBE <CS-HYD-XXXXX> <email>* to activate instant status alerts.\n3️⃣ Reply *HELPLINE* for GHMC department contact numbers.\n\n⚠️ *Note:* To maintain public accountability and prevent unverified submissions, all new civic complaints require photographic evidence and must be filed via the CIR Hyderabad web portal.`,
          action_buttons: [
            { label: '🔍 Check CS-HYD-84920', action: 'send_text', payload: 'CS-HYD-84920' },
            { label: '🔔 How to Subscribe Alerts', action: 'send_text', payload: 'SUBSCRIBE' },
            { label: '📞 GHMC Helpline Directory', action: 'send_text', payload: 'HELPLINE' },
          ],
        });
      }

      // Case 3: Subscribe command
      if (uppercaseText.startsWith('SUBSCRIBE')) {
        const parts = text.split(/\s+/);
        const targetCode = parts.find((p) => p.toUpperCase().includes('CS-HYD-') || p.toUpperCase().includes('CS-PUN-'));
        const emailArg = parts.find((p) => p.includes('@'));

        if (targetCode) {
          const issue = db.getIssueByTrackingCode(targetCode);
          if (issue) {
            const updated = db.updateSubscription(
              issue.id,
              true,
              emailArg || issue.reporter_email || 'citizen@ghmc.gov.in',
              true,
              phone || issue.reporter_phone || '+91 98490 12345'
            );
            return res.json({
              reply: `✅ *Subscriptions Activated!* You will now receive instant email updates at *${updated?.reporter_email}* and WhatsApp alerts at *${updated?.reporter_phone}* whenever status changes for complaint *#${issue.tracking_code}*.`,
              issue: updated,
            });
          }
        }
        return res.json({
          reply: `To subscribe to status updates, reply with:\n*SUBSCRIBE CS-HYD-XXXXX your@email.com*`,
        });
      }

      // Case 4: Helpline command
      if (uppercaseText.includes('HELPLINE') || uppercaseText.includes('CONTACT')) {
        return res.json({
          reply: `🏛️ *GHMC & HMWSSB Municipal Contact Directory:*\n\n• *Road Engineering & Potholes:* 040-21111111 / 155304\n• *Health & Sanitation:* 040-21111111\n• *HMWSSB Water Board:* 155313\n• *GHMC Disaster Response (DRF):* 040-21111111 / 040-29555500\n\nOfficial Email: *commissioner@ghmc.gov.in*`,
        });
      }

      // Case 5: Direct Filing Attempt via WhatsApp - Removed for strict verification & proof requirement
      if (uppercaseText.startsWith('REPORT') || uppercaseText.includes('COMPLAINT') || uppercaseText.includes('ISSUE') || uppercaseText.includes('POTHOLE') || uppercaseText.includes('GARBAGE')) {
        return res.json({
          reply: `📸 *Photo & Location Proof Required:*\n\nTo ensure genuine municipal accountability and prevent false or unverified reports, all civic complaints must be submitted with mandatory **photo evidence** and **GPS geotagging** through the CIR Hyderabad Portal.\n\nPlease open the **"Report Civic Issue"** tab on the web platform to upload your site photo and dispatch verified notices to GHMC engineers.\n\nSend your tracking code (e.g. *CS-HYD-84920*) to check existing complaint progress!`,
          action_buttons: [
            { label: '🔍 Check Sample CS-HYD-84920', action: 'send_text', payload: 'CS-HYD-84920' },
            { label: '📞 GHMC Helplines', action: 'send_text', payload: 'HELPLINE' },
          ],
        });
      }

      // Default fallback
      return res.json({
        reply: `I received: "${text}". Reply *MENU* to view options or send your tracking code (e.g. *CS-HYD-84920*) to track complaint status.`,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'WhatsApp Bot error' });
    }
  });

  // Citizen Gamification Leaderboard & Badges endpoints
  app.get('/api/leaderboard', (req, res) => {
    res.json({
      leaderboard: db.getLeaderboard(),
      badges: db.getBadges(),
    });
  });

  app.get('/api/badges', (req, res) => {
    res.json({
      badges: db.getBadges(),
    });
  });

  // Report new issue (with Gemini AI photo validation, auto-classification & email filing & subscription preferences)
  app.post('/api/issues', async (req, res) => {
    try {
      const {
        description,
        address,
        lat,
        lng,
        photo_url,
        is_anonymous,
        reporter_name,
        reporter_email,
        reporter_phone,
        notify_email,
        notify_whatsapp,
        ward_id,
        sla_minutes,
        category: requestedCategory,
      } = req.body;

      if (!description || !address) {
        return res.status(400).json({ error: 'Description and address are required.' });
      }

      if (!photo_url) {
        return res.status(400).json({ error: 'Photo evidence is strictly mandatory for reporting civic issues.' });
      }

      // 1. STRICT AI Photo Verification & Validation:
      // Verify that the photo genuinely portrays public civic infrastructure damage (pothole, garbage, water leak, etc.)
      const photoVerification = await analyzeAndVerifyComplaintPhoto(
        photo_url,
        address,
        ward_id,
        requestedCategory
      );

      if (!photoVerification.isValidCivicPhoto || !photoVerification.verified) {
        return res.status(400).json({
          error: 'Civic Photo Verification Failed: The provided image does not depict a genuine municipal infrastructure problem or public defect.',
          reason: photoVerification.validityReason || 'Image does not contain recognizable outdoor civic defects (e.g. personal selfie, indoor space, domestic object, or non-civic item detected).',
          isValidCivicPhoto: false,
          code: 'NON_CIVIC_PHOTO_REJECTED',
          details: photoVerification,
        });
      }

      // 2. AI Classify Issue (using verified category and description)
      const classification = await classifyIssue(description, photo_url);
      const finalCategory = photoVerification.detectedCategory || classification.category || requestedCategory || 'Potholes & Roads';

      // 3. Create Issue Record with subscription options & gamification points
      const newIssue = db.createIssue({
        reporter_id: is_anonymous ? null : 'user_cit_current',
        reporter_name: is_anonymous ? undefined : (reporter_name || 'Citizen'),
        reporter_email: reporter_email || (is_anonymous ? undefined : 'citizen@ghmc.gov.in'),
        reporter_phone: reporter_phone || '+91 98490 12345',
        notify_email: typeof notify_email === 'boolean' ? notify_email : true,
        notify_whatsapp: typeof notify_whatsapp === 'boolean' ? notify_whatsapp : true,
        category: finalCategory,
        description,
        lat: lat || 17.4325,
        lng: lng || 78.4070,
        address,
        photo_url,
        department_id: classification.department_id,
        ward_id: ward_id || classification.suggestedWardId || 'ward_1',
        sla_minutes: sla_minutes || 2,
        ai_verified: true,
        ai_confidence: photoVerification.confidence || 95,
        ai_photo_valid: true,
        ai_photo_validity_reason: photoVerification.validityReason || 'Verified live on-site physical municipal evidence',
        points_awarded: 80,
      });

      // 4. Draft formal complaint email via Gemini
      const dept = db.getDepartmentById(newIssue.department_id);
      const emailDraft = await draftComplaintEmail(
        newIssue.tracking_code,
        newIssue.category,
        newIssue.description,
        newIssue.address,
        dept?.name || 'Greater Hyderabad Municipal Corporation',
        dept?.tier1_email || 'roads.engineering@ghmc.gov.in',
        dept?.response_sla_days || 2
      );

      // 5. Send email & Log
      await sendEmailViaResend(dept?.tier1_email || 'official@ghmc.gov.in', emailDraft.subject, emailDraft.body);

      db.addEmail({
        issue_id: newIssue.id,
        direction: 'outbound',
        to_email: dept?.tier1_email || 'official@ghmc.gov.in',
        from_email: 'complaints@cir.gov.in',
        subject: emailDraft.subject,
        body: emailDraft.body,
      });

      // 6. Update Status -> Filed
      const oldStatus = newIssue.status;
      const updatedIssue = db.updateIssueStatus(
        newIssue.id,
        'filed',
        `AUTOMATED FILING: Verified civic hazard ('${newIssue.category}') via Gemini AI. Official notice dispatched to Tier 1 Municipal Officer (${dept?.tier1_email}).`,
        'CIR AI Engine'
      );

      const finalIssue = updatedIssue || newIssue;
      await dispatchCitizenStatusNotification(
        finalIssue,
        oldStatus,
        'filed',
        `Categorized into ${finalIssue.category}. Official notice sent to ${dept?.tier1_email}.`
      );

      // Async sync to Supabase Cloud if configured
      if (isSupabaseConfigured()) {
        upsertIssueToSupabase(finalIssue).catch(e => console.error('[SUPABASE SYNC ERROR]', e));
      }

      res.status(201).json({ issue: finalIssue, classification, emailDraft });
    } catch (err: any) {
      console.error('Error creating issue:', err);
      res.status(500).json({ error: err.message || 'Failed to file issue.' });
    }
  });

  // Volunteer On-Ground Physical Verification API endpoint
  app.post('/api/issues/:id/volunteer-physical-verify', async (req, res) => {
    try {
      const { is_true, notes, volunteer_name, photo_url, action_type } = req.body;
      const issue = db.getIssueById(req.params.id);
      if (!issue) return res.status(404).json({ error: 'Issue not found' });

      const updated = db.volunteerVerifyIssue(
        req.params.id,
        is_true !== false,
        notes || '',
        volunteer_name || 'HydSwachhata Volunteer Inspector',
        photo_url,
        action_type
      );

      if (updated) {
        const actionLabel = action_type === 'confirm_resolved'
          ? 'CONFIRMED REPAIR RESOLUTION ON-SITE'
          : action_type === 'mark_fake' || !is_true
          ? 'FLAGGED FAKE / UNVERIFIED'
          : 'PHYSICALLY CONFIRMED PROBLEM ACTIVE';

        await dispatchCitizenStatusNotification(
          updated,
          issue.status,
          updated.status,
          `Volunteer On-Ground Physical Inspection: ${actionLabel}. Notes: ${notes || 'Site inspected by volunteer'}`
        );

        if (isSupabaseConfigured()) {
          upsertIssueToSupabase(updated).catch(e => console.error('[SUPABASE SYNC ERROR]', e));
        }
      }

      res.json({ success: true, issue: updated });
    } catch (err: any) {
      console.error('Error in volunteer physical verification:', err);
      res.status(500).json({ error: err.message || 'Failed to record volunteer physical verification.' });
    }
  });

  // Submit official claim or volunteer verification proof
  app.post('/api/issues/:id/proof', async (req, res) => {
    try {
      const { photo_url, after_photo_url, before_photo_url, submitted_by, submitted_role } = req.body;
      const issue = db.getIssueById(req.params.id);

      if (!issue) return res.status(404).json({ error: 'Issue not found' });

      const resolvedPhoto = after_photo_url || photo_url || issue.photo_url;
      const originalBeforePhoto = before_photo_url || issue.photo_url;

      // If official claim
      if (submitted_role === 'official_claim') {
        const oldStatus = issue.status;
        const updated = db.updateIssueStatus(
          issue.id,
          'claimed_resolved_by_official',
          'Official claimed work is complete. Physical verification pending from citizen or volunteer.',
          submitted_by || 'Municipal Engineer'
        );

        const proof = db.addProof({
          issue_id: issue.id,
          submitted_by: submitted_by || 'GHMC Official',
          photo_url: resolvedPhoto,
          before_photo_url: originalBeforePhoto,
          after_photo_url: resolvedPhoto,
          submitted_role: 'official_claim',
          ai_match_notes: 'Official submitted claim. Awaiting volunteer / citizen on-ground physical inspection.',
          verified: false,
        });

        if (isSupabaseConfigured()) {
          insertProofToSupabase(proof).catch(e => console.error('[SUPABASE PROOF SYNC ERROR]', e));
        }

        if (updated) {
          await dispatchCitizenStatusNotification(
            updated,
            oldStatus,
            'claimed_resolved_by_official',
            'Municipal Official claimed work is finished. Verification pending from volunteers/citizens.'
          );

          if (isSupabaseConfigured()) {
            upsertIssueToSupabase(updated).catch(e => console.error('[SUPABASE ISSUE SYNC ERROR]', e));
          }
        }

        return res.json({ success: true, proof, message: 'Status set to claimed_resolved_by_official ONLY. Verification pending.' });
      }

      // If citizen/volunteer uploading resolution proof -> Run Gemini Comparison
      const aiAnalysis = await compareResolutionPhotos(originalBeforePhoto, resolvedPhoto, issue.description);

      const proof = db.addProof({
        issue_id: issue.id,
        submitted_by: submitted_by || 'Volunteer Inspector',
        photo_url: resolvedPhoto,
        before_photo_url: originalBeforePhoto,
        after_photo_url: resolvedPhoto,
        submitted_role: submitted_role || 'volunteer_verification',
        ai_match_notes: aiAnalysis.matchNotes,
        ai_notes: aiAnalysis.matchNotes,
        ai_confidence_score: aiAnalysis.confidenceScore,
        verified_by_ai: aiAnalysis.resolvedMatch,
        verified: false, // Requires human approval rule!
      });

      if (isSupabaseConfigured()) {
        insertProofToSupabase(proof).catch(e => console.error('[SUPABASE PROOF SYNC ERROR]', e));
      }

      res.json({ proof, aiAnalysis, note: 'Proof uploaded and AI analyzed. Requires human admin/volunteer approval to set status to resolved.' });
    } catch (err: any) {
      console.error('Error in proof submission:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Human Admin / NGO Lead Approve Proof or Close Issue
  const handleApproveResolution = async (req: any, res: any) => {
    try {
      const { proof_id, approved_by } = req.body;
      const issue = db.getIssueById(req.params.id);

      if (!issue) return res.status(404).json({ error: 'Issue not found' });

      // If proof_id is provided, verify the proof
      if (proof_id) {
        db.verifyProof(proof_id, true);
      }

      const isPhysicallyVerified = issue.physical_verification_status === 'physically_verified_true';

      // Only close/resolve issue if it is physically verified TRUE
      if (isPhysicallyVerified) {
        const oldStatus = issue.status;
        const updated = db.updateIssueStatus(
          issue.id,
          'resolved',
          `HUMAN & PHYSICAL VERIFICATION COMPLETE: Confirmed by ${approved_by || 'NGO Admin / Inspector'} with verified on-ground physical inspection. Issue officially closed!`,
          approved_by || 'NGO Admin'
        );

        if (updated) {
          await dispatchCitizenStatusNotification(
            updated,
            oldStatus,
            'resolved',
            `Community, AI & physical on-ground verification complete. Complaint #${updated.tracking_code} is officially RESOLVED!`
          );

          if (isSupabaseConfigured()) {
            upsertIssueToSupabase(updated).catch(e => console.error('[SUPABASE ISSUE SYNC ERROR]', e));
          }
        }

        return res.json({ issue: updated, success: true, message: 'Resolution approved and issue officially resolved and closed!' });
      } else {
        // AI proof approved, but issue remains open until physical verification is done
        return res.json({
          issue: db.getIssueById(issue.id),
          success: true,
          proof_approved: true,
          requires_physical_verification: true,
          message: 'AI Resolution Proof approved! On-ground physical verification is required below to officially close this complaint.'
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to approve resolution.' });
    }
  };

  const handleCloseIssue = async (req: any, res: any) => {
    try {
      const { closed_by } = req.body;
      const issue = db.getIssueById(req.params.id);

      if (!issue) return res.status(404).json({ error: 'Issue not found' });

      if (issue.physical_verification_status !== 'physically_verified_true') {
        return res.status(400).json({
          error: 'PHYSICAL VERIFICATION REQUIRED: A complaint cannot be closed without an on-ground physical inspection confirming repair completion on-site.',
          requires_physical_verification: true
        });
      }

      const oldStatus = issue.status;
      const updated = db.updateIssueStatus(
        issue.id,
        'resolved',
        `CASE OFFICIALLY CLOSED: Verified on-ground by ${closed_by || 'Volunteer Inspector / Admin'}. Complaint resolved.`,
        closed_by || 'Inspector'
      );

      if (updated) {
        await dispatchCitizenStatusNotification(
          updated,
          oldStatus,
          'resolved',
          `On-ground physical verification confirmed. Complaint #${updated.tracking_code} is officially CLOSED!`
        );

        if (isSupabaseConfigured()) {
          upsertIssueToSupabase(updated).catch(e => console.error('[SUPABASE ISSUE SYNC ERROR]', e));
        }
      }

      res.json({ issue: updated, success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to close issue.' });
    }
  };

  app.post('/api/issues/:id/approve', handleApproveResolution);
  app.post('/api/issues/:id/approve-resolution', handleApproveResolution);
  app.post('/api/issues/:id/close', handleCloseIssue);

  // NGO Claim Issue
  app.post('/api/issues/:id/ngo-claim', async (req, res) => {
    const { ngo_name } = req.body;
    const issue = db.getIssueById(req.params.id);

    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const oldStatus = issue.status;
    const updated = db.updateIssueStatus(
      issue.id,
      'ngo_claimed',
      `COMMUNITY ACTION: Claimed by NGO "${ngo_name || 'Pune Swachhata Abhiyan'}" for local volunteer restoration.`,
      ngo_name || 'NGO'
    );

    if (updated) {
      await dispatchCitizenStatusNotification(
        updated,
        oldStatus,
        'ngo_claimed',
        `Registered NGO "${ngo_name || 'Community Team'}" has claimed this complaint for volunteer restoration.`
      );

      if (isSupabaseConfigured()) {
        upsertIssueToSupabase(updated).catch(e => console.error('[SUPABASE ISSUE SYNC ERROR]', e));
      }
    }

    res.json({ issue: updated, success: true });
  });

  // Scheduled / Manual Escalation Check
  app.post('/api/escalation/check', (req, res) => {
    const result = db.runEscalationCheck();
    res.json({ success: true, ...result });
  });

  // Inbound Email Webhook (Resend Parse Webhook simulation / official reply)
  app.post('/api/inbound-email', (req, res) => {
    const { from_email, subject, body, tracking_code } = req.body;

    const issue = tracking_code ? db.getIssueByTrackingCode(tracking_code) : undefined;

    if (issue) {
      db.addEmail({
        issue_id: issue.id,
        direction: 'inbound',
        to_email: 'complaints@cir.gov.in',
        from_email: from_email || 'official@ghmc.gov.in',
        subject: subject || `Re: [CIR #${issue.tracking_code}] Work Update`,
        body: body || 'Official status reply received from municipal department.',
      });

      const oldStatus = issue.status;
      const updated = db.updateIssueStatus(
        issue.id,
        'claimed_resolved_by_official',
        `INBOUND EMAIL RECEIVED from ${from_email}: Official claims work is finished. Verification pending.`,
        from_email || 'Municipal Official'
      );

      if (updated) {
        dispatchCitizenStatusNotification(
          updated,
          oldStatus,
          'claimed_resolved_by_official',
          `Inbound Official Email received from ${from_email}: Work marked completed by department. Verification pending.`
        );
      }

      return res.json({ success: true, issue_id: issue.id, status: 'claimed_resolved_by_official' });
    }

    res.json({ success: true, note: 'Email logged.' });
  });

  // NGO & Events Endpoints
  app.get('/api/ngos', (req, res) => {
    res.json({ ngos: db.getNgos() });
  });

  app.post('/api/ngos', (req, res) => {
    const ngo = db.createNgo(req.body);
    if (isSupabaseConfigured()) {
      upsertNgoToSupabase(ngo).catch(e => console.error('[SUPABASE NGO SYNC ERROR]', e));
    }
    res.status(201).json({ ngo });
  });

  app.post('/api/ngos/:id/verify', (req, res) => {
    const { verified } = req.body;
    const ngo = db.toggleNgoVerification(req.params.id, verified);
    if (ngo && isSupabaseConfigured()) {
      upsertNgoToSupabase(ngo).catch(e => console.error('[SUPABASE NGO SYNC ERROR]', e));
    }
    res.json({ ngo });
  });

  app.get('/api/events', (req, res) => {
    res.json({ events: db.getEvents() });
  });

  app.post('/api/events', (req, res) => {
    const event = db.createEvent(req.body);
    if (isSupabaseConfigured()) {
      upsertEventToSupabase(event).catch(e => console.error('[SUPABASE EVENT SYNC ERROR]', e));
    }
    res.status(201).json({ event });
  });

  app.get('/api/events/:id/registrations', (req, res) => {
    const regs = db.getRegistrationsForEvent(req.params.id);
    res.json({ registrations: regs });
  });

  app.post('/api/events/:id/register', (req, res) => {
    const {
      user_name,
      user_email,
      user_id,
      phone,
      age,
      occupation,
      emergency_contact_name,
      emergency_contact_phone,
      t_shirt_size,
      skills,
      previous_experience,
      health_notes,
    } = req.body;

    const reg = db.registerForEvent({
      event_id: req.params.id,
      user_id: user_id || 'user_cit_current',
      user_name: user_name || 'Civic Volunteer',
      user_email: user_email || 'volunteer@example.com',
      phone,
      age: age ? Number(age) : undefined,
      occupation,
      emergency_contact_name,
      emergency_contact_phone,
      t_shirt_size,
      skills: Array.isArray(skills) ? skills : [],
      previous_experience,
      health_notes,
    });

    if (isSupabaseConfigured()) {
      insertRegistrationToSupabase(reg).catch(e => console.error('[SUPABASE REG SYNC ERROR]', e));
    }

    res.json({ registration: reg });
  });

  // Get user registrations & earned certificates
  app.get('/api/users/registrations', (req, res) => {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email parameter required' });
    }

    const events = db.getEvents();
    const allRegs = events.flatMap(e => {
      const regs = db.getRegistrationsForEvent(e.id);
      return regs
        .filter(r => r.user_email.toLowerCase() === email.trim().toLowerCase())
        .map(r => ({ ...r, eventTitle: e.title, ngoName: e.ngo_name, eventDate: e.event_date }));
    });

    res.json({ registrations: allRegs });
  });

  app.post('/api/events/attendance', (req, res) => {
    const { reg_id, attended, certificate_issued } = req.body;
    const updated = db.updateRegistrationStatus(reg_id, attended, certificate_issued);
    res.json({ registration: updated });
  });

  app.get('/api/wards', (req, res) => {
    res.json({ wards: db.getWards() });
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CIR Hyderabad full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
