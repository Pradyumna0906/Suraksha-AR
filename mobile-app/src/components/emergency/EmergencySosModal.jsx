import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Radio, MapPin, PhoneCall, CheckCircle2, Share2, Copy, AlertTriangle } from 'lucide-react';
import { playAudioBeep, speakInstruction } from '../../utils/audioEngine';

export default function EmergencySosModal({ isOpen, onClose }) {
  const [sosSent, setSosSent] = useState(false);
  const [coords, setCoords] = useState({ lat: 23.7957, lng: 86.4304, location: "Jharia Coalfield, Dhanbad Shaft #4" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude.toFixed(4),
            lng: pos.coords.longitude.toFixed(4),
            location: "Device location shown for this training drill"
          });
        },
        (err) => {
          console.warn("Using simulated GPS location:", err);
        }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendSos = () => {
    playAudioBeep('alarm');
    setSosSent(true);
    speakInstruction("Training simulation complete. No emergency signal was sent.", 'hi');
  };

  const copyDistressMsg = () => {
    const text = `TRAINING SIMULATION REPORT — NO REAL EMERGENCY SIGNAL SENT\nWorker ID: JHK-MN-2026-081\nLocation for drill: ${coords.location} (${coords.lat}° N, ${coords.lng}° E)\nScenario: High Methane / Entrapment Risk\nIn a real incident, follow the approved site emergency plan.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-red-500/60 rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-600 text-white rounded-2xl animate-pulse ring-2 ring-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">EMERGENCY REPORTING DRILL</h3>
            <p className="text-xs text-red-400 font-bold">Training simulation — follow your site emergency plan in a real incident</p>
          </div>
        </div>

        {!sosSent ? (
          <div className="space-y-4 text-center">
            {/* Location displayed only to practise reporting information. */}
            <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl text-left space-y-2 text-xs text-slate-300 shadow-inner">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{coords.location}</span>
                </div>
                <span className="font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                  {coords.lat}° N, {coords.lng}° E
                </span>
              </div>
              <p className="text-slate-400">
                This training drill prepares the worker to report location, hazard type, and worker ID. It does not send a real emergency signal.
              </p>
            </div>

            {/* Main training-drill action */}
            <button
              onClick={handleSendSos}
              className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-black text-sm rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:brightness-110 animate-bounce flex items-center justify-center space-x-2 ring-2 ring-red-400/60"
            >
              <Radio className="w-5 h-5" />
              <span>SIMULATE EMERGENCY REPORT</span>
            </button>

            {/* Direct Call & Share Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:112"
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 border border-slate-700"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Call Emergency (112)</span>
              </a>

              <button
                onClick={copyDistressMsg}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 border border-slate-700"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Signal!' : 'Copy Signal Text'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-extrabold text-emerald-400">EMERGENCY REPORT PRACTISED</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              In a real incident, call the site emergency control room or 112, follow the mine emergency plan, and do not rely on this app as a rescue system.
            </p>
            <div className="pt-2 flex justify-center space-x-2">
              <a
                href="tel:112"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Emergency (112)</span>
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 text-slate-200 rounded-xl text-xs font-bold"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
