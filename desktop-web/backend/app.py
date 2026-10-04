import os
import io
import json
import base64
import datetime
import random
import math
import sqlite3
import uuid
import qrcode
import asyncio
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse, Response
from pydantic import BaseModel, Field
from typing import Optional, List

from .database import get_db_connection, init_db, generate_cert_hash

init_db()

app = FastAPI(
    title="Khanan Suraksha Sathi API v2.2",
    description="AR-Based Vocational Training Simulator & DGMS Verifiable Passport Backend for Jharkhand Mining (SIH26041)",
    version="2.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "static")

# Pydantic Schemas
class WorkerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    worker_code: str = Field(min_length=1, max_length=64)
    mine_unit: str = Field(min_length=1, max_length=160)
    mine_district: str = Field(min_length=1, max_length=100)
    mine_type: str = Field(min_length=1, max_length=100)
    role: str = Field(min_length=1, max_length=100)
    language: str = Field(min_length=1, max_length=32)
    joined_date: str = Field(min_length=10, max_length=10)
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None

class DrillAttempt(BaseModel):
    worker_id: str = Field(min_length=1, max_length=64)
    module_id: str = Field(min_length=1, max_length=64)
    module_name: str = Field(min_length=1, max_length=160)
    score: int = Field(ge=0, le=100)
    reaction_time_ms: int = Field(ge=0)
    hazards_spotted: int = Field(ge=0)
    total_hazards: int = Field(ge=0)
    critical_errors: int = Field(ge=0)
    details: Optional[dict] = None

class GateVerifyRequest(BaseModel):
    qr_payload_or_code: str = Field(min_length=1, max_length=8192)
    gate_name: str = Field(min_length=1, max_length=160)
    inspector_name: str = Field(min_length=1, max_length=120)

class AdvisoryCreate(BaseModel):
    district: str
    mine_unit: str
    hazard_type: str
    severity: str
    title_hi: str
    title_sat: str
    title_en: str
    audio_text_hi: str
    audio_text_sat: str

class VoiceQuery(BaseModel):
    question: str
    language: str
    context_module: Optional[str] = "general"

class VoiceSynthesisRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    language: str = Field(min_length=1, max_length=32)
    fallback_text: Optional[str] = Field(default=None, max_length=4000)

# Edge neural voices provide reliable laptop narration when Windows has no
# installed Indian voice. Santali and Mundari do not currently have a public
# desktop neural voice, so their localized screen text is paired with the
# equivalent Hindi safety narration instead of failing silently.
LAPTOP_TTS_VOICES = {
    "hindi": "hi-IN-SwaraNeural",
    "bengali": "bn-IN-TanishaaNeural",
    "santhali": "hi-IN-SwaraNeural",
    "mundari": "hi-IN-SwaraNeural",
    "english": "en-IN-NeerjaNeural",
}

# QR Code Generation Helper
def create_qr_base64(data_dict: dict) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=6,
        border=2,
    )
    qr.add_data(json.dumps(data_dict))
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

# API Endpoints

