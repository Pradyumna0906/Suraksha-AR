import sqlite3
import hashlib
import json
import datetime
import os

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "khanan_suraksha.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def generate_cert_hash(worker_id: str, cert_number: str, score: float, date_issued: str) -> str:
    salt = "DGMS_DHANBAD_JHARKHAND_SAFETY_2026"
    raw = f"{worker_id}:{cert_number}:{score}:{date_issued}:{salt}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Workers Table (Tribal / Contract Recruits)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        worker_code TEXT UNIQUE NOT NULL,
        mine_unit TEXT NOT NULL,
        mine_district TEXT NOT NULL,
        mine_type TEXT NOT NULL,
        role TEXT NOT NULL,
        language TEXT NOT NULL,
        joined_date TEXT NOT NULL,
        experience_days INTEGER NOT NULL,
        is_high_risk INTEGER NOT NULL,
        phone TEXT,
        emergency_contact TEXT,
        safety_rating REAL DEFAULT 0.0,
        total_drills_completed INTEGER DEFAULT 0
    )
    """)

    # 2. Module Attempts History Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS module_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        worker_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        module_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        reaction_time_ms INTEGER NOT NULL,
        hazards_spotted INTEGER NOT NULL,
        total_hazards INTEGER NOT NULL,
        critical_errors INTEGER NOT NULL,
        passed INTEGER NOT NULL,
        completed_at TEXT NOT NULL,
        comprehension_index REAL NOT NULL,
        details_json TEXT,
        FOREIGN KEY (worker_id) REFERENCES workers (id)
    )
    """)

    # 3. DGMS Verifiable Certifications (Form B Compliance)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS certifications (
        id TEXT PRIMARY KEY,
        worker_id TEXT NOT NULL,
        cert_number TEXT UNIQUE NOT NULL,
        standard TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        expiry_date TEXT NOT NULL,
        overall_competency_score REAL NOT NULL,
        status TEXT NOT NULL,
        signature_hash TEXT NOT NULL,
        dgms_officer TEXT NOT NULL,
        qr_payload TEXT NOT NULL,
        FOREIGN KEY (worker_id) REFERENCES workers (id)
    )
    """)

    # 4. Pithead Gate Scan Audit Log Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gate_scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        worker_id TEXT NOT NULL,
        gate_name TEXT NOT NULL,
        mine_unit TEXT NOT NULL,
        scan_time TEXT NOT NULL,
        access_granted INTEGER NOT NULL,
        reason TEXT NOT NULL,
        inspector_name TEXT NOT NULL,
        FOREIGN KEY (worker_id) REFERENCES workers (id)
    )
    """)

    # 5. Live Safety Advisories & Alert Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS safety_advisories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        district TEXT NOT NULL,
        mine_unit TEXT NOT NULL,
        hazard_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        title_hi TEXT NOT NULL,
        title_sat TEXT NOT NULL,
        title_en TEXT NOT NULL,
        audio_text_hi TEXT,
        audio_text_sat TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # Seed initial demographic dataset if empty
    cursor.execute("SELECT COUNT(*) FROM workers")
    if cursor.fetchone()[0] == 0:
        seed_data(cursor)

    conn.commit()
    conn.close()

