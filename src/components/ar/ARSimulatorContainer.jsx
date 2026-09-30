import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, ChevronRight, Flame, ScanLine, ShieldAlert, Smartphone, Wind } from 'lucide-react';
import { fireScenario } from '../../domain/content/fire/fireScenario';
import { gasScenario } from '../../domain/content/gas/gasScenario';
import { createScenarioSession } from '../../domain/scenario/ScenarioState';
import { dispatchScenarioAction } from '../../domain/scenario/ScenarioEngine';
import { evaluateScenario } from '../../domain/scenario/ScenarioEvaluator';
import { getDisplayStep } from '../../domain/scenario/ScenarioDefinition';
import { PRACTICAL_COMPETENCY_POLICY } from '../../domain/competency/CompetencyPolicy';
import { isNativeArAvailable, SurakshaArBridge } from '../../native/SurakshaArBridge';

const drills = {
  fire: {
    scenario: fireScenario, name: 'Fire & evacuation', tag: 'FIRE', icon: Flame, color: '#ff694f', object: 'Fire scenario marker',
    markers: [{ label: 'FIRE', color: '#ff5b4d' }, { label: 'EXTINGUISHER', color: '#f3b534' }, { label: 'EXIT B', color: '#27d8a5' }],
    stages: [
      { state: 'INTRO', title: 'Choose the safe exit', prompt: 'Red = simulated fire. Green = Exit B. Which exit is safe?', choices: [{ label: 'Exit A', action: 'SELECT_EXIT', payload: { exit: 'A' }, wrong: true }, { label: 'Exit B', action: 'SELECT_EXIT', payload: { exit: 'B' } }] },
      { state: 'EXIT_B_SELECTED', title: 'Choose the extinguisher', prompt: 'For this simulated fire, choose the marked extinguisher.', choices: [{ label: 'Water extinguisher', action: 'SELECT_EXTINGUISHER', payload: { equipment: 'water' }, wrong: true }, { label: 'Dry powder extinguisher', action: 'SELECT_EXTINGUISHER', payload: { equipment: 'dcp' } }] },
      { state: 'EXTINGUISHER_SELECTED', title: 'Evacuate safely', prompt: 'After raising the alert, which route keeps you away from the simulated fire zone?', choices: [{ label: 'Return through hazard zone', action: 'FOLLOW_EVACUATION_ROUTE', payload: { route: 'hazard' }, wrong: true }, { label: 'Follow green Exit B route', action: 'FOLLOW_EVACUATION_ROUTE', payload: { route: 'B' } }] }
    ]
  },
  gas: {
    scenario: gasScenario, name: 'Gas leak response', tag: 'GAS', icon: Wind, color: '#e9a23b', object: 'Gas leak scenario marker',
    markers: [{ label: 'SIMULATED GAS LEAK', color: '#ff5b4d' }, { label: 'SAFE BOUNDARY', color: '#f3b534' }, { label: 'SAFE EXIT', color: '#27d8a5' }],
    stages: [
      { state: 'INTRO', title: 'Select PPE', prompt: 'The red marker represents a simulated gas leak. Select the required practice PPE.', choices: [{ label: 'Cloth mask', action: 'SELECT_PPE', payload: { ppe: 'cloth_mask' }, wrong: true }, { label: 'Approved respiratory PPE', action: 'SELECT_PPE', payload: { ppe: 'scba' } }] },
      { state: 'PPE_READY', title: 'Maintain distance', prompt: 'Choose your position relative to the yellow safe-boundary marker.', choices: [{ label: 'Move closer to the pipe', action: 'MOVE_TO_SAFE_BOUNDARY', payload: { boundary: 'near_pipe' }, wrong: true }, { label: 'Stay behind safe boundary', action: 'MOVE_TO_SAFE_BOUNDARY', payload: { boundary: 'safe' } }] },
      { state: 'SAFE_DISTANCE', title: 'Use the buddy system', prompt: 'Before any further action, what must you do?', choices: [{ label: 'Continue alone', action: 'ALERT_BUDDY', payload: { buddy: 'none' }, wrong: true }, { label: 'Alert buddy', action: 'ALERT_BUDDY', payload: { buddy: 'alerted' } }] },
      { state: 'BUDDY_ALERTED', title: 'Follow safe exit', prompt: 'Leave through the route marked green.', choices: [{ label: 'Cross hazard area', action: 'FOLLOW_SAFE_EXIT', payload: { exit: 'hazard' }, wrong: true }, { label: 'Follow green safe exit', action: 'FOLLOW_SAFE_EXIT', payload: { exit: 'safe' } }] }
    ]
  }
};

