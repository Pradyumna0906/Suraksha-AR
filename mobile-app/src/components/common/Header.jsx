import React, { useEffect, useState } from 'react';
import { Award, BookOpen, ClipboardCheck, LayoutDashboard, ShieldCheck, Signal, WifiOff, Radio } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const navigation = [
  { id: 'ar', label: 'Practice', icon: BookOpen },
  { id: 'assessment', label: 'Knowledge check', icon: ClipboardCheck },
  { id: 'certificate', label: 'My certificate', icon: Award },
  { id: 'operations', label: 'Field operations', icon: Radio },
  { id: 'admin', label: 'Supervisor', icon: LayoutDashboard },
];

export default function Header({ currentLang, onSelectLang, activeTab, setActiveTab, onOpenSos }) {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#fffdf8]/95 text-stone-900 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button onClick={() => setActiveTab('ar')} className="flex items-center gap-3 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c64b2d] text-white shadow-sm"><ShieldCheck className="h-6 w-6" /></span>
          <span><span className="block text-base font-black tracking-tight">RAKSHA 360</span><span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">Safety practice and field reporting</span></span>
        </button>
        <div className="flex items-center gap-2">
          <span className={`hidden items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold sm:flex ${online ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{online ? <Signal className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}{online ? 'SYNC READY' : 'OFFLINE RECORDS'}</span>
          <LanguageSelector currentLang={currentLang} onSelectLang={onSelectLang} />
          <button onClick={onOpenSos} className="rounded-xl bg-stone-900 px-3 py-2 text-[11px] font-black text-white transition hover:bg-[#c64b2d]">Emergency drill</button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
        {navigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={`flex min-h-10 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-xs font-bold transition ${activeTab === id ? 'bg-[#f4e3d4] text-[#9b351f]' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'}`}><Icon className="h-4 w-4" /> {label}</button>)}
      </nav>
    </header>
  );
}
