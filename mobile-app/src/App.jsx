import React, { useMemo, useState } from 'react';
import { Activity, Award, BookOpen, ClipboardCheck, LayoutDashboard, Menu, Radio, ShieldCheck, X } from 'lucide-react';
import ARSimulatorContainer from './components/ar/ARSimulatorContainer';
import AssessmentEngine from './components/assessment/AssessmentEngine';
import CertificateView from './components/certificate/CertificateView';
import AdminDashboard from './components/admin/AdminDashboard';
import FieldOperations from './components/operations/FieldOperations';
import LanguageSelector from './components/common/LanguageSelector';
import EmergencySosModal from './components/emergency/EmergencySosModal';
import QRVerifierModal from './components/certificate/QRVerifierModal';
import { saveWorkerEvaluation, saveTrainingProgress } from './utils/offlineStorage';

const workerSeed = {
  id: 'JHK-TRAINEE-001', name: 'Current trainee', language: 'hi', mineSector: 'Assigned training site',
  orientationDays: 0, score: 0, modulesCompleted: [], hasTemporaryKnowledgeRecord: false, localRecordId: null, certDate: null
};

const menu = [
  { id: 'home', label: 'Overview', icon: LayoutDashboard },
  { id: 'training', label: 'AR drills', icon: BookOpen },
  { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
  { id: 'records', label: 'Training record', icon: Award },
  { id: 'operations', label: 'Field reports', icon: Radio },
  { id: 'supervisor', label: 'Supervisor view', icon: Activity },
];

export default function App() {
  const [page, setPage] = useState('home');
  const [language, setLanguage] = useState('hi');
  const [worker, setWorker] = useState(workerSeed);
  const [evidence, setEvidence] = useState({});
  const [drawer, setDrawer] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const completed = worker.modulesCompleted || [];
  const assessmentUnlocked = ['Fire & Explosion Response', 'Gas Leak & Confined Space'].every(module => completed.includes(module));
  const progress = useMemo(() => Math.min(100, Math.round((completed.length / 2) * 100)), [completed.length]);

  const completeModule = (module, result) => {
    const labels = { fire: 'Fire & Explosion Response', gas: 'Gas Leak & Confined Space', machinery: 'Machinery LOTO' };
    const updated = saveTrainingProgress(worker, labels[module] || module, result);
    setWorker(updated);
    setEvidence(current => ({ ...current, [module]: result }));
  };
  const passAssessment = score => {
    setWorker(saveWorkerEvaluation({ ...worker, score, language, modulesCompleted: completed }));
    setPage('records');
  };

  const changePage = next => { setPage(next); setDrawer(false); };
  const sideNav = <nav className="space-y-1">{menu.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => changePage(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${page === id ? 'bg-[#1b2740] text-white shadow-lg shadow-slate-950/20' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon className="h-5 w-5" />{label}</button>)}</nav>;

  return (
    <div className="min-h-screen bg-[#eaf0f7] text-[#172033]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#101a2e] p-5 lg:flex">
        <div className="mb-10 flex items-center gap-3 px-2"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#27d8a5] text-[#0c1728]"><ShieldCheck className="h-6 w-6" /></span><div><p className="text-lg font-black tracking-tight text-white">RAKSHA 360</p><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7f9ac3]">Field safety platform</p></div></div>
        {sideNav}
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#8ea5c8]">Offline ready</p><p className="mt-1 text-xs leading-relaxed text-slate-300">Drill and report events stay on this device until an approved server accepts them.</p></div>
      </aside>

      {drawer && <div className="fixed inset-0 z-50 bg-slate-950/60 lg:hidden" onClick={() => setDrawer(false)}><aside className="h-full w-72 bg-[#101a2e] p-5" onClick={event => event.stopPropagation()}><div className="mb-8 flex items-center justify-between"><span className="font-black text-white">RAKSHA 360</span><button onClick={() => setDrawer(false)} className="text-white"><X /></button></div>{sideNav}</aside></div>}

      <main className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-[#d5e0ee] bg-[#f8fbff]/90 px-4 py-3 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3"><button onClick={() => setDrawer(true)} className="rounded-xl bg-white p-2 shadow-sm lg:hidden"><Menu className="h-5 w-5" /></button><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#55719e]">{menu.find(item => item.id === page)?.label}</p><p className="text-sm font-bold text-slate-700">{worker.mineSector}</p></div></div>
          <div className="flex items-center gap-2"><button onClick={() => setSosOpen(true)} className="rounded-xl bg-[#ff694f] px-3 py-2 text-xs font-black text-white shadow-sm">Emergency</button><LanguageSelector currentLang={language} onSelectLang={setLanguage} /></div>
        </header>

        <div className="mx-auto max-w-7xl p-4 sm:p-8">
          {page === 'home' && <Home progress={progress} completed={completed.length} onStart={() => changePage('training')} onReport={() => changePage('operations')} />}
          {page === 'training' && <ARSimulatorContainer currentLang={language} onModuleComplete={completeModule} assessmentUnlocked={assessmentUnlocked} onNavigateToQuiz={() => changePage('assessment')} />}
          {page === 'assessment' && (assessmentUnlocked ? <AssessmentEngine currentLang={language} completedModules={completed} practicalEvidence={evidence} onReturnToTraining={() => changePage('training')} onPassAssessment={passAssessment} /> : <LockedAssessment onStart={() => changePage('training')} />)}
          {page === 'records' && <CertificateView currentLang={language} activeWorker={worker} onOpenScanner={() => setVerifyOpen(true)} />}
          {page === 'operations' && <FieldOperations />}
          {page === 'supervisor' && <AdminDashboard currentLang={language} onOpenScanner={() => setVerifyOpen(true)} onViewWorkerCert={record => { setWorker(record); changePage('records'); }} />}
        </div>
      </main>
      <EmergencySosModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
      <QRVerifierModal isOpen={verifyOpen} onClose={() => setVerifyOpen(false)} />
    </div>
  );
}

function Home({ progress, completed, onStart, onReport }) {
  return <div className="space-y-6"><section className="overflow-hidden rounded-[28px] bg-[#16233b] p-6 text-white shadow-xl sm:p-10"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#27d8a5]">Shift-ready learning</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Practice the decision before the risk appears.</h1><p className="mt-4 max-w-xl text-sm leading-relaxed text-[#c6d4ea]">AR drills translate safety procedures into repeatable actions for mining and manufacturing teams, even when the network is unavailable.</p><button onClick={onStart} className="mt-7 rounded-xl bg-[#27d8a5] px-5 py-3 text-sm font-black text-[#102038]">Open AR drills</button></div></section><section className="grid gap-4 md:grid-cols-3"><Metric value={`${progress}%`} label="Required drills complete" note={`${completed} of 2 core drills`} /><Metric value="Offline" label="Record mode" note="Events queued on this device" /><Metric value="ARCore" label="Spatial practice" note="Available in supported Android APK" /></section><section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"><div className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="font-black">Your next actions</h2><div className="mt-4 space-y-3"><Action label="Fire & evacuation response" detail="Identify hazard, choose equipment and rehearse PASS." onClick={onStart} /><Action label="Gas leak and confined space" detail="Calibrate, select PPE, isolate and use buddy procedure." onClick={onStart} /><Action label="Report an unsafe condition" detail="Create an offline report for supervisor review." onClick={onReport} /></div></div><div className="rounded-3xl border border-[#d5e0ee] bg-[#f8fbff] p-6"><p className="text-xs font-black uppercase tracking-wider text-[#55719e]">Safety boundary</p><p className="mt-3 text-sm leading-relaxed text-slate-700">This app supports training and reporting. In a real emergency, follow site procedure and contact the responsible supervisor or emergency service.</p></div></section></div>;
}
const Metric = ({ value, label, note }) => <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-2xl font-black text-[#172e52]">{value}</p><p className="mt-1 text-sm font-bold">{label}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div>;
const Action = ({ label, detail, onClick }) => <button onClick={onClick} className="w-full rounded-2xl border border-[#e0e8f2] p-4 text-left transition hover:border-[#27d8a5] hover:bg-[#f5fffb]"><p className="font-bold">{label}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></button>;
const LockedAssessment = ({ onStart }) => <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm"><ClipboardCheck className="mx-auto h-10 w-10 text-[#ff694f]" /><h1 className="mt-4 text-2xl font-black">Complete two core drills first</h1><p className="mt-2 text-sm text-slate-600">Fire response and gas protocol practice unlock the knowledge assessment.</p><button onClick={onStart} className="mt-6 rounded-xl bg-[#172e52] px-5 py-3 text-sm font-black text-white">Go to AR drills</button></div>;