def seed_data(cursor):
    today = datetime.date.today()
    d12 = (today - datetime.timedelta(days=12)).isoformat()
    d8 = (today - datetime.timedelta(days=8)).isoformat()
    d180 = (today - datetime.timedelta(days=180)).isoformat()
    d22 = (today - datetime.timedelta(days=22)).isoformat()
    d5 = (today - datetime.timedelta(days=5)).isoformat()
    d3 = (today - datetime.timedelta(days=3)).isoformat()
    d420 = (today - datetime.timedelta(days=420)).isoformat()

    workers = [
        ("W-JH-0101", "Birsa Soren", "BCCL-JH-7821", "Moonidih Underground Colliery", "Dhanbad", "Underground Coal", "Face Loader", "santhali", d12, 12, 1, "+91 94311 02841", "+91 98351 90214", 88.5, 3),
        ("W-JH-0102", "Mangal Hembrom", "ECL-JH-2311", "Rajmahal Opencast Coal Project", "Godda", "Opencast Coal", "Excavator Helper", "santhali", d8, 8, 1, "+91 94313 88122", "+91 94711 77301", 82.0, 2),
        ("W-JH-0103", "Sunil Munda", "TISCO-JH-4419", "Noamundi Iron Ore Mine", "Chaibasa (West Singhbhum)", "Opencast Metal", "Drill Rig Operator", "mundari", d22, 22, 1, "+91 94301 55678", "+91 98012 33490", 79.5, 2),
        ("W-JH-0104", "Anita Murmu", "CCL-JH-6671", "Piparwar Coal Washery", "Chatra", "Coal Processing & Washery", "Conveyor Operator", "santhali", d180, 180, 0, "+91 94315 22009", "+91 98355 44102", 96.0, 5),
        ("W-JH-0105", "Ramesh Mahato", "SAIL-JH-9012", "Bokaro Steel Plant (SMS-II)", "Bokaro", "Heavy Manufacturing / Steel", "Crane Signalman", "hindi", d5, 5, 1, "+91 94317 66100", "+91 98011 88902", 74.0, 1),
        ("W-JH-0106", "Sukhram Ho", "HCL-JH-3301", "Surda Underground Copper Mine", "Ghatsila (East Singhbhum)", "Underground Metal", "Roof Bolter", "hindi", d3, 3, 1, "+91 94319 44811", "+91 98350 11992", 65.0, 1),
        ("W-JH-0107", "Durgacharan Tudu", "BCCL-JH-8833", "Jharia Katras Colliery", "Dhanbad", "Underground Coal", "Shot Firer Helper", "santhali", d420, 420, 0, "+91 94311 99281", "+91 98010 33110", 94.5, 5)
    ]

    cursor.executemany("""
    INSERT INTO workers (id, name, worker_code, mine_unit, mine_district, mine_type, role, language, joined_date, experience_days, is_high_risk, phone, emergency_contact, safety_rating, total_drills_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, workers)

    # Seed verified drill history for certified workers
    attempts = [
        ("W-JH-0104", "roof_strata", "Roof Strata & Sounding", 95, 1420, 6, 6, 0, 1, d180, 96.2, '{"sounding_spots_checked":6,"bolts_installed":3}'),
        ("W-JH-0104", "gas_detector", "Multi-Gas & Methane Safety", 98, 1200, 3, 3, 0, 1, d180, 97.5, '{"methane_cutoff":true,"ventilation_curtain":true}'),
        ("W-JH-0104", "loto_drill", "Conveyor LOTO Protocol", 100, 980, 4, 4, 0, 1, d180, 98.8, '{"lock_applied":true,"zero_energy_tested":true}'),
        ("W-JH-0104", "dumper_blindspot", "100T Dumper Blind Spot", 92, 1600, 3, 3, 0, 1, d180, 93.0, '{"safe_distance_maintained":true,"horn_codes_verified":true}'),
        ("W-JH-0101", "roof_strata", "Roof Strata & Sounding", 92, 1580, 6, 6, 0, 1, d12, 91.5, '{"sounding_spots_checked":6,"bolts_installed":3}'),
        ("W-JH-0101", "gas_detector", "Multi-Gas & Methane Safety", 88, 1850, 3, 3, 0, 1, d12, 87.0, '{"methane_cutoff":true}'),
        ("W-JH-0101", "scsr_donning", "SCSR 60s Escape Drill", 86, 52000, 4, 4, 0, 1, d12, 87.0, '{"mouthpiece_donned":true,"starter_oxygen_fired":true}')
    ]

    cursor.executemany("""
    INSERT INTO module_attempts (worker_id, module_id, module_name, score, reaction_time_ms, hazards_spotted, total_hazards, critical_errors, passed, completed_at, comprehension_index, details_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, attempts)

    # Issue Initial DGMS Certificate for Anita Murmu
    cert_id = "CERT-JH-2026-0041"
    cert_num = "DGMS/DHN/2026/08821"
    expiry = (today + datetime.timedelta(days=180)).isoformat()
    sig_hash = generate_cert_hash("W-JH-0104", cert_num, 96.0, d180)
    qr_payload = {
        "cert": cert_num,
        "worker": "Anita Murmu",
        "code": "CCL-JH-6671",
        "mine": "Piparwar Coal Washery",
        "district": "Chatra",
        "score": "96.0%",
        "valid_until": expiry,
        "hash": sig_hash,
        "standard": "DGMS Circular No. 04 / Mines Act 1952 (Form B)",
        "status": "VERIFIED_COMPETENT"
    }

    cursor.execute("""
    INSERT INTO certifications (id, worker_id, cert_number, standard, issue_date, expiry_date, overall_competency_score, status, signature_hash, dgms_officer, qr_payload)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        cert_id,
        "W-JH-0104",
        cert_num,
        "DGMS Circular No. 04 / Mines Act 1952 (Form B)",
        d180,
        expiry,
        96.0,
        "VALID_VERIFIED",
        sig_hash,
        "Er. A.K. Sengupta (Dy. Director of Mines Safety, Dhanbad Region)",
        json.dumps(qr_payload)
    ))

    # Issue Initial Certificate for Birsa Soren
    cert_id_2 = "CERT-JH-2026-0042"
    cert_num_2 = "DGMS/DHN/2026/09934"
    sig_hash_2 = generate_cert_hash("W-JH-0101", cert_num_2, 88.5, d12)
    qr_payload_2 = {
        "cert": cert_num_2,
        "worker": "Birsa Soren",
        "code": "BCCL-JH-7821",
        "mine": "Moonidih Underground Colliery",
        "district": "Dhanbad",
        "score": "88.5%",
        "valid_until": expiry,
        "hash": sig_hash_2,
        "standard": "DGMS Circular No. 04 / Mines Act 1952 (Form B)",
        "status": "VERIFIED_COMPETENT"
    }

    cursor.execute("""
    INSERT INTO certifications (id, worker_id, cert_number, standard, issue_date, expiry_date, overall_competency_score, status, signature_hash, dgms_officer, qr_payload)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        cert_id_2,
        "W-JH-0101",
        cert_num_2,
        "DGMS Circular No. 04 / Mines Act 1952 (Form B)",
        d12,
        expiry,
        88.5,
        "VALID_VERIFIED",
        sig_hash_2,
        "Er. A.K. Sengupta (Dy. Director of Mines Safety, Dhanbad Region)",
        json.dumps(qr_payload_2)
    ))

    # Initial Gate Scan Record
    cursor.execute("""
    INSERT INTO gate_scans (worker_id, gate_name, mine_unit, scan_time, access_granted, reason, inspector_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        "W-JH-0104",
        "Pithead Incline Gate #2",
        "Piparwar Coal Washery",
        datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        1,
        "DGMS AR Competency Verified. All Required Modules Certified.",
        "Sub-Inspector P.K. Tiwari (DGMS Certified)"
    ))

    # Initial Safety Advisories
    advisories = [
        ("Dhanbad", "Moonidih Colliery", "Methane Gas & Roof Strata", "CRITICAL", "फेस 4B में मीथेन वेंटिलेशन पर्दा तुरंत जांचें और रूफ साउंडिंग करें", "ᱯᱷᱮᱥ 4B ᱨᱮ ᱢᱤᱛᱷᱮᱱ ᱟᱨ ᱪᱷᱟᱛ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱡᱟᱸᱪ ᱢᱮ", "Inspect Face 4B Methane ventilation brattice & perform roof sounding drill", "DGMS चेतावनी: फेस 4B में मीथेन वृद्धि की सूचना है।", "DGMS ᱦᱩᱥᱤᱭᱟᱹᱨ: ᱜᱮᱥ ᱡᱟᱸᱪ ᱢᱮ᱾", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        ("West Singhbhum", "Noamundi Iron Ore", "Heavy Machinery Blind Spot", "WARNING", "100-टन डंपर से 10 मीटर की दूरी व रिवर्स हॉर्न अनिवार्य", "ᱰᱟᱢᱯᱟᱨ ᱠᱷᱚᱱ 10 ᱢᱤᱴᱟᱨ ᱥᱟᱺᱜᱤᱧ ᱛᱟᱦᱮᱸᱱ ᱢᱮ", "Maintain 10m blindspot distance and heed 3 reverse horn blasts", "डंपर के अंधा क्षेत्र में न जाएं।", "ᱰᱟᱢᱯᱟᱨ ᱥᱩᱨ ᱟᱞᱚᱢ ᱥᱮᱱᱚᱜ-ᱟ᱾", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    ]

    cursor.executemany("""
    INSERT INTO safety_advisories (district, mine_unit, hazard_type, severity, title_hi, title_sat, title_en, audio_text_hi, audio_text_sat, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, advisories)

if __name__ == "__main__":
    init_db()
    print("Database initialized and seeded successfully in khanan-suraksha-pro.")
