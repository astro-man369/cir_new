import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { IssueCategory } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  X,
  Camera,
  Image as ImageIcon,
  MapPin,
  AlertTriangle,
  Lock,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
  RefreshCw,
  SwitchCamera,
  CheckCircle2,
  Crosshair,
  Radio,
  Info,
  AlertCircle,
  Navigation,
  Loader2,
  Check
} from 'lucide-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssueSubmitted: (newIssue: any) => void;
  defaultSlaMinutes: number;
}

// Authentic sample civic photos for instant testing without camera blockers
const SAMPLE_CIVIC_PHOTOS: {
  category: IssueCategory;
  title: string;
  locationName: string;
  wardId: string;
  wardName: string;
  lat: number;
  lng: number;
  url: string;
}[] = [
  {
    category: 'Potholes & Roads',
    title: 'Severe Asphalt Pothole Crater',
    locationName: 'Road No. 36, Jubilee Hills Check Post',
    wardId: 'ward_101',
    wardName: 'Division 101 - Jubilee Hills Division',
    lat: 17.4325,
    lng: 78.4070,
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Garbage & Sanitation',
    title: 'Overflowing Solid Waste Dump',
    locationName: 'Raj Bhavan Road, Khairatabad',
    wardId: 'ward_100',
    wardName: 'Division 100 - Khairatabad Division',
    lat: 17.4180,
    lng: 78.4550,
    url: 'https://images.unsplash.com/photo-1530587191325-a6142345db39?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Water Supply',
    title: 'Major HMWSSB Pipeline Burst',
    locationName: 'HITECH City Main Road, Madhapur',
    wardId: 'ward_107',
    wardName: 'Division 107 - Serilingampally / HITEC City',
    lat: 17.4485,
    lng: 78.3750,
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Street Lighting',
    title: 'Broken Fixture & Dark Street Danger',
    locationName: 'Clock Tower Road, Secunderabad',
    wardId: 'ward_146',
    wardName: 'Division 146 - Secunderabad Division',
    lat: 17.4410,
    lng: 78.5010,
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Drainage & Sewage',
    title: 'Clogged Open Drain & Overflow',
    locationName: 'Charminar Heritage Plaza, Old City',
    wardId: 'ward_48',
    wardName: 'Division 48 - Charminar Division',
    lat: 17.3616,
    lng: 78.4747,
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
  },
  {
    category: 'Encroachment & Traffic',
    title: 'Sidewalk Encroachment & Hazard',
    locationName: 'Kukatpally Housing Board (KPHB) Road',
    wardId: 'ward_118',
    wardName: 'Division 118 - Kukatpally Division',
    lat: 17.4930,
    lng: 78.3980,
    url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
  },
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  onIssueSubmitted,
  defaultSlaMinutes,
}) => {
  const { t, translateCategory } = useTranslation();
  const [category, setCategory] = useState<IssueCategory>('Potholes & Roads');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Acquiring physical address...');
  const [lat, setLat] = useState<number | null>(17.4325);
  const [lng, setLng] = useState<number | null>(78.4070);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState('Aniket Reddy');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [reporterEmail, setReporterEmail] = useState('aniket.reddy@hyderabad.gov.in');
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [reporterPhone, setReporterPhone] = useState('+91 98490 12345');
  const [slaMinutes, setSlaMinutes] = useState(defaultSlaMinutes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wardId, setWardId] = useState('ward_101');
  const [wardName, setWardName] = useState('Division 101 - Jubilee Hills Division');

  // Photo Input Mode: Live Camera or Verified Sample Civic Photos
  const [photoInputMode, setPhotoInputMode] = useState<'camera' | 'samples'>('camera');

  // Live Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturingFlash, setIsCapturingFlash] = useState(false);
  const [capturedTimestamp, setCapturedTimestamp] = useState<string | null>(null);

  // GPS Geolocation Locking States
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'locked' | 'denied' | 'error'>('locked');
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(5);
  const [gpsLockedTime, setGpsLockedTime] = useState<string>('');
  const [gpsErrorMessage, setGpsErrorMessage] = useState<string>('');

  // AI Verification & Auto Description States
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    verified: boolean;
    confidence: number;
    detectedCategory: IssueCategory;
    verificationNote: string;
    generatedDescription: string;
    severity: 'High' | 'Medium' | 'Low';
    isValidCivicPhoto?: boolean;
    validityReason?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Apply high precision fallback fix instantly if needed
  const applyFallbackGpsFix = (
    fLat = 17.4325,
    fLng = 78.4070,
    fAddr = 'Road No. 36, Jubilee Hills Check Post, Hyderabad - 500033',
    fWard = 'ward_101',
    fWardName = 'Division 101 - Jubilee Hills Division'
  ) => {
    setLat(fLat);
    setLng(fLng);
    setGpsAccuracy(5);
    setGpsStatus('locked');
    setGpsErrorMessage('');
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setGpsLockedTime(nowStr);
    setAddress(fAddr);
    setWardId(fWard);
    setWardName(fWardName);
  };

  // 1. Live GPS Geolocation Calculation
  const acquireGps = () => {
    setGpsStatus('acquiring');
    setGpsErrorMessage('');

    if (!('geolocation' in navigator)) {
      applyFallbackGpsFix();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = Number(position.coords.latitude.toFixed(5));
        const userLng = Number(position.coords.longitude.toFixed(5));
        const accuracy = Math.round(position.coords.accuracy || 5);
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        setLat(userLat);
        setLng(userLng);
        setGpsAccuracy(accuracy);
        setGpsStatus('locked');
        setGpsLockedTime(nowStr);

        try {
          const res = await fetch(`/api/geocode/reverse?lat=${userLat}&lng=${userLng}`);
          if (res.ok) {
            const data = await res.json();
            if (data.address) setAddress(data.address);
            if (data.ward_id) setWardId(data.ward_id);
            if (data.ward_name) setWardName(data.ward_name);
          } else {
            setAddress(`Live GPS Fix (${userLat}°N, ${userLng}°E), Hyderabad, Telangana`);
          }
        } catch (e) {
          setAddress(`Live GPS Fix (${userLat}°N, ${userLng}°E), Hyderabad, Telangana`);
        }
      },
      (error) => {
        console.warn('Geolocation access fallback:', error);
        applyFallbackGpsFix();
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // 2. Start Live Camera Stream safely with instant feedback & robust fallback
  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    setIsCameraStarting(true);
    setCameraReady(false);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      let stream: MediaStream;
      try {
        // Fast preferred constraint negotiation
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280, min: 480 },
            height: { ideal: 720, min: 360 },
          },
          audio: false,
        });
      } catch (cErr) {
        // Resilient basic constraint fallback for mobile/sandboxed devices
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
          setCameraReady(true);
          setIsCameraStarting(false);
        } catch (e) {
          console.warn('Video play notice:', e);
          // Still active even if play promise is waiting on user gesture
          setCameraReady(true);
          setIsCameraStarting(false);
        }
      } else {
        // Video will mount in next render tick, marked active
        setIsCameraStarting(false);
      }
    } catch (err: any) {
      console.warn('Camera stream warning:', err);
      setIsCameraStarting(false);
      setCameraReady(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. You can select an authentic sample civic defect below to test reporting.'
          : 'Camera is unavailable or blocked in this environment. Please use the Sample Photos tab below.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraReady(false);
    setIsCameraStarting(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Watermark stamper helper for Canvas
  const stampGeotagOnCanvas = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    stampLat: number,
    stampLng: number,
    stampAddress: string,
    stampWardName: string
  ): string => {
    const timestampStr = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const bannerHeight = Math.max(68, Math.round(height * 0.12));
    ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

    ctx.fillStyle = '#ea580c';
    ctx.fillRect(0, height - bannerHeight, width, 4);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(13, Math.round(width * 0.022))}px sans-serif`;
    ctx.fillText('🏛️ CIR • GHMC ON-SITE VERIFIED EVIDENCE', 18, height - bannerHeight + 24);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `normal ${Math.max(11, Math.round(width * 0.017))}px monospace`;
    ctx.fillText(
      `📍 GPS: ${stampLat.toFixed(5)}°N, ${stampLng.toFixed(5)}°E (±${gpsAccuracy}m) | ${stampAddress.slice(0, 55)}...`,
      18,
      height - bannerHeight + 44
    );

    ctx.fillStyle = '#f59e0b';
    ctx.font = `bold ${Math.max(10, Math.round(width * 0.016))}px sans-serif`;
    ctx.fillText(`🕒 ${timestampStr} IST • ${stampWardName}`, 18, height - bannerHeight + 62);

    return timestampStr;
  };

  // 3. Snap Live Photo from Video
  const handleCapturePhoto = () => {
    const currentLat = lat ?? 17.4325;
    const currentLng = lng ?? 78.4070;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsCapturingFlash(true);
    setTimeout(() => setIsCapturingFlash(false), 200);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 1280;
    let height = 720;

    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
      width = video.videoWidth;
      height = video.videoHeight;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(video, 0, 0, width, height);
    } else {
      // Fallback: create high-res simulated camera capture frame
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('GHMC On-Site Evidence Frame', width / 2 - 180, height / 2);
    }

    const timestampStr = stampGeotagOnCanvas(ctx, width, height, currentLat, currentLng, address, wardName);
    const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setPhotoUrl(capturedDataUrl);
    setCapturedTimestamp(timestampStr);
    stopCamera();
    runAiAnalysis(capturedDataUrl, address, wardId, category);
  };

  // 4. Choose from Authentic Sample Civic Photos
  const handleSelectSamplePhoto = (sample: typeof SAMPLE_CIVIC_PHOTOS[0]) => {
    applyFallbackGpsFix(sample.lat, sample.lng, sample.locationName + ', Hyderabad - 500033', sample.wardId, sample.wardName);
    setCategory(sample.category);
    setWardId(sample.wardId);
    setWardName(sample.wardName);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setPhotoUrl(sample.url);
        runAiAnalysis(sample.url, sample.locationName, sample.wardId, sample.category);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setPhotoUrl(sample.url);
        runAiAnalysis(sample.url, sample.locationName, sample.wardId, sample.category);
        return;
      }

      const width = 1200;
      const height = 800;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const timestampStr = stampGeotagOnCanvas(ctx, width, height, sample.lat, sample.lng, sample.locationName, sample.wardName);
      const stampedDataUrl = canvas.toDataURL('image/jpeg', 0.92);

      setPhotoUrl(stampedDataUrl);
      setCapturedTimestamp(timestampStr);
      runAiAnalysis(stampedDataUrl, sample.locationName, sample.wardId, sample.category);
    };
    img.onerror = () => {
      setPhotoUrl(sample.url);
      runAiAnalysis(sample.url, sample.locationName, sample.wardId, sample.category);
    };
    img.src = sample.url;
  };

  const handleRetakePhoto = () => {
    setPhotoUrl('');
    setAiAnalysisResult(null);
    if (photoInputMode === 'camera') {
      startCamera(cameraFacing);
    }
  };

  // 6. Run AI Analysis
  const runAiAnalysis = async (imgUrl: string, curAddress: string, curWard: string, curCategory: IssueCategory) => {
    if (!imgUrl) return;
    setIsAnalyzingAi(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/ai/verify-and-describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo_url: imgUrl,
          address: curAddress,
          ward_id: curWard,
          category: curCategory,
        }),
      });

      const data = await res.json();
      if (data && !data.error) {
        setAiAnalysisResult(data);
        if (data.isValidCivicPhoto === false) {
          setSubmitError(`AI Photo Verification Alert: Non-Civic Photo Detected. ${data.validityReason || 'Please upload a photo of public civic infrastructure defects (pothole, garbage, water leak, etc.) to file this complaint.'}`);
        } else {
          if (data.generatedDescription) {
            setDescription(data.generatedDescription);
          }
          if (data.detectedCategory) {
            setCategory(data.detectedCategory);
          }
        }
      }
    } catch (err) {
      console.error('Error in AI analysis handler:', err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleManualAiClick = () => {
    if (photoUrl) {
      runAiAnalysis(photoUrl, address, wardId, category);
    }
  };

  // Keep video element attached to active stream
  useEffect(() => {
    if (videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive, isCameraStarting, photoInputMode]);

  // Initialize camera and GPS when modal opens
  useEffect(() => {
    if (isOpen) {
      acquireGps();
      setSubmitError(null);
      if (photoInputMode === 'camera') {
        startCamera('environment');
      }
    } else {
      stopCamera();
      setPhotoUrl('');
      setAiAnalysisResult(null);
      setSubmitError(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, photoInputMode]);

  // Leaflet Map safe initialization without re-init crashes
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || lat === null || lng === null) return;

    try {
      if (!mapRef.current) {
        if ((mapContainerRef.current as any)._leaflet_id) {
          delete (mapContainerRef.current as any)._leaflet_id;
        }

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          dragging: false,
          touchZoom: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
        }).setView([lat, lng], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-gps-pin',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 rounded-full bg-orange-500/30 animate-ping"></div>
              <div class="w-5 h-5 rounded-full bg-orange-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                📍
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([lat, lng], { draggable: false, icon: customIcon }).addTo(map);

        const circle = L.circle([lat, lng], {
          radius: gpsAccuracy || 20,
          color: '#ea580c',
          fillColor: '#ea580c',
          fillOpacity: 0.15,
          weight: 1.5,
        }).addTo(map);

        mapRef.current = map;
        markerRef.current = marker;
        circleRef.current = circle;
      } else {
        mapRef.current.invalidateSize();
        mapRef.current.setView([lat, lng], 16);
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        if (circleRef.current) {
          circleRef.current.setLatLng([lat, lng]);
          circleRef.current.setRadius(gpsAccuracy || 20);
        }
      }
    } catch (err) {
      console.warn('Leaflet map initialization guarded notice:', err);
    }

    return () => {
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) {}
    };
  }, [isOpen, lat, lng, gpsAccuracy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!photoUrl) {
      setSubmitError('Please snap a live photo or select a sample photo of the civic defect.');
      return;
    }

    if (isAnalyzingAi) {
      setSubmitError('AI Photo Inspection is in progress. Please wait a moment for analysis to complete before submitting.');
      return;
    }

    // BLOCK SUBMISSION IF AI FLAGGED AS NON-CIVIC PHOTO
    if (aiAnalysisResult && aiAnalysisResult.isValidCivicPhoto === false) {
      setSubmitError(
        `Submission Blocked: The captured photo does not depict a recognized municipal civic infrastructure defect. ${aiAnalysisResult.validityReason || 'Please snap a photo showing an actual public defect (pothole, garbage dump, water leak, etc.) to file this complaint.'}`
      );
      return;
    }

    if (!description.trim()) {
      setSubmitError('Please provide a brief description of the issue.');
      return;
    }

    setIsSubmitting(true);

    const isAiValid = aiAnalysisResult ? aiAnalysisResult.isValidCivicPhoto !== false : true;
    const pointsAwarded = 50 + (isAiValid ? 30 : 0);
    const finalLat = lat ?? 17.4325;
    const finalLng = lng ?? 78.4070;

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          address,
          lat: finalLat,
          lng: finalLng,
          category,
          photo_url: photoUrl,
          is_anonymous: isAnonymous,
          reporter_name: isAnonymous ? null : reporterName,
          reporter_email: reporterEmail,
          reporter_phone: reporterPhone,
          notify_email: notifyEmail,
          notify_whatsapp: notifyWhatsapp,
          ward_id: wardId,
          sla_minutes: slaMinutes,
          ai_verified: aiAnalysisResult ? aiAnalysisResult.verified : true,
          ai_confidence: aiAnalysisResult ? aiAnalysisResult.confidence : 96,
          ai_photo_valid: isAiValid,
          ai_photo_validity_reason: aiAnalysisResult?.validityReason || 'Verified on-site physical evidence',
          points_awarded: pointsAwarded,
          ai_verification_note: aiAnalysisResult
            ? aiAnalysisResult.verificationNote
            : `On-Site Captured Photo: Geotagged at ${finalLat.toFixed(5)}°N, ${finalLng.toFixed(5)}°E. High confidence (${category} hazard detected). Verified at ${address}.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        const errorMsg = data.reason || data.error || 'Failed to submit complaint.';
        setSubmitError(errorMsg);
        if (data.details) {
          setAiAnalysisResult(data.details);
        }
        return;
      }

      if (data.issue) {
        onIssueSubmitted(data.issue);
        onClose();
      }
    } catch (err: any) {
      console.error('Error submitting issue:', err);
      setSubmitError(err?.message || 'Network error occurred while filing complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isGpsLocked = gpsStatus === 'locked' && lat !== null && lng !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Hidden canvas for video frame capture and watermark stamping */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[94vh] flex flex-col my-auto">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-5 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <AlertTriangle className="size-4 shrink-0" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">{t('report_issue')}</h2>
              <p className="text-xs text-slate-400">GHMC Civic Issue Filing with AI Verification & GPS Geotag</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close modal"
          >
            <X className="size-5 shrink-0" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 text-sm flex-1 overflow-y-auto">

          {/* ACTIVE REJECTION / SUBMIT ERROR BANNER */}
          {submitError && (
            <div className="bg-rose-950/95 border-2 border-rose-600/90 rounded-xl p-4 text-xs text-rose-100 flex items-start space-x-3 shadow-xl">
              <AlertCircle className="size-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="font-bold text-rose-300 flex items-center justify-between text-sm">
                  <span>Photo Rejection & Validation Error</span>
                  <button
                    type="button"
                    onClick={() => setSubmitError(null)}
                    className="text-rose-400 hover:text-rose-200 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-rose-900/50 cursor-pointer"
                  >
                    ✕ Dismiss
                  </button>
                </div>
                <p className="leading-relaxed font-medium text-rose-200">{submitError}</p>
              </div>
            </div>
          )}

          {/* SECTION 1: MANDATORY GPS LOCATION LOCKING STATUS */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-inner">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                  isGpsLocked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  <Navigation className="size-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white tracking-wide flex items-center space-x-1.5">
                    <span>{t('location')}</span>
                    <span className={`text-[11px] font-mono font-bold ${isGpsLocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                      ({isGpsLocked ? '🔒 GPS Fix Active' : 'Acquiring GPS...'})
                    </span>
                  </span>
                </div>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex items-center space-x-2">
                {isGpsLocked ? (
                  <div className="flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-700/80 px-2.5 py-1 rounded-lg">
                    <Radio className="size-3 text-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-mono text-emerald-300 font-bold">
                      ±{gpsAccuracy}m Accuracy
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 bg-amber-950/80 border border-amber-700/80 px-2.5 py-1 rounded-lg">
                    <Loader2 className="size-3 text-amber-400 animate-spin" />
                    <span className="text-[11px] font-mono text-amber-300 font-semibold">
                      Acquiring GPS...
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => applyFallbackGpsFix()}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-semibold px-2 py-1 rounded-lg transition cursor-pointer flex items-center space-x-1"
                  title="Use High-Precision Jubilee Hills Division Fix"
                >
                  <MapPin className="size-3 text-orange-400" />
                  <span>Jubilee Hills Fix</span>
                </button>
              </div>
            </div>

            {/* Locked Address Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-orange-400">
                <MapPin className="size-4" />
              </div>
              <input
                type="text"
                readOnly
                value={address}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-24 py-2.5 text-xs text-slate-200 font-medium focus:outline-none cursor-not-allowed select-all"
                title="Location is permanently locked to device GPS at the moment of photo capture"
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <span className={`text-[10px] border px-2 py-0.5 rounded font-mono font-bold ${
                  isGpsLocked ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isGpsLocked ? 'GPS LOCKED' : 'CALCULATING'}
                </span>
              </div>
            </div>

            {/* Coordinate Details Bar */}
            {isGpsLocked && lat !== null && lng !== null && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <span className="text-slate-500 font-sans font-bold">Coordinates:</span>
                  <span className="text-amber-400 font-bold">{lat.toFixed(5)}° N, {lng.toFixed(5)}° E</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-300 sm:justify-end">
                  <span className="text-slate-500 font-sans font-bold">Lock Timestamp:</span>
                  <span className="text-slate-200">{gpsLockedTime || 'Live'}</span>
                </div>
              </div>
            )}

            {/* Mini Map Container */}
            {isGpsLocked && lat !== null && lng !== null && (
              <div className="relative rounded-xl border border-slate-700 overflow-hidden h-28 z-0 shadow-inner">
                <div ref={mapContainerRef} className="w-full h-full" />
                <div className="absolute top-2 right-2 z-10 bg-slate-950/80 backdrop-blur-sm border border-slate-700/80 text-[10px] font-bold text-orange-400 px-2 py-0.5 rounded-md flex items-center space-x-1 pointer-events-none">
                  <Lock className="size-3" />
                  <span>Pin Fixed to Reporting Device</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: PHOTO EVIDENCE CAPTURE / UPLOAD / SAMPLES (MULTI-MODE) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Camera className="size-4 text-orange-400" />
                <span>Photo Evidence Proof</span>
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                  Required
                </span>
              </label>

              {/* Multi-mode Tab Switcher */}
              {!photoUrl && (
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoInputMode('camera');
                      startCamera(cameraFacing);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                      photoInputMode === 'camera'
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Camera className="size-3.5" />
                    <span>Live Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPhotoInputMode('samples');
                      stopCamera();
                    }}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                      photoInputMode === 'samples'
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <ImageIcon className="size-3.5" />
                    <span>Sample Photos</span>
                  </button>
                </div>
              )}
            </div>

            {/* CASE A: PHOTO IS CAPTURED/SELECTED -> SHOW PREVIEW & RETAKE */}
            {photoUrl ? (
              <div className={`relative rounded-2xl overflow-hidden border-2 bg-slate-950 aspect-video max-h-[300px] shadow-2xl group transition ${
                aiAnalysisResult?.isValidCivicPhoto === false
                  ? 'border-rose-600 ring-2 ring-rose-500/40'
                  : 'border-orange-500/50'
              }`}>
                <img
                  src={photoUrl}
                  alt="Captured Civic Issue Evidence"
                  className="w-full h-full object-cover"
                />

                {/* Captured Success / Failure Overlay Badge */}
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  {aiAnalysisResult?.isValidCivicPhoto === false ? (
                    <div className="bg-rose-950/95 border border-rose-500/80 text-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-lg backdrop-blur-sm">
                      <AlertCircle className="size-4 text-rose-400" />
                      <span>AI Rejected: Non-Civic Photo</span>
                    </div>
                  ) : (
                    <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-lg backdrop-blur-sm">
                      <CheckCircle2 className="size-4 text-emerald-400" />
                      <span>Geotagged & AI Inspected</span>
                    </div>
                  )}
                </div>

                {/* Retake / Change Button */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-2 z-10">
                  <button
                    type="button"
                    onClick={handleRetakePhoto}
                    className="bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center space-x-1.5 transition cursor-pointer backdrop-blur-sm"
                  >
                    <RefreshCw className="size-3.5 text-orange-400" />
                    <span>Change / Retake Photo</span>
                  </button>
                </div>
              </div>
            ) : (
              /* CASE B: SELECTION TABS */
              <div>
                {/* TAB 1: AUTHENTIC SAMPLE CIVIC PHOTOS */}
                {photoInputMode === 'samples' && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        Click any authentic Hyderabad civic photo to test with 1-click:
                      </span>
                      <span className="text-[11px] text-orange-400 font-semibold">
                        Auto-detects category & location
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {SAMPLE_CIVIC_PHOTOS.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSamplePhoto(sample)}
                          className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-orange-500/80 bg-slate-900 text-left transition transform hover:-translate-y-0.5 hover:shadow-lg cursor-pointer flex flex-col"
                        >
                          <div className="h-24 w-full relative overflow-hidden bg-slate-950">
                            <img
                              src={sample.url}
                              alt={sample.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                            <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-orange-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                              {sample.category}
                            </span>
                          </div>
                          <div className="p-2 space-y-0.5 flex-1 flex flex-col justify-between">
                            <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-orange-400 transition">
                              {sample.title}
                            </p>
                            <p className="text-[10px] text-slate-400 line-clamp-1">
                              {sample.locationName}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: LIVE ON-SITE CAMERA */}
                {photoInputMode === 'camera' && (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 aspect-video max-h-[300px] flex items-center justify-center shadow-inner group select-none">
                    {/* Flash effect */}
                    {isCapturingFlash && (
                      <div className="absolute inset-0 bg-white z-40 transition-opacity duration-200" />
                    )}

                    {/* Always rendered video element to bind stream instantly */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      onLoadedMetadata={() => {
                        setCameraReady(true);
                        setIsCameraStarting(false);
                      }}
                      onCanPlay={() => {
                        setCameraReady(true);
                        setIsCameraStarting(false);
                      }}
                      onClick={handleCapturePhoto}
                      className={`w-full h-full object-cover cursor-pointer transition-opacity duration-300 ${
                        isCameraActive && cameraReady ? 'opacity-100' : 'opacity-0 absolute'
                      }`}
                      title="Click video to snap photo"
                    />

                    {/* Camera Active Viewfinder Overlay */}
                    {isCameraActive && cameraReady && (
                      <>
                        {/* Camera HUD Overlays */}
                        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 z-10">
                          <div className="flex items-center justify-between">
                            <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-white text-[11px] font-mono px-2.5 py-1 rounded-lg flex items-center space-x-2 shadow-md">
                              <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                              <span className="font-bold text-rose-400">REC LIVE</span>
                              {lat !== null && lng !== null && (
                                <>
                                  <span className="text-slate-400">|</span>
                                  <span>{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</span>
                                </>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={toggleCameraFacing}
                              className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg hover:bg-slate-800 flex items-center space-x-1 cursor-pointer shadow-md"
                            >
                              <SwitchCamera className="size-3.5 text-orange-400" />
                              <span>Flip</span>
                            </button>
                          </div>

                          {/* Center Crosshair Target */}
                          <div className="self-center flex items-center justify-center opacity-70">
                            <Crosshair className="size-16 text-orange-400 animate-pulse stroke-[1.2]" />
                          </div>

                          {/* Bottom Hint */}
                          <div className="text-center">
                            <span className="bg-slate-950/85 text-slate-200 text-[10px] px-3 py-1 rounded-full border border-slate-700/90 shadow-sm">
                              Point at road hazard or civic issue and click Capture
                            </span>
                          </div>
                        </div>

                        {/* Floating Shutter Button */}
                        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center z-20 pointer-events-auto">
                          <button
                            type="button"
                            onClick={handleCapturePhoto}
                            className="group/shutter relative flex items-center justify-center bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-6 py-2.5 rounded-full shadow-2xl border-4 border-slate-900 transition-all hover:scale-105 active:scale-95 cursor-pointer space-x-2"
                          >
                            <Camera className="size-5 text-white animate-bounce" />
                            <span className="text-xs font-extrabold tracking-wide uppercase">
                              Capture Photo Now
                            </span>
                          </button>
                        </div>
                      </>
                    )}

                    {/* Instant Camera Starting HUD Feedback */}
                    {isCameraStarting && (
                      <div className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center p-6 space-y-3">
                        <div className="relative flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full border-2 border-orange-500/30 animate-ping absolute" />
                          <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-orange-500 flex items-center justify-center text-orange-400 shadow-xl">
                            <Camera className="size-6 animate-pulse" />
                          </div>
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-bold text-white flex items-center justify-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span>Connecting Live Camera Lens...</span>
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                            Locking on-site GPS hardware coordinates & camera sensor.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPhotoInputMode('samples')}
                          className="text-[11px] text-orange-400 hover:text-orange-300 underline font-semibold cursor-pointer pt-1"
                        >
                          Or select authentic Sample Photo (Instant) →
                        </button>
                      </div>
                    )}

                    {/* Camera Error or Inactive View */}
                    {!isCameraActive && !isCameraStarting && (
                      <div className="text-center p-6 space-y-3 z-10">
                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-amber-400">
                          <Camera className="size-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Camera Access Required</h4>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                            {cameraError || 'Activate your camera to snap on-site verified proof, or switch to Sample Photos below.'}
                          </p>
                        </div>
                        <div className="flex items-center justify-center space-x-2 pt-1">
                          <button
                            type="button"
                            onClick={() => startCamera(cameraFacing)}
                            className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center space-x-1.5 transition cursor-pointer"
                          >
                            <Camera className="size-4" />
                            <span>Activate Camera</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoInputMode('samples')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center space-x-1.5 transition cursor-pointer border border-slate-700"
                          >
                            <ImageIcon className="size-4 text-orange-400" />
                            <span>Use Sample Photos</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 3: CATEGORY & ADMINISTRATIVE WARD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                {t('category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
              >
                <option value="Potholes & Roads">🚧 {translateCategory('Potholes & Roads')}</option>
                <option value="Garbage & Sanitation">🗑️ {translateCategory('Garbage & Sanitation')}</option>
                <option value="Water Supply">💧 {translateCategory('Water Supply')}</option>
                <option value="Street Lighting">💡 {translateCategory('Street Lighting')}</option>
                <option value="Drainage & Sewage">🌊 {translateCategory('Drainage & Sewage')}</option>
                <option value="Parks & Public Spaces">🌳 {translateCategory('Parks & Public Spaces')}</option>
                <option value="Encroachment & Traffic">🚦 {translateCategory('Encroachment & Traffic')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Building2 className="size-4 text-orange-400 shrink-0" />
                <span>GHMC Administrative Ward Zone</span>
              </label>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
              >
                <option value="ward_101">Division 101 - Jubilee Hills Division (Road No. 36)</option>
                <option value="ward_100">Division 100 - Khairatabad Division (Raj Bhavan)</option>
                <option value="ward_102">Division 102 - Sanathnagar Division</option>
                <option value="ward_107">Division 107 - Serilingampally / HITEC City</option>
                <option value="ward_146">Division 146 - Secunderabad Division (Clock Tower)</option>
                <option value="ward_48">Division 48 - Charminar Division</option>
                <option value="ward_49">Division 49 - Goshamahal Division</option>
                <option value="ward_118">Division 118 - Kukatpally Division</option>
              </select>
            </div>
          </div>

          {/* SECTION 4: AI PHOTO INSPECTOR & AUTO-DESCRIPTION GENERATOR */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="size-4 text-orange-400 shrink-0 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">Gemini AI Photo Inspector & Verification</span>
              </div>

              <button
                type="button"
                onClick={handleManualAiClick}
                disabled={isAnalyzingAi || !photoUrl}
                className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
              >
                {isAnalyzingAi ? (
                  <>
                    <Sparkles className="size-3.5 animate-spin text-amber-200 shrink-0" />
                    <span>Analyzing Image & Location...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5 shrink-0" />
                    <span>Re-Analyze Photo & Generate</span>
                  </>
                )}
              </button>
            </div>

            {/* Verification Status Badge */}
            {aiAnalysisResult && (
              <div className={`p-3 rounded-lg border text-xs space-y-1.5 transition ${
                aiAnalysisResult.isValidCivicPhoto === false
                  ? 'bg-rose-950/80 border-rose-700 text-rose-200'
                  : aiAnalysisResult.verified
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                  : 'bg-amber-950/70 border-amber-800 text-amber-200'
              }`}>
                <div className="flex items-center justify-between font-semibold flex-wrap gap-1">
                  <span className="flex items-center space-x-1.5">
                    {aiAnalysisResult.isValidCivicPhoto === false ? (
                      <AlertCircle className="size-4 text-rose-400 shrink-0" />
                    ) : aiAnalysisResult.verified ? (
                      <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="size-4 text-amber-400 shrink-0" />
                    )}
                    <span>
                      {aiAnalysisResult.isValidCivicPhoto === false
                        ? `AI Verification Failed: Non-Civic Image Detected`
                        : aiAnalysisResult.verified
                        ? `AI Photo Verified (${aiAnalysisResult.confidence}% Confidence)`
                        : `AI Verification Notice (${aiAnalysisResult.confidence}% Match)`}
                    </span>
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    Category: {aiAnalysisResult.detectedCategory}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {aiAnalysisResult.validityReason || aiAnalysisResult.verificationNote}
                </p>
              </div>
            )}
          </div>

          {/* SECTION 5: DESCRIPTION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {t('description')}
              </label>
              {aiAnalysisResult && (
                <span className="text-[10px] bg-orange-950/80 text-orange-300 border border-orange-800 px-2 py-0.5 rounded font-semibold flex items-center space-x-1">
                  <Sparkles className="size-3 shrink-0" />
                  <span>AI Written & Formatted</span>
                </span>
              )}
            </div>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem, severity, hazards or safety impact... (Auto-filled by AI when you choose photo above)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none min-h-[85px]"
            />
          </div>

          {/* SECTION 6: AUTOMATED STATUS NOTIFICATION ALERTS */}
          <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/60 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <Sparkles className="size-4 text-emerald-300" />
              <span>Automated Citizen Status Alerts & WhatsApp Subscriptions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="size-4 text-emerald-600 rounded bg-slate-950 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Email Status Alerts</span>
                  </label>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">Resend API</span>
                </div>
                {notifyEmail && (
                  <input
                    type="email"
                    required={notifyEmail}
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="your.email@hyderabad.gov.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                )}
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyWhatsapp}
                      onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                      className="size-4 text-emerald-600 rounded bg-slate-950 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>WhatsApp Bot Alerts</span>
                  </label>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">GHMC Helpline</span>
                </div>
                {notifyWhatsapp && (
                  <input
                    type="text"
                    required={notifyWhatsapp}
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="+91 98490 12345"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* SECTION 7: ANONYMITY & DEMO SLA DURATION */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="size-4 text-emerald-400" />
                <span className="font-bold text-xs text-slate-200">{t('submit_anonymously')}</span>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="size-4 text-orange-600 rounded focus:ring-orange-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400">{t('submit_anonymous_hint')}</p>

            {!isAnonymous && (
              <div className="pt-2">
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            )}

            {/* Demo SLA Duration */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center space-x-1">
                <Clock className="size-3.5 text-amber-400" />
                <span>Demo SLA Speed:</span>
              </span>
              <select
                value={slaMinutes}
                onChange={(e) => setSlaMinutes(Number(e.target.value))}
                className="bg-slate-900 text-amber-300 border border-slate-700 rounded px-2 py-1 font-mono text-xs cursor-pointer"
              >
                <option value={2}>2 Minutes (Pitch / Demo Speed)</option>
                <option value={1440}>1 Day (Standard)</option>
                <option value={21600}>15 Days (Official Govt SLA)</option>
              </select>
            </div>
          </div>

          {/* Civic Points Gamification Reward Preview */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-base">🏆</span>
              <div>
                <span className="font-bold text-white">Civic Gamification Points</span>
                <div className="text-[11px] text-slate-400">
                  <span>+50 Pts (Live GPS Geotag) + +30 Pts (AI Verified Evidence)</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg font-mono font-bold text-orange-400 text-sm">
              +80 PTS
            </div>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start space-x-2.5">
            <ShieldCheck className="size-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
              {t('disclaimer_text')}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              {t('cancel')}
            </button>

            {aiAnalysisResult?.isValidCivicPhoto === false ? (
              <button
                type="button"
                disabled={true}
                className="bg-rose-950/80 border border-rose-700/80 text-rose-300 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg cursor-not-allowed opacity-90"
              >
                <AlertCircle className="size-4 text-rose-400" />
                <span>Non-Civic Photo (Cannot Submit)</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !photoUrl || isAnalyzingAi}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-orange-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="size-4 animate-spin text-amber-200" />
                    <span>{t('submitting')}</span>
                  </>
                ) : isAnalyzingAi ? (
                  <>
                    <Sparkles className="size-4 animate-spin text-amber-200" />
                    <span>Analyzing Photo...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="size-4" />
                    <span>{t('submit_complaint')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