# 1. Real-time Simulated IoT Gas Telemetry Endpoint (DGMS SCADA bridge)
@app.get("/api/telemetry/live-gas")
def get_live_gas_telemetry():
    """
    Simulated DGMS-compliant SCADA telemetry stream for Jharkhand underground collieries.
    Generates real-time fluctuating gas levels (CH4, CO, O2, ventilation velocity) for live demo.
    """
    now = datetime.datetime.now()
    seconds = now.second + (now.microsecond / 1_000_000.0)
    
    # Moonidih Colliery (Face 4B) - Fluctuating around caution threshold (0.9% - 1.4%)
    moonidih_ch4 = round(1.10 + 0.35 * math.sin(seconds * 0.25) + random.uniform(-0.05, 0.05), 2)
    moonidih_co = int(8 + 4 * math.sin(seconds * 0.15) + random.randint(-1, 2))
    moonidih_o2 = round(20.4 - 0.5 * math.sin(seconds * 0.2), 1)
    moonidih_airflow = round(42.5 + 2.0 * math.cos(seconds * 0.1), 1)
    
    # Jharia Katras Colliery - Normal safe range
    jharia_ch4 = round(0.35 + 0.10 * math.sin(seconds * 0.2), 2)
    jharia_co = 4
    jharia_o2 = 20.8
    jharia_airflow = 48.0

    # Bokaro Steel Blast Furnace #2 - Heavy Manufacturing CO tracking
    bokaro_co = int(24 + 8 * math.sin(seconds * 0.3) + random.randint(-2, 3))
    bokaro_o2 = 20.6

    alert_status = "NORMAL"
    active_alert = None

    if moonidih_ch4 >= 1.25:
        alert_status = "CRITICAL_ALERT"
        active_alert = {
            "mine": "Moonidih Underground Coal Mine (Face 4B)",
            "district": "Dhanbad",
            "type": "Methane (CH4) Threshold Exceeded (>1.25%)",
            "ch4": f"{moonidih_ch4}%",
            "action_mandate": "Mines Act 1952 Reg. 123: Cut off electrical power supply immediately & inspect ventilation brattice cloth.",
            "title_hi": f"गैस चेतावनी: फेस 4B में मीथेन {moonidih_ch4}% दर्ज! बिजली आपूर्ति बंद करें।",
            "title_sat": f"ᱜᱮᱥ ᱦᱩᱥᱤᱭᱟᱹᱨ: ᱯᱷᱮᱥ 4B ᱨᱮ ᱢᱤᱛᱷᱮᱱ {moonidih_ch4}%! ᱠᱟᱨᱮᱱᱴ ᱵᱚᱸᱫᱽ ᱢᱮ᱾"
        }
    elif moonidih_ch4 >= 0.8:
        alert_status = "WARNING"
        active_alert = {
            "mine": "Moonidih Underground Coal Mine (Face 4B)",
            "district": "Dhanbad",
            "type": "Elevated Methane Accumulation (0.8% - 1.2%)",
            "ch4": f"{moonidih_ch4}%",
            "action_mandate": "DGMS Circular 04: Continuous monitoring with methanometer. Ensure auxiliary fan is running.",
            "title_hi": f"सावधानी: फेस 4B में मीथेन {moonidih_ch4}% (निगरानी आवश्यक)",
            "title_sat": f"ᱦᱩᱥᱤᱭᱟᱹᱨ: ᱯᱷᱮᱥ 4B ᱨᱮ ᱢᱤᱛᱷᱮᱱ {moonidih_ch4}%"
        }

    return {
        "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
        "telemetry_source": "DGMS SCADA Telemetry Bridge (Simulated IoT)",
        "regulatory_standard": "Coal Mines Regulations 2017 Reg. 191",
        "status": alert_status,
        "active_alert": active_alert,
        "mines": [
            {
                "mine_id": "M-DHN-01",
                "name": "Moonidih Underground Coal Mine (Face 4B)",
                "district": "Dhanbad",
                "type": "Underground Coal (Degree III Gassy)",
                "ch4_pct": moonidih_ch4,
                "co_ppm": moonidih_co,
                "o2_pct": moonidih_o2,
                "airflow_m3_min": moonidih_airflow,
                "status": "CRITICAL" if moonidih_ch4 >= 1.25 else ("WARNING" if moonidih_ch4 >= 0.8 else "SAFE")
            },
            {
                "mine_id": "M-DHN-02",
                "name": "Jharia Katras Underground Colliery (Seam XI)",
                "district": "Dhanbad",
                "type": "Underground Coal",
                "ch4_pct": jharia_ch4,
                "co_ppm": jharia_co,
                "o2_pct": jharia_o2,
                "airflow_m3_min": jharia_airflow,
                "status": "SAFE"
            },
            {
                "mine_id": "M-BOK-01",
                "name": "Bokaro Steel Plant Blast Furnace #2",
                "district": "Bokaro",
                "type": "Heavy Steel Manufacturing",
                "ch4_pct": 0.02,
                "co_ppm": bokaro_co,
                "o2_pct": bokaro_o2,
                "airflow_m3_min": 65.0,
                "status": "WARNING" if bokaro_co >= 30 else "SAFE"
            }
        ]
    }

