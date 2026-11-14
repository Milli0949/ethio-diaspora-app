import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, Flag, Heart, ShieldAlert, X } from 'lucide-react';
import { Lang, PersonProfile } from '../types/app';
import { Avatar } from './Avatar';

interface MatchModalProps {
  person: PersonProfile | null;
  lang: Lang;
  onMessage: (personId: number) => void;
  onClose: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  person,
  lang,
  onMessage,
  onClose,
}) => {
  if (!person) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 text-center shadow-2xl">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mb-4">
          <Heart className="w-7 h-7 fill-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          {lang === 'am' ? 'እንኳን ደስ አለዎት — ተገጣጥመዋል!' : "It's a Match!"}
        </h2>
        <div className="flex justify-center my-4">
          <Avatar name={person.name} color={person.color} size="xl" verified />
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6">
          {lang === 'am'
            ? `እርስዎ እና ${person.name} (${person.age}) እርስ በርስ ተዋድደዋል። አሁን ውይይት መጀመር ይችላሉ!`
            : `You and ${person.name} (${person.age}) liked each other. Start a conversation now!`}
        </p>
        <div className="space-y-2.5">
          <button
            onClick={() => onMessage(person.id)}
            className="w-full min-h-[46px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            {lang === 'am' ? 'መልእክት ላክ' : 'Send Message'}
          </button>
          <button
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-sm transition-colors cursor-pointer"
          >
            {lang === 'am' ? 'ቀጥል' : 'Keep Browsing'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface SelfieModalProps {
  open: boolean;
  lang: Lang;
  onVerify: (snapshotUrl?: string) => void;
  onClose: () => void;
}

export const SelfieModal: React.FC<SelfieModalProps> = ({
  open,
  lang,
  onVerify,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [streamReady, setStreamReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    let currentStream: MediaStream | null = null;
    setCameraError(false);
    setStreamReady(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(true);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamReady(true);
      })
      .catch(() => {
        if (active) setCameraError(true);
      });

    return () => {
      active = false;
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [open]);

  if (!open) return null;
    const handleCaptureAndVerify = () => {
    if (!streamReady || !videoRef.current || !videoRef.current.videoWidth) {
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, 400, 400);
    const snapshot = canvas.toDataURL('image/jpeg', 0.8);
    onVerify(snapshot);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-rose-500" />
            <span>{lang === 'am' ? 'የፊት ካሜራ ማረጋገጫ' : 'Live Selfie Verification'}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          {lang === 'am'
            ? 'ከፕሮፋይል ፎቶዎ ጋር ለማመሳሰል ፊትዎን በክቡ ውስጥ አስገብተው ፎቶ ያንሱ (ካሜራ መፍቀድ ግዴታ ነው)።'
            : 'Center your face inside the circle to match your profile photo (Camera permission required).'}
        </p>

        <div className="mx-auto w-48 h-48 rounded-full overflow-hidden border-2 border-rose-500 bg-zinc-950 mb-5 flex items-center justify-center">
          {cameraError ? (
            <div className="p-4 text-center">
              <Camera className="w-9 h-9 text-rose-500 mx-auto mb-2" />
              <p className="text-xs text-rose-400 font-medium">
                {lang === 'am'
                  ? 'ካሜራው አልተከፈተም! እባክዎ የብራውዘርዎን Camera Permission ፈቅደው እንደገና ይሞክሩ።'
                  : 'Camera blocked! Please allow browser camera permission to verify.'}
              </p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            disabled={!streamReady || cameraError}
            onClick={handleCaptureAndVerify}
            className={`w-full min-h-[46px] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
              streamReady && !cameraError
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{lang === 'am' ? 'ፎቶ አንሳ እና አረጋግጥ (Verify Face)' : 'Capture & Verify Face'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-medium text-sm cursor-pointer"
          >
            {lang === 'am' ? 'ዝጋ' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
interface ReportModalProps {
  targetName: string | null;
  lang: Lang;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  targetName,
  lang,
  onSubmit,
  onClose,
}) => {
  const [reason, setReason] = useState('fake');
  const [details, setDetails] = useState('');

  if (!targetName) return null;

  const reasons = [
    { id: 'fake', am: 'የውሸት መገለጫ / Fake Profile', en: 'Fake or misleading profile' },
    { id: 'harassment', am: 'ትንኮሳ ወይም ስድብ', en: 'Harassment or disrespectful behavior' },
    { id: 'spam', am: 'ስፓም ወይም ማጭበርበር', en: 'Spam or scam attempt' },
    { id: 'underage', am: 'ከ18 ዓመት በታች', en: 'Suspected underage user' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Flag className="w-4 h-4 text-amber-500" />
            {lang === 'am' ? `ሪፖርት አድርግ (${targetName})` : `Report ${targetName}`}
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2 mb-3">
          {reasons.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setReason(r.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm transition-colors cursor-pointer ${
                reason === r.id
                  ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {lang === 'am' ? r.am : r.en}
            </button>
          ))}
        </div>
        <textarea
          rows={2}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder={lang === 'am' ? 'ተጨማሪ ማብራሪያ (አማራጭ)...' : 'Additional details (optional)...'}
          className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 mb-4 focus:outline-none focus:border-rose-500"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 min-h-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium cursor-pointer"
          >
            {lang === 'am' ? 'ተወው' : 'Cancel'}
          </button>
          <button
            onClick={() => {
              onSubmit(details ? `${reason}: ${details}` : reason);
              setDetails('');
            }}
            className="flex-1 min-h-[44px] rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold cursor-pointer"
          >
            {lang === 'am' ? 'ሪፖርት ላክ' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = true,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 text-center">
        <div
          className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
            danger
              ? 'bg-red-500/15 text-red-500'
              : 'bg-purple-500/15 text-purple-500'
          }`}
        >
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">{description}</p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 min-h-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-medium cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 min-h-[44px] rounded-xl text-white text-sm font-semibold cursor-pointer ${
              danger ? 'bg-red-600 hover:bg-red-500' : 'bg-purple-600 hover:bg-purple-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
