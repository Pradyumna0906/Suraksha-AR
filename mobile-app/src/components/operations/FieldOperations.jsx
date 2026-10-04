import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, MapPin, Radio, Send, ShieldAlert, WifiOff } from 'lucide-react';
import { appendOperationalEvent, getOperationalEvents, getPendingSyncEvents } from '../../utils/operationalLedger';

const checklist = [
  'I received today’s site safety briefing.',
  'My supervisor identified the approved work zone and escape route.',
  'Required PPE has been physically checked under site procedure.',
  'I know how to report a hazard, near miss, or emergency.'
];

export default function FieldOperations() {
  const [checked, setChecked] = useState([]);
  const [location, setLocation] = useState('');
  const [hazard, setHazard] = useState('');
  const [severity, setSeverity] = useState('Near miss');
  const [submitted, setSubmitted] = useState(false);
  const [revision, setRevision] = useState(0);
  const pending = useMemo(() => getPendingSyncEvents().length, [revision]);
  const events = useMemo(() => getOperationalEvents().slice(-4).reverse(), [revision]);

  const completeBriefing = () => {
    appendOperationalEvent('SHIFT_BRIEFING_ACKNOWLEDGED', { completedItems: checked.length, totalItems: checklist.length });
    setRevision(value => value + 1);
  };

  const submitReport = (event) => {
    event.preventDefault();
    if (!location.trim() || !hazard.trim()) return;
    appendOperationalEvent('HAZARD_OR_NEAR_MISS_REPORTED', { location: location.trim(), severity, description: hazard.trim(), requiresSupervisorReview: true });
    setSubmitted(true);
    setLocation('');
    setHazard('');
    setRevision(value => value + 1);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 py-2">
      <section className="rounded-2xl border border-[#e6d5c4] bg-[#fffaf4] p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#a2472c]">Field operations</p><h1 className="mt-1 text-2xl font-black text-stone-900">Report hazards before they become incidents.</h1><p className="mt-1 max-w-2xl text-sm text-stone-600">This creates a time-stamped local report for supervisor review. It does not contact emergency services or authorise work.</p></div>
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"><WifiOff className="h-4 w-4" /> {pending} waiting to sync</span>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-[#c64b2d]" /><h2 className="font-black text-stone-900">Pre-shift acknowledgement</h2></div>
          <div className="mt-4 space-y-3">
            {checklist.map((item, index) => <label key={item} className="flex cursor-pointer gap-3 rounded-xl border border-stone-200 p-3 text-sm text-stone-700"><input type="checkbox" checked={checked.includes(index)} onChange={() => setChecked(current => current.includes(index) ? current.filter(value => value !== index) : [...current, index])} className="mt-0.5 h-4 w-4 accent-[#c64b2d]" />{item}</label>)}
          </div>
          <button onClick={completeBriefing} disabled={checked.length !== checklist.length} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"><CheckCircle2 className="h-4 w-4" />Record acknowledgement</button>
        </section>

        <section className="rounded-2xl border border-[#f0c7ba] bg-[#fff8f5] p-5 shadow-sm">
          <div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-[#c64b2d]" /><h2 className="font-black text-stone-900">Hazard or near-miss report</h2></div>
          <form onSubmit={submitReport} className="mt-4 space-y-3">
            <label className="block text-xs font-bold text-stone-700">Work area<input value={location} onChange={event => setLocation(event.target.value)} placeholder="e.g. Conveyor B, Level 2" className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#c64b2d]" /></label>
            <label className="block text-xs font-bold text-stone-700">Report type<select value={severity} onChange={event => setSeverity(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm"><option>Near miss</option><option>Unsafe condition</option><option>Equipment concern</option></select></label>
            <label className="block text-xs font-bold text-stone-700">What did you observe?<textarea value={hazard} onChange={event => setHazard(event.target.value)} rows="3" placeholder="Describe the condition. Do not enter personal medical details." className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#c64b2d]" /></label>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c64b2d] px-4 py-3 text-sm font-black text-white"><Send className="h-4 w-4" />Save report for supervisor review</button>
          </form>
          {submitted && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800">Report saved locally. It remains pending until a connected, authenticated server acknowledges it.</p>}
          <p className="mt-4 flex gap-2 text-[11px] text-stone-600"><AlertTriangle className="h-4 w-4 shrink-0 text-[#c64b2d]" />For an immediate danger or injury, follow the site emergency procedure and contact the responsible supervisor or emergency service now.</p>
        </section>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Radio className="h-5 w-5 text-[#a2472c]" /><h2 className="font-black text-stone-900">Local activity trail</h2></div><div className="mt-3 divide-y divide-stone-100">{events.length ? events.map(event => <div key={event.id} className="flex items-center justify-between gap-4 py-3 text-xs"><span className="font-bold text-stone-700">{event.type.replaceAll('_', ' ')}</span><span className="text-stone-500">{new Date(event.recordedAt).toLocaleString()}</span></div>) : <p className="py-3 text-sm text-stone-500">No field records on this device yet.</p>}</div></section>
    </div>
  );
}