@app.get("/api/workers")
def list_workers(district: Optional[str] = None, high_risk: Optional[int] = None, search: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM workers WHERE 1=1"
    params = []
    
    if district and district != "All":
        query += " AND mine_district = ?"
        params.append(district)
    
    if high_risk is not None:
        query += " AND is_high_risk = ?"
        params.append(high_risk)
        
    if search:
        query += " AND (name LIKE ? OR worker_code LIKE ? OR role LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])
        
    query += " ORDER BY is_high_risk DESC, joined_date DESC"
    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"workers": rows, "count": len(rows)}

@app.get("/api/workers/{worker_id}")
def get_worker(worker_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM workers WHERE id = ? OR worker_code = ?", (worker_id, worker_id))
    worker = cursor.fetchone()
    if not worker:
        conn.close()
        raise HTTPException(status_code=404, detail="Worker not found")
        
    worker_data = dict(worker)
    
    # Get recent drill attempts
    cursor.execute("SELECT * FROM module_attempts WHERE worker_id = ? ORDER BY completed_at DESC", (worker_data["id"],))
    attempts = [dict(a) for a in cursor.fetchall()]
    
    # Get active certificate
    cursor.execute("SELECT * FROM certifications WHERE worker_id = ? AND status = 'VALID_VERIFIED' AND expiry_date >= ? ORDER BY issue_date DESC, rowid DESC LIMIT 1", (worker_data["id"], datetime.date.today().isoformat()))
    cert = cursor.fetchone()
    cert_data = dict(cert) if cert else None
    
    conn.close()
    return {
        "worker": worker_data,
        "attempts": attempts,
        "certification": cert_data
    }

@app.post("/api/workers")
def register_worker(worker: WorkerCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        joined = datetime.date.fromisoformat(worker.joined_date)
        days = (datetime.date.today() - joined).days
    except Exception:
        days = 0
    
    is_high_risk = 1 if days < 30 else 0
    # A timestamp-only ID collided whenever two registrations occurred in the
    # same minute. UUIDs keep the externally displayed worker code unchanged.
    new_id = f"W-JH-{uuid.uuid4().hex[:12].upper()}"

    try:
        cursor.execute("""
        INSERT INTO workers (id, name, worker_code, mine_unit, mine_district, mine_type, role, language, joined_date, experience_days, is_high_risk, phone, emergency_contact, safety_rating, total_drills_completed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0, 0)
        """, (new_id, worker.name, worker.worker_code, worker.mine_unit, worker.mine_district, worker.mine_type, worker.role, worker.language, worker.joined_date, max(days, 0), is_high_risk, worker.phone, worker.emergency_contact))
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=409, detail="A worker with this worker code already exists.")
    
    conn.commit()
    conn.close()
    return {"message": "Worker registered successfully", "id": new_id, "is_high_risk": bool(is_high_risk)}

@app.post("/api/drills/submit")
def submit_drill(drill: DrillAttempt):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM workers WHERE id = ?", (drill.worker_id,))
    worker = cursor.fetchone()
    if not worker:
        conn.close()
        raise HTTPException(status_code=404, detail="Worker not found")
    
    hazard_ratio = (drill.hazards_spotted / max(drill.total_hazards, 1)) * 100
    reaction_factor = max(0, 100 - (drill.reaction_time_ms / 100.0))
    raw_index = (0.4 * drill.score) + (0.35 * hazard_ratio) + (0.25 * reaction_factor) - (drill.critical_errors * 15)
    comprehension_index = round(max(0.0, min(100.0, raw_index)), 1)
    passed = 1 if drill.score >= 70 and drill.critical_errors == 0 else 0
    
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    details_str = json.dumps(drill.details or {})
    
    cursor.execute("""
    INSERT INTO module_attempts (worker_id, module_id, module_name, score, reaction_time_ms, hazards_spotted, total_hazards, critical_errors, passed, completed_at, comprehension_index, details_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (drill.worker_id, drill.module_id, drill.module_name, drill.score, drill.reaction_time_ms, drill.hazards_spotted, drill.total_hazards, drill.critical_errors, passed, now_str, comprehension_index, details_str))
    
    cursor.execute("SELECT AVG(comprehension_index), COUNT(id) FROM module_attempts WHERE worker_id = ?", (drill.worker_id,))
    avg_score, total_count = cursor.fetchone()
    
    cursor.execute("""
    UPDATE workers
    SET safety_rating = ?, total_drills_completed = ?
    WHERE id = ?
    """, (round(avg_score or drill.score, 1), total_count, drill.worker_id))
    
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "comprehension_index": comprehension_index,
        "passed": bool(passed),
        "message": "Drill recorded and safety rating updated."
    }

@app.post("/api/certifications/issue")
def issue_certification(payload: dict = Body(...)):
    worker_id = payload.get("worker_id")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM workers WHERE id = ?", (worker_id,))
    worker = cursor.fetchone()
    if not worker:
        conn.close()
        raise HTTPException(status_code=404, detail="Worker not found")
        
    worker_dict = dict(worker)
    
    cursor.execute("SELECT COUNT(DISTINCT module_id), AVG(comprehension_index) FROM module_attempts WHERE worker_id = ? AND passed = 1", (worker_id,))
    passed_modules, avg_comp = cursor.fetchone()
    
    if (passed_modules or 0) < 3:
        conn.close()
        return JSONResponse(
            status_code=400,
            content={"detail": f"Worker has only passed {passed_modules or 0} / 5 mandatory DGMS modules. At least 3 modules required for Digital Pass."}
        )
        
    today = datetime.date.today()
    cert_id = f"CERT-JH-{uuid.uuid4().hex[:12].upper()}"
    cert_num = f"DGMS/JH/{today.year}/{uuid.uuid4().hex[:10].upper()}"
    score = round(avg_comp or 85.0, 1)
    expiry = (today + datetime.timedelta(days=180)).isoformat()
    sig_hash = generate_cert_hash(worker_id, cert_num, score, today.isoformat())
    
    qr_data = {
        "cert": cert_num,
        "worker": worker_dict["name"],
        "code": worker_dict["worker_code"],
        "mine": worker_dict["mine_unit"],
        "district": worker_dict["mine_district"],
        "score": f"{score}%",
        "valid_until": expiry,
        "hash": sig_hash,
        "standard": "DGMS Circular No. 04 / Mines Act 1952 (Form B)",
        "status": "VERIFIED_COMPETENT"
    }
    
    qr_payload_str = json.dumps(qr_data)
    
    cursor.execute("""
    INSERT INTO certifications (id, worker_id, cert_number, standard, issue_date, expiry_date, overall_competency_score, status, signature_hash, dgms_officer, qr_payload)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        cert_id,
        worker_id,
        cert_num,
        "DGMS Circular No. 04 / Mines Act 1952 (Form B)",
        today.isoformat(),
        expiry,
        score,
        "VALID_VERIFIED",
        sig_hash,
        "Er. A.K. Sengupta (Dy. Director of Mines Safety, Dhanbad Region)",
        qr_payload_str
    ))
    
    conn.commit()
    conn.close()
    
    qr_base64 = create_qr_base64(qr_data)
    
    return {
        "certificate_id": cert_id,
        "cert_number": cert_num,
        "signature_hash": sig_hash,
        "score": score,
        "expiry_date": expiry,
        "qr_base64": qr_base64,
        "qr_data": qr_data
    }

