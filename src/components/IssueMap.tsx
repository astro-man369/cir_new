import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Issue, NGO, NGOEvent, IssueStatus } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { Filter, Layers, MapPin, Sparkles, HeartHandshake, AlertTriangle, ShieldCheck, Clock, CheckCircle2, Building2 } from 'lucide-react';

interface IssueMapProps {
  issues: Issue[];
  ngos: NGO[];
  events: NGOEvent[];
  onSelectIssue: (issue: Issue) => void;
}

// Crisp Vector SVG Strings for Categories (Lucide precision paths)
const getCategorySvg = (category: string, size = 15): string => {
  switch (category) {
    case 'Potholes & Roads':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    case 'Garbage & Sanitation':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
    case 'Water Supply':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
    case 'Street Lighting':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`;
    case 'Drainage & Sewage':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`;
    case 'Encroachment':
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
  }
};

export const IssueMap: React.FC<IssueMapProps> = ({ issues, ngos, events, onSelectIssue }) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [showNgosNearMe, setShowNgosNearMe] = useState(false);
  const [showEventsNearMe, setShowEventsNearMe] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Center on Hyderabad Municipal Corporation bounds
      const map = L.map(mapContainerRef.current, {
        center: [17.3950, 78.4767],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | CIR GHMC Hyderabad GIS',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      mapRef.current = map;
      markersLayerRef.current = markersGroup;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers when filter or issues change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const group = markersLayerRef.current;
    group.clearLayers();

    // 1. Add Filtered Issues Markers with Premium Teardrop GIS Pins
    const filteredIssues = issues.filter((issue) => {
      if (selectedCategory !== 'All' && issue.category !== selectedCategory) return false;
      if (selectedStatus !== 'All') {
        if (selectedStatus === 'Open' && !['submitted', 'filed', 'escalated_tier2', 'escalated_tier3'].includes(issue.status)) return false;
        if (selectedStatus === 'Pending Proof' && issue.status !== 'claimed_resolved_by_official') return false;
        if (selectedStatus === 'Resolved' && issue.status !== 'resolved') return false;
        if (selectedStatus === 'Open for NGO' && issue.status !== 'open_for_ngo') return false;
      }
      return true;
    });

    filteredIssues.forEach((issue, idx) => {
      if (!issue) return;

      // Determine Theme Colors, Gradients & Badges
      let gradTop = '#ea580c';
      let gradBottom = '#c2410c';
      let iconColor = '#fed7aa';
      let statusBadgeHtml = '';
      let pulseRing = '';

      if (issue.status === 'escalated_tier3') {
        gradTop = '#ef4444';
        gradBottom = '#991b1b';
        iconColor = '#fecaca';
        statusBadgeHtml = `<div style="position: absolute; top: -3px; right: -3px; background: #dc2626; color: white; font-size: 8.5px; font-weight: 800; padding: 1px 4px; border-radius: 6px; border: 1.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5); font-family: monospace;">T3</div>`;
        pulseRing = `<div style="position: absolute; top: 2px; left: 2px; width: 34px; height: 34px; border-radius: 50%; border: 2px solid #ef4444; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.6; pointer-events: none;"></div>`;
      } else if (issue.status === 'escalated_tier2') {
        gradTop = '#f97316';
        gradBottom = '#c2410c';
        iconColor = '#fed7aa';
        statusBadgeHtml = `<div style="position: absolute; top: -3px; right: -3px; background: #ea580c; color: white; font-size: 8.5px; font-weight: 800; padding: 1px 4px; border-radius: 6px; border: 1.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5); font-family: monospace;">T2</div>`;
      } else if (issue.status === 'claimed_resolved_by_official' || issue.status === 'ngo_claimed') {
        gradTop = '#f59e0b';
        gradBottom = '#b45309';
        iconColor = '#fef3c7';
        statusBadgeHtml = `<div style="position: absolute; top: -3px; right: -3px; background: #d97706; color: white; font-size: 8px; font-weight: 800; padding: 1px 3.5px; border-radius: 6px; border: 1.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">⏳</div>`;
      } else if (issue.status === 'resolved') {
        gradTop = '#10b981';
        gradBottom = '#047857';
        iconColor = '#a7f3d0';
        statusBadgeHtml = `<div style="position: absolute; top: -3px; right: -3px; background: #059669; color: white; font-size: 8px; font-weight: 800; padding: 1px 3.5px; border-radius: 6px; border: 1.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">✓</div>`;
      } else if (issue.status === 'open_for_ngo') {
        gradTop = '#a855f7';
        gradBottom = '#6b21a8';
        iconColor = '#e9d5ff';
        statusBadgeHtml = `<div style="position: absolute; top: -3px; right: -3px; background: #9333ea; color: white; font-size: 8.5px; font-weight: 800; padding: 1px 4px; border-radius: 6px; border: 1.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5); font-family: monospace;">NGO</div>`;
      } else {
        // Standard Tier 1 Open Issue
        statusBadgeHtml = `<div style="position: absolute; top: -3px; right: -3px; background: #ea580c; color: white; font-size: 8.5px; font-weight: 800; padding: 1px 4px; border-radius: 6px; border: 1.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5); font-family: monospace;">T1</div>`;
      }

      const iconSvg = getCategorySvg(issue.category, 15);
      const gradientId = `grad-issue-${issue.id.replace(/[^a-zA-Z0-9]/g, '')}-${idx}`;

      // Custom Precision Teardrop GIS Pin
      const icon = L.divIcon({
        className: 'custom-issue-pin',
        html: `
          <div class="cir-pin-wrapper" style="position: relative; width: 38px; height: 46px; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.45));">
            ${pulseRing}
            <svg width="38" height="46" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="${gradientId}" x1="19" y1="0" x2="19" y2="46" gradientUnits="userSpaceOnUse">
                  <stop stop-color="${gradTop}" />
                  <stop offset="1" stop-color="${gradBottom}" />
                </linearGradient>
              </defs>
              <!-- Outer Teardrop Pin Path with Smooth White Rim -->
              <path d="M19 46C19 46 35 27 35 17.5C35 8.3873 27.8366 1 19 1C10.1634 1 3 8.3873 3 17.5C3 27 19 46 19 46Z" fill="url(#${gradientId})" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
              <!-- High-Contrast Recessed Inner Circle Well -->
              <circle cx="19" cy="17.5" r="11.5" fill="#090d16" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
            </svg>
            <!-- Centered Crisp Vector Icon -->
            <div style="position: absolute; top: 10px; left: 11.5px; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; color: ${iconColor}; pointer-events: none;">
              ${iconSvg}
            </div>
            ${statusBadgeHtml}
          </div>
        `,
        iconSize: [38, 46],
        iconAnchor: [19, 45],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([issue.lat, issue.lng], { icon });

      // Status pill badge text
      let statusLabel = 'Tier 1 Ward Action';
      let statusPillClass = 'bg-orange-950/80 text-orange-300 border-orange-700/60';
      if (issue.status === 'escalated_tier2') {
        statusLabel = 'Tier 2 Escalated (EE)';
        statusPillClass = 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      } else if (issue.status === 'escalated_tier3') {
        statusLabel = 'Tier 3 Collector Escalation';
        statusPillClass = 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      } else if (issue.status === 'claimed_resolved_by_official') {
        statusLabel = 'Claimed • Verification Due';
        statusPillClass = 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      } else if (issue.status === 'resolved') {
        statusLabel = 'Verified Resolved';
        statusPillClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      } else if (issue.status === 'open_for_ngo') {
        statusLabel = 'Open for NGO Action';
        statusPillClass = 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      }

      // High-Fidelity Modal Popup card
      const popupContent = document.createElement('div');
      popupContent.className = 'w-72 bg-slate-900 text-slate-100 font-sans overflow-hidden';
      popupContent.innerHTML = `
        <div style="position: relative; width: 100%; height: 110px; background-color: #020617; overflow: hidden;">
          <img src="${issue.photo_url || ''}" alt="${issue.category}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1584463699042-45218d6e3c54?auto=format&fit=crop&w=600&q=80'" />
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.95), transparent 60%);"></div>
          
          <div style="position: absolute; top: 8px; left: 8px; display: flex; gap: 4px;">
            <span style="background: rgba(15,23,42,0.85); backdrop-filter: blur(4px); color: #f97316; font-size: 10px; font-family: monospace; font-weight: bold; padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(249,115,22,0.4);">
              ${issue.tracking_code}
            </span>
          </div>

          <div style="position: absolute; bottom: 8px; left: 8px; right: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(15,23,42,0.9); font-size: 10px; font-weight: bold; color: #fed7aa; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(249,115,22,0.3);">
              ${issue.category}
            </span>
            <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.15);" class="${statusPillClass}">
              ${statusLabel}
            </span>
          </div>
        </div>

        <div style="padding: 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 12px; font-weight: 700; color: #ffffff; line-height: 1.3; display: flex; align-items: flex-start; gap: 4px;">
            <span style="color: #ea580c; flex-shrink: 0; margin-top: 1px;">📍</span>
            <span>${issue.address}</span>
          </div>

          <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${issue.description}
          </p>

          <button id="btn-view-${issue.id}" style="margin-top: 4px; width: 100%; background: linear-gradient(to right, #ea580c, #c2410c); color: #ffffff; border: none; padding: 8px 12px; border-radius: 10px; font-size: 11px; font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase; cursor: pointer; box-shadow: 0 4px 12px rgba(234,88,12,0.3); transition: all 0.2s;">
            Inspect Full Audit & Actions →
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-${issue.id}`);
        if (btn) {
          btn.onclick = () => onSelectIssue(issue);
        }
      });

      group.addLayer(marker);
    });

    // 2. Add NGO HQ Markers with Architectural Vector Badge Pins
    if (showNgosNearMe) {
      ngos.forEach((ngo, i) => {
        const ngoBuildingSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>`;
        const gradId = `grad-ngo-${i}`;

        const icon = L.divIcon({
          className: 'custom-ngo-pin',
          html: `
            <div class="cir-pin-wrapper" style="position: relative; width: 38px; height: 46px; filter: drop-shadow(0 6px 12px rgba(2,132,199,0.5));">
              <svg width="38" height="46" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="${gradId}" x1="19" y1="0" x2="19" y2="46" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#0284c7" />
                    <stop offset="1" stop-color="#0369a1" />
                  </linearGradient>
                </defs>
                <path d="M19 46C19 46 35 27 35 17.5C35 8.3873 27.8366 1 19 1C10.1634 1 3 8.3873 3 17.5C3 27 19 46 19 46Z" fill="url(#${gradId})" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
                <circle cx="19" cy="17.5" r="11.5" fill="#082f49" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
              </svg>
              <div style="position: absolute; top: 10px; left: 11.5px; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; color: #bae6fd; pointer-events: none;">
                ${ngoBuildingSvg}
              </div>
              <div style="position: absolute; top: -3px; right: -3px; background: #0284c7; color: white; font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 6px; border: 1.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">NGO</div>
            </div>
          `,
          iconSize: [38, 46],
          iconAnchor: [19, 45],
          popupAnchor: [0, -42],
        });

        const lat = 17.43 + (i * 0.015) % 0.05;
        const lng = 78.41 + (i * 0.02) % 0.06;
        const marker = L.marker([lat, lng], { icon });

        marker.bindPopup(`
          <div style="width: 250px; padding: 12px; background: #0f172a; color: #f8fafc; font-family: sans-serif;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="background: rgba(2,132,199,0.2); color: #38bdf8; border: 1px solid rgba(2,132,199,0.4); font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 6px; text-transform: uppercase;">
                Registered NGO Partner
              </span>
            </div>
            <div style="font-weight: 700; color: #ffffff; font-size: 13px;">${ngo.name}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">✉️ ${ngo.contact_email}</div>
            <div style="font-size: 11px; margin-top: 6px; font-weight: 500; color: #cbd5e1;">Divisions: ${ngo.areas_served.slice(0, 3).join(', ')}</div>
          </div>
        `);
        group.addLayer(marker);
      });
    }

    // 3. Add NGO Events Markers with Volunteer Drive Vector Pins
    if (showEventsNearMe) {
      events.forEach((ev, idx) => {
        const eventSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
        const gradId = `grad-event-${idx}`;

        const icon = L.divIcon({
          className: 'custom-event-pin',
          html: `
            <div class="cir-pin-wrapper" style="position: relative; width: 38px; height: 46px; filter: drop-shadow(0 6px 12px rgba(147,51,234,0.5));">
              <svg width="38" height="46" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="${gradId}" x1="19" y1="0" x2="19" y2="46" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#9333ea" />
                    <stop offset="1" stop-color="#6b21a8" />
                  </linearGradient>
                </defs>
                <path d="M19 46C19 46 35 27 35 17.5C35 8.3873 27.8366 1 19 1C10.1634 1 3 8.3873 3 17.5C3 27 19 46 19 46Z" fill="url(#${gradId})" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
                <circle cx="19" cy="17.5" r="11.5" fill="#3b0764" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
              </svg>
              <div style="position: absolute; top: 10px; left: 11.5px; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; color: #f3e8ff; pointer-events: none;">
                ${eventSvg}
              </div>
              <div style="position: absolute; top: -3px; right: -3px; background: #9333ea; color: white; font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 6px; border: 1.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">DRIVE</div>
            </div>
          `,
          iconSize: [38, 46],
          iconAnchor: [19, 45],
          popupAnchor: [0, -42],
        });

        const marker = L.marker([ev.lat, ev.lng], { icon });
        marker.bindPopup(`
          <div style="width: 250px; padding: 12px; background: #0f172a; color: #f8fafc; font-family: sans-serif;">
            <div style="font-size: 9px; font-weight: bold; color: #c084fc; text-transform: uppercase; margin-bottom: 4px;">🤝 VOLUNTEER DRIVE</div>
            <div style="font-weight: 700; font-size: 13px; color: #ffffff;">${ev.title}</div>
            <div style="font-size: 11px; color: #94a3b8; margin: 4px 0;">By ${ev.ngo_name || 'NGO Collective'}</div>
            <div style="margin-top: 6px; font-size: 10px; background-color: rgba(147,51,234,0.2); color: #e9d5ff; border: 1px solid rgba(147,51,234,0.4); font-weight: bold; padding: 3px 8px; border-radius: 6px; display: inline-block;">
              Volunteers Needed: ${ev.volunteers_needed}
            </div>
          </div>
        `);
        group.addLayer(marker);
      });
    }
  }, [issues, ngos, events, selectedCategory, selectedStatus, showNgosNearMe, showEventsNearMe]);

  return (
    <div className="relative w-full h-[calc(100vh-65px)] bg-slate-950 flex flex-col">
      {/* Floating Filter & GIS Legend Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center gap-2.5 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl text-xs">
        <div className="flex items-center space-x-1.5 text-slate-300 font-bold px-2 py-1">
          <Filter className="w-4 h-4 text-orange-500" />
          <span>Filters:</span>
        </div>

        {/* Category Select with SVG Icon Previews */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-950 text-white border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium cursor-pointer"
        >
          <option value="All">All 6 Infrastructure Categories</option>
          <option value="Potholes & Roads">Potholes & Roads</option>
          <option value="Garbage & Sanitation">Garbage & Sanitation</option>
          <option value="Water Supply">Water Supply</option>
          <option value="Street Lighting">Street Lighting</option>
          <option value="Drainage & Sewage">Drainage & Sewage</option>
          <option value="Encroachment">Encroachment & Public Spaces</option>
        </select>

        {/* Status Select */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-950 text-white border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium cursor-pointer"
        >
          <option value="All">{t('all_statuses')}</option>
          <option value="Open">Open & SLA Escalating</option>
          <option value="Pending Proof">Pending Proof Verification</option>
          <option value="Resolved">Verified Resolved</option>
          <option value="Open for NGO">Open for NGO Action</option>
        </select>

        {/* Near Me Quick Toggles */}
        <button
          onClick={() => setShowNgosNearMe(!showNgosNearMe)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-semibold transition cursor-pointer ${
            showNgosNearMe
              ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-950'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{t('filter_ngos_near_me')}</span>
        </button>

        <button
          onClick={() => setShowEventsNearMe(!showEventsNearMe)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-semibold transition cursor-pointer ${
            showEventsNearMe
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950'
              : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('filter_events_near_me')}</span>
        </button>

        {/* Crisp Legend */}
        <div className="ml-auto hidden xl:flex items-center space-x-3 text-[11px] text-slate-300 pl-3 border-l border-slate-800">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30"></span>
            <span className="font-medium">T3 Collector Alert</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="font-medium">T1/T2 Escalating</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="font-medium">Under Review</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-medium">Resolved</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span className="font-medium">NGO Drive</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Target */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
};