export default function ARSimulatorContainer({ currentLang = 'hi', onModuleComplete, onNavigateToQuiz }) {
  const [selected, setSelected] = useState('fire');
  const [session, setSession] = useState(() => createScenarioSession(fireScenario, { attempt: 1, startedAt: Date.now() }));
  const [message, setMessage] = useState('Choose a drill, scan a flat surface, then place the real-space scenario markers.');
  const [nativeState, setNativeState] = useState('READY');
  const [nativeResult, setNativeResult] = useState(null);
  const [choiceOrder, setChoiceOrder] = useState([]);
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef(null);
  const drill = drills[selected];
  const Icon = drill.icon;
  const stage = drill.stages.find(item => item.state === session.state);
  const step = getDisplayStep(drill.scenario, session.state);
  const invalidCount = session.events.filter(event => event.outcome === 'INVALID_SEQUENCE').length;
  const score = Math.max(0, 100 - (invalidCount * 10));
  const result = nativeResult?.module === selected ? nativeResult : null;

  useEffect(() => {
    if (!stage) { setChoiceOrder([]); return; }
    setChoiceOrder([...stage.choices].sort(() => Math.random() - 0.5).map(choice => choice.label));
  }, [selected, session.state]);

  useEffect(() => {
    if (!isNativeArAvailable()) return undefined;
    let listener;
    SurakshaArBridge.addListener(event => {
      if (event.type === 'AR_TRACKING_STATE_CHANGED') setNativeState(event.state || 'READY');
      if (event.type === 'AR_OBJECT_ANCHORED') setMessage('Scenario markers anchored. Read the labels in AR and make your decision in the panel.');
      if (event.type === 'AR_OBJECT_TAPPED') setMessage('Scenario marker selected. Continue with the required decision.');
      if (event.type === 'AR_DRILL_COMPLETED') {
        const completed = { module: event.module, score: Number(event.score || 0), passed: Boolean(event.passed) };
        setNativeResult(completed);
        setMessage(completed.passed ? `Native AR drill complete — Safety Score ${completed.score}%.` : `Native AR drill finished — Safety Score ${completed.score}%. Review and retry.`);
        if (completed.passed) onModuleComplete?.(event.module, { source: 'native-ar', status: 'COMPLETED', score: completed.score });
      }
    }).then(value => { listener = value; }).catch(() => setNativeState('UNAVAILABLE'));
    return () => listener?.remove();
  }, [onModuleComplete]);

  useEffect(() => () => videoRef.current?.srcObject?.getTracks().forEach(track => track.stop()), []);

  const selectDrill = id => {
    setSelected(id);
    setSession(createScenarioSession(drills[id].scenario, { attempt: 1, startedAt: Date.now() }));
    setNativeResult(null);
    setMessage('Scan a flat surface, place the scenario markers, then answer the safety choices.');
  };

  const doAction = choice => {
    const outcome = dispatchScenarioAction(drill.scenario, session, { type: choice.action, payload: choice.payload, timestamp: Date.now() });
    setSession(outcome.session);
    setMessage(outcome.feedback);
    if (outcome.justCompleted) {
      const finalScore = Math.max(0, 100 - (outcome.session.events.filter(event => event.outcome === 'INVALID_SEQUENCE').length * 10));
      const passedDrill = finalScore >= PRACTICAL_COMPETENCY_POLICY.knowledgePassPercentage;
      setNativeResult({ module: selected, score: finalScore, passed: passedDrill });
      if (passedDrill) onModuleComplete?.(selected, { ...evaluateScenario(drill.scenario, outcome.session), score: finalScore, status: 'PASS', passed: true });
    }
  };

  const enableCamera = async () => {
    if (cameraMode) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      if (!videoRef.current) throw new Error('Camera preview is not ready.');
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraMode(true);
      setCameraError(false);
      setMessage('Camera preview active. Use “Start real-space drill” in the installed APK for anchored AR markers.');
    } catch {
      setCameraError(true);
      setMessage('Camera access failed. Allow camera permission, then try again.');
    }
  };

  const launchNative = async () => {
    if (!isNativeArAvailable()) return setMessage('Install and open the Android APK on an ARCore-supported phone for real-space markers.');
    try {
      setNativeState('INITIALIZING');
      await SurakshaArBridge.startAR({ module: selected, objectLabel: drill.object, language: currentLang });
    } catch {
      setNativeState('ERROR');
      setMessage('ARCore could not start. Continue with the guided visual practice mode.');
    }
  };

  const completed = session.status === 'COMPLETED' || result;
  const displayScore = result?.score ?? score;
  const passed = result?.passed ?? displayScore >= PRACTICAL_COMPETENCY_POLICY.knowledgePassPercentage;

  return <div className="space-y-5">
    <section className="overflow-hidden rounded-[28px] bg-[#101a2e] p-2 shadow-xl"><div className="grid gap-2 md:grid-cols-3">{Object.entries(drills).map(([id, item]) => {
      const DrillIcon = item.icon; const active = selected === id;
      return <button key={id} onClick={() => selectDrill(id)} className={`flex items-center gap-3 rounded-2xl p-4 text-left transition ${active ? 'bg-white text-[#101a2e]' : 'text-[#b8c8e2] hover:bg-white/10'}`}><span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: active ? `${item.color}22` : '#ffffff12', color: item.color }}><DrillIcon className="h-5 w-5" /></span><span><span className="block text-[10px] font-black tracking-[0.16em]" style={{ color: item.color }}>{item.tag}</span><span className="block text-sm font-black">{item.name}</span></span></button>;
    })}</div></section>
    <div className="grid gap-5 xl:grid-cols-[1.45fr_.85fr]">
      <section className="relative min-h-[500px] overflow-hidden rounded-[28px] bg-[#101a2e] shadow-xl">
        <video ref={videoRef} autoPlay muted playsInline className={`absolute inset-0 h-full w-full object-cover transition-opacity ${cameraMode ? 'opacity-70' : 'pointer-events-none opacity-0'}`} />
        {!cameraMode && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#25436c,transparent_35%),linear-gradient(135deg,#101a2e,#182945)]" />}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#ffffff10 1px,transparent 1px),linear-gradient(90deg,#ffffff10 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="relative flex h-full min-h-[500px] flex-col justify-between p-5 sm:p-7">
          <div className="flex items-start justify-between"><span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white">Native AR · {nativeState}</span><Camera className="h-5 w-5 text-white" /></div>
          <div className="mx-auto max-w-sm rounded-2xl border border-white/15 bg-[#0d1729]/80 p-4 text-center backdrop-blur"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b8c8e2]">{selected === 'gas' ? 'Gas leak scenario' : selected === 'fire' ? 'Fire & evacuation scenario' : 'Practice marker'}</p><div className="mt-3 flex flex-wrap justify-center gap-2">{drill.markers.map(marker => <span key={marker.label} className="rounded-full px-3 py-1.5 text-[10px] font-black text-[#101a2e]" style={{ background: marker.color }}>{marker.label}</span>)}</div><p className="mt-3 text-xs leading-relaxed text-[#d8e4f7]">In the Android AR view these are anchored to the surface you tap. This browser camera view is only a visual fallback.</p></div>
          <div className="rounded-2xl border border-white/15 bg-[#0d1729]/85 p-4 backdrop-blur"><div className="flex gap-3"><ScanLine className="mt-0.5 h-5 w-5 shrink-0 text-[#27d8a5]" /><div><p className="text-xs font-black text-white">{drill.object}</p><p className="mt-1 text-xs leading-relaxed text-[#b8c8e2]">{message}</p></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><button onClick={enableCamera} className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-black text-white"><Camera className="h-4 w-4" />{cameraMode ? 'Camera preview active' : 'Enable camera preview'}</button><button onClick={launchNative} className="flex items-center justify-center gap-2 rounded-xl bg-[#27d8a5] px-4 py-3 text-sm font-black text-[#0d1729]"><Smartphone className="h-4 w-4" />Start real-space drill</button></div></div>
        </div>
        {cameraError && <p className="absolute left-5 top-16 rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900">Camera unavailable. Allow camera permission and retry.</p>}
      </section>
      <section className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#55719e]">Decision assessment</p><h1 className="mt-1 text-xl font-black">{completed ? 'Practice result' : `Step ${step} of ${drill.stages.length || 1}`}</h1></div><span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${drill.color}22`, color: drill.color }}><Icon className="h-5 w-5" /></span></div>
        {!completed && stage && <><div className="mt-5 rounded-2xl bg-[#edf4ff] p-4"><p className="font-black text-[#172e52]">{stage.title}</p><p className="mt-2 text-sm leading-relaxed text-slate-600">{stage.prompt}</p></div><div className="mt-4 space-y-2">{choiceOrder.map(label => stage.choices.find(choice => choice.label === label)).filter(Boolean).map(choice => <button key={choice.label} onClick={() => doAction(choice)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left text-sm font-black text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"><span>{choice.label}</span><ChevronRight className="h-5 w-5" /></button>)}</div></>}
        {completed && <div className={`mt-6 rounded-2xl p-5 ${passed ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}><div className="flex gap-3"><Check className="h-6 w-6 shrink-0" /><div><p className="font-black">Safety Score: {displayScore}% — {passed ? 'PASS' : 'RETRY REQUIRED'}</p><p className="mt-2 text-sm leading-relaxed">{passed ? 'Practice evidence is saved on this device. Complete both drills and the knowledge assessment to create the QR-verifiable training record.' : 'Review the incorrect decision and run the drill again.'}</p></div></div></div>}
        <div className="mt-6 border-t border-slate-100 pt-5"><p className="text-xs font-bold text-slate-500">CURRENT SCORE</p><p className="mt-1 text-3xl font-black text-[#172e52]">{displayScore}%</p></div>
        {completed && passed && <button onClick={onNavigateToQuiz} className="mt-4 w-full rounded-xl border border-[#172e52] px-4 py-3 text-sm font-black text-[#172e52]">Open knowledge assessment</button>}
        <p className="mt-5 flex gap-2 text-[11px] leading-relaxed text-slate-500"><ShieldAlert className="h-4 w-4 shrink-0 text-[#ff694f]" />Training simulation only. The app does not detect real gas, fire, exits, or site-safe distances. Follow approved site procedure and supervisor direction in a real event.</p>
      </section>
    </div>
  </div>;
}