@app.get("/api/certifications/{worker_id}")
def get_certification(worker_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT c.*, w.name, w.worker_code, w.mine_unit, w.mine_district, w.role, w.language, w.is_high_risk
    FROM certifications c
    JOIN workers w ON c.worker_id = w.id
    WHERE c.worker_id = ? AND c.status = 'VALID_VERIFIED' AND c.expiry_date >= ?
    ORDER BY c.issue_date DESC, c.rowid DESC LIMIT 1
    """, (worker_id, datetime.date.today().isoformat()))
    
    cert = cursor.fetchone()
    
    cursor.execute("""
    SELECT module_id, module_name, score, reaction_time_ms, passed, completed_at, comprehension_index
    FROM module_attempts
    WHERE worker_id = ?
    ORDER BY completed_at DESC
    """, (worker_id,))
    attempts = [dict(a) for a in cursor.fetchall()]
    
    conn.close()
    
    if not cert:
        return {"has_cert": False, "attempts": attempts, "message": "No active DGMS safety passport found."}
        
    cert_dict = dict(cert)
    qr_data = json.loads(cert_dict["qr_payload"])
    qr_base64 = create_qr_base64(qr_data)
    
    return {
        "has_cert": True,
        "certificate": cert_dict,
        "attempts": attempts,
        "qr_base64": qr_base64,
        "qr_data": qr_data
    }

@app.post("/api/gate/verify")
def verify_gate_entry(req: GateVerifyRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    target = req.qr_payload_or_code.strip()
    worker_id = None
    decoded_cert_data = None
    
    # Try parsing as JSON QR
    try:
        data = json.loads(target)
        decoded_cert_data = data
        worker_code = data.get("code")
        if worker_code:
            cursor.execute("SELECT id FROM workers WHERE worker_code = ?", (worker_code,))
            row = cursor.fetchone()
            if row:
                worker_id = row[0]
    except Exception:
        pass
        
    if not worker_id:
        cursor.execute("SELECT id FROM workers WHERE id = ? OR worker_code = ?", (target, target))
        row = cursor.fetchone()
        if row:
            worker_id = row[0]
            
    if not worker_id:
        conn.close()
        return {
            "access_granted": False,
            "status": "DENIED_UNKNOWN_ID",
            "message": "अमान्य पहचान पत्र / QR कोड! कार्यकर्ता रिकॉर्ड नहीं मिला। (Invalid QR / Worker Code)",
            "worker": None
        }
        
    cursor.execute("SELECT * FROM workers WHERE id = ?", (worker_id,))
    worker = dict(cursor.fetchone())
    
    # Check certification
    cursor.execute("SELECT * FROM certifications WHERE worker_id = ? AND status = 'VALID_VERIFIED' AND expiry_date >= ? ORDER BY issue_date DESC, rowid DESC LIMIT 1", (worker_id, datetime.date.today().isoformat()))
    cert = cursor.fetchone()
    
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    access_granted = 1
    reason = "DGMS AR Competency Verified. All Required Modules Certified."
    
    if not cert:
        access_granted = 0
        reason = "No valid, unexpired Safety Passport found / Mandatory AR Drills Pending"
    elif decoded_cert_data and (
        decoded_cert_data.get("cert") != cert["cert_number"]
        or decoded_cert_data.get("hash") != cert["signature_hash"]
        or decoded_cert_data.get("code") != worker["worker_code"]
    ):
        access_granted = 0
        reason = "QR certificate data does not match the verified Safety Passport"
    elif worker["is_high_risk"] == 1:
        reason = "GRANTED WITH HIGH-RISK PROTOCOL: New Recruit (<30 Days). Assign Senior Buddy Miner."
    
    cursor.execute("""
    INSERT INTO gate_scans (worker_id, gate_name, mine_unit, scan_time, access_granted, reason, inspector_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (worker_id, req.gate_name, worker["mine_unit"], now_str, access_granted, reason, req.inspector_name))
    
    conn.commit()
    conn.close()
    
    return {
        "access_granted": bool(access_granted),
        "status": "APPROVED" if access_granted else "DENIED",
        "reason": reason,
        "scan_time": now_str,
        "worker": worker,
        "is_high_risk": bool(worker["is_high_risk"]),
        "safety_rating": worker["safety_rating"],
        "decoded_cert": decoded_cert_data
    }

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM workers")
    total_workers = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM workers WHERE is_high_risk = 1")
    high_risk_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM certifications WHERE status = 'VALID_VERIFIED' AND expiry_date >= ?", (datetime.date.today().isoformat(),))
    certified_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(safety_rating) FROM workers WHERE safety_rating > 0")
    avg_safety_index = round(cursor.fetchone()[0] or 0.0, 1)
    
    cursor.execute("""
    SELECT mine_district, COUNT(*) as count, AVG(safety_rating) as avg_rating,
           SUM(is_high_risk) as high_risk_recruits
    FROM workers
    GROUP BY mine_district
    ORDER BY count DESC
    """)
    district_stats = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("""
    SELECT g.*, w.name, w.worker_code, w.role
    FROM gate_scans g
    JOIN workers w ON g.worker_id = w.id
    ORDER BY g.scan_time DESC LIMIT 10
    """)
    recent_scans = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("""
    SELECT * FROM workers WHERE is_high_risk = 1 ORDER BY joined_date DESC
    """)
    high_risk_workers = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    
    return {
        "summary": {
            "total_workers": total_workers,
            "high_risk_recruits": high_risk_count,
            "certified_workers": certified_count,
            "avg_safety_index": avg_safety_index,
            "compliance_rate": f"{round((certified_count / max(total_workers, 1)) * 100, 1)}%"
        },
        "districts": district_stats,
        "recent_scans": recent_scans,
        "high_risk_recruits": high_risk_workers
    }

@app.get("/api/advisories")
def get_advisories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM safety_advisories ORDER BY created_at DESC")
    advisories = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"advisories": advisories}

@app.post("/api/advisories")
def create_advisory(adv: AdvisoryCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute("""
    INSERT INTO safety_advisories (district, mine_unit, hazard_type, severity, title_hi, title_sat, title_en, audio_text_hi, audio_text_sat, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (adv.district, adv.mine_unit, adv.hazard_type, adv.severity, adv.title_hi, adv.title_sat, adv.title_en, adv.audio_text_hi, adv.audio_text_sat, now_str))
    
    conn.commit()
    conn.close()
    return {"message": "Safety advisory broadcasted successfully", "time": now_str}

@app.post("/api/voice/synthesize")
async def synthesize_laptop_voice(request: VoiceSynthesisRequest):
    """Return MP3 guidance for browsers whose local speech voices are incomplete."""
    try:
        import edge_tts
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="Laptop speech package is not installed.") from exc

    language = request.language.lower()
    voice = LAPTOP_TTS_VOICES.get(language, LAPTOP_TTS_VOICES["hindi"])
    # Use the corresponding Hindi safety instruction for Santali/Mundari until
    # a native desktop neural voice becomes available in the public catalogue.
    text = request.text
    if language in {"santhali", "mundari"} and request.fallback_text:
        text = request.fallback_text

    try:
        audio = bytearray()
        communicate = edge_tts.Communicate(text=text, voice=voice, rate="-8%")
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio.extend(chunk["data"])
        if not audio:
            raise RuntimeError("Voice provider returned no audio")
        return Response(content=bytes(audio), media_type="audio/mpeg", headers={"Cache-Control": "no-store"})
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Laptop voice service is temporarily unavailable.") from exc

@app.post("/api/voice-mentor/ask")
def voice_mentor_ask(query: VoiceQuery):
    q = query.question.lower()
    lang = query.language
    
    knowledge_base = {
        "roof": {
            "hi": "छत की सुरक्षा के लिए साउंडिंग रॉड से टैप करें। अगर ठक-ठक की ठोस खनकदार आवाज़ आए तो सुरक्षित है। अगर भारी या खोखली 'धम-धम' आवाज़ आए, तो तुरंत पीछे हटें और रूफ बोल्टिंग करवाएं। (DGMS Circular No. 12)",
            "sat": "ᱪᱷᱟᱛ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱞᱟᱹᱜᱤᱫ ᱥᱟᱣᱩᱱᱰᱤᱝ ᱨᱚᱰ ᱛᱮ ᱛᱷᱟᱹᱯᱟᱹᱭ ᱢᱮ᱾ ᱠᱷᱟᱹᱱᱠᱟᱹᱣ ᱥᱟᱰᱮ ᱠᱷᱟᱱ ᱴᱷᱤᱠ ᱜᱮᱭᱟ, ᱞᱤᱦᱩᱲ ᱥᱟᱰᱮ ᱠᱷᱟᱱ ᱯᱟᱹᱪᱷᱞᱟᱹᱜ ᱢᱮ᱾",
            "en": "For roof testing, tap the strata with a sounding rod. A clear metallic ring signifies safe rock, while a dull hollow thud indicates loose strata. Install roof bolts immediately as per DGMS guidelines."
            ,"bn": "ছাদ পরীক্ষা করতে সাউন্ডিং রড দিয়ে শিলাস্তরে টোকা দিন। পরিষ্কার ধাতব শব্দ নিরাপদ শিলা বোঝায়, আর ভোঁতা ফাঁপা শব্দ আলগা স্তর বোঝায়। DGMS নির্দেশিকা অনুযায়ী অবিলম্বে রুফ বোল্ট বসান।"
            ,"unr": "छत जाँचेक लेल साउंडिंग रड सँ चट्टान पर टपकाउ। साफ धातु सन आवाज सुरक्षित चट्टान बताय, मुदा भोथर खोखला आवाज ढीला परत बताय। DGMS नियम अनुसार तुरन्त रूफ बोल्ट लगाउ।"
        },
        "methane": {
            "hi": "मीथेन (CH4) हवा से हल्की होती है इसलिए छत के पास जमा होती है। अगर मीथेन 1.25% से ऊपर जाए तो बिजली आपूर्ति बंद कर दें। 2.0% पार होने पर तुरंत खदान खाली करें। (Mines Act 1952 Rule 123)",
            "sat": "ᱢᱤᱛᱷᱮᱱ ᱜᱮᱥ ᱪᱷᱟᱛ ᱥᱩᱨ ᱨᱮ ᱡᱟᱣᱨᱟᱜ-ᱟ᱾ 1.25% ᱠᱷᱚᱱ ᱵᱟᱹᱲᱛᱤ ᱠᱷᱟᱱ ᱠᱟᱨᱮᱱᱴ ᱵᱚᱸᱫᱽ ᱢᱮ, 2% ᱠᱷᱚᱱ ᱵᱟᱹᱲᱛᱤ ᱠᱷᱟᱱ ᱛᱩᱨᱚᱸᱛ ᱚᱰᱚᱠᱚᱜ ᱢᱮ᱾",
            "en": "Methane (CH4) accumulates near the roof. If it exceeds 1.25%, cut off electric power. If it exceeds 2.0%, immediately evacuate all personnel according to DGMS Coal Mines Regulations.",
            "bn": "মিথেন (CH4) ছাদের কাছে জমে। মাত্রা ১.২৫% ছাড়ালে বিদ্যুৎ সংযোগ বিচ্ছিন্ন করুন। ২.০% ছাড়ালে DGMS কয়লা খনি বিধি অনুযায়ী সবাইকে অবিলম্বে সরিয়ে নিন।",
            "unr": "मीथेन (CH4) छत लग जमा होय। 1.25% सँ बेसी होय त बिजली तुरन्त काटू। 2.0% सँ बेसी होय त DGMS कोयला खदान नियम अनुसार सबके तुरन्त बाहर निकालू।"
        },
        "loto": {
            "hi": "कन्वेयर बेल्ट या मशीनरी पर काम करने से पहले 6-स्टेप LOTO अपनाएं: मुख्य स्विच बंद करें, अपनी व्यक्तिगत लाल पैडलॉक लगाएं, डेंजर टैग लगाएं और ज़ीरो एनर्जी टेस्ट करें।",
            "sat": "ᱠᱚᱱᱵᱷᱮᱭᱟᱨ ᱵᱮᱞᱴ ᱥᱟᱯᱷᱟ ᱞᱟᱦᱟᱨᱮ ᱥᱩᱭᱤᱪ ᱵᱚᱸᱫᱽ ᱠᱟᱛᱮ ᱟᱯᱱᱟᱨ ᱛᱟᱞᱟ ᱟᱨ ᱴᱮᱜᱽ ᱞᱟᱜᱟᱣ ᱢᱮ᱾",
            "en": "Follow the 6-step LOTO procedure before conveyor maintenance: isolate the energy source, apply your personal red lockout padlock, attach danger tag, and verify zero kinetic energy.",
            "bn": "কনভেয়র মেরামতের আগে ৬ ধাপের LOTO পদ্ধতি অনুসরণ করুন: শক্তির উৎস বিচ্ছিন্ন করুন, নিজের লাল তালা লাগান, বিপদ ট্যাগ লাগান এবং শূন্য শক্তি পরীক্ষা করুন।",
            "unr": "कन्वेयर मरम्मत सँ पहिले 6-चरण LOTO अपनाउ: ऊर्जा स्रोत अलग करू, अपन लाल ताला लगाउ, खतरा टैग लगाउ आ शून्य ऊर्जा जाँचू।"
        },
        "dumper": {
            "hi": "100-टन डंपर ऑपरेटर के पास कई ब्लाइंड स्पॉट होते हैं। डंपर से कम से कम 10 मीटर की दूरी रखें। शुरू करने पर 1 हॉर्न, आगे बढ़ने पर 2 हॉर्न और पीछे आने पर 3 हॉर्न का DGMS कोड याद रखें।",
            "sat": "100-ᱴᱚᱱ ᱰᱟᱢᱯᱟᱨ ᱠᱷᱚᱱ 10 ᱢᱤᱴᱟᱨ ᱥᱟᱺᱜᱤᱧ ᱛᱟᱦᱮᱸᱱ ᱢᱮ᱾ ᱦᱚᱨᱱ ᱠᱳᱰ: 1-ᱮᱛᱚᱦᱚᱵ, 2-ᱞᱟᱦᱟ, 3-ᱯᱟᱹᱪᱷᱞᱟᱹ᱾",
            "en": "Maintain at least 10 meters distance from heavy dumpers. Remember the DGMS horn code: 1 blast to start engine, 2 blasts to move forward, 3 blasts before reversing.",
            "bn": "ভারী ডাম্পার থেকে অন্তত ১০ মিটার দূরে থাকুন। DGMS হর্ন সংকেত মনে রাখুন: ইঞ্জিন চালুতে ১ বার, সামনে চলতে ২ বার, পেছনে যাওয়ার আগে ৩ বার।",
            "unr": "भारी डम्पर सँ कम सँ कम 10 मीटर दूर रहू। DGMS हॉर्न संकेत याद राखू: इंजन चालू 1, आगू बढ़े 2, आ पाछू करे सँ पहिले 3 हॉर्न।"
        },
        "scsr": {
            "hi": "आपातकालीन आग या धुएं में SCSR को 60 सेकंड के भीतर पहनें: ढक्कन खोलें, माउथपीस मुंह में दबाएं, नोज़ क्लिप लगाएं, चश्मा पहनें और ऑक्सीजन वाल्व चालू करें।",
            "sat": "ᱫᱷᱩᱶᱟᱹ ᱚᱠᱛᱚ ᱨᱮ SCSR 60 ᱥᱮᱠᱮᱱᱰ ᱨᱮ ᱦᱚᱨᱚᱜ ᱢᱮ: ᱢᱚᱪᱟ ᱨᱮ ᱯᱟᱭᱤᱯ, ᱢᱩᱸ ᱨᱮ ᱠᱞᱤᱯ ᱟᱨ ᱪᱚᱥᱢᱟ ᱞᱟᱜᱟᱣ ᱢᱮ᱾",
            "en": "In smoke or toxic atmosphere, don your Self-Contained Self-Rescuer (SCSR) within 60 seconds: open case, insert mouthpiece, apply nose clip, wear goggles, and activate the starter oxygen.",
            "bn": "ধোঁয়া বা বিষাক্ত পরিবেশে ৬০ সেকেন্ডের মধ্যে SCSR পরুন: কেস খুলুন, মুখে মাউথপিস বসান, নোজ ক্লিপ লাগান, গগলস পরুন এবং অক্সিজেন স্টার্টার চালু করুন।",
            "unr": "धुआँ या जहरीला हवा में 60 सेकंड भीतर SCSR पहिरू: डिब्बा खोलू, मुँह में माउथपीस लगाउ, नाक क्लिप लगाउ, चश्मा पहिरू आ ऑक्सीजन चालू करू।"
        }
    }
    
    selected_topic = "roof"
    if "gas" in q or "methane" in q or "ch4" in q or "hawa" in q or "gair" in q:
        selected_topic = "methane"
    elif "lock" in q or "loto" in q or "belt" in q or "conveyor" in q or "switch" in q:
        selected_topic = "loto"
    elif "dumper" in q or "truck" in q or "blind" in q or "horn" in q or "gadi" in q:
        selected_topic = "dumper"
    elif "scsr" in q or "mask" in q or "dhuwa" in q or "smoke" in q or "oxygen" in q or "aag" in q:
        selected_topic = "scsr"
    
    response_text = knowledge_base[selected_topic].get(lang, knowledge_base[selected_topic]["hi"])
    
    return {
        "topic": selected_topic,
        "language": lang,
        "answer": response_text,
        "mentor_name": "सुरक्षा साथी (Suraksha Sathi)",
        "mentor_role": "DGMS Certified AI Safety Mentor"
    }

# Mount static files
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
