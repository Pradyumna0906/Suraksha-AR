import os
import sys
import time
import socket
import webbrowser
import threading

# Force UTF-8 on Windows consoles to prevent encoding errors
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def is_port_available(port, host='127.0.0.1'):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) != 0

def find_available_port(start_port=8000, max_attempts=20):
    for port in range(start_port, start_port + max_attempts):
        if is_port_available(port):
            return port
    return start_port

def open_browser(url, delay=1.5):
    def _open():
        time.sleep(delay)
        print(f"\n[Browser] Opening {url} ...")
        webbrowser.open(url)
    threading.Thread(target=_open, daemon=True).start()

def main():
    print("=" * 70)
    print(" ⛏️  KHANAN SURAKSHA SATHI - AR Industrial Safety Simulator v2.2")
    print(" Govt. of Jharkhand & DGMS Dhanbad Compliance Standard (SIH26041)")
    print("=" * 70)
    
    # Keep the project root on the import path. The API is a package module,
    # so loading ``app`` directly would break its relative imports.
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, script_dir)
    
    # Initialize DB
    try:
        from backend import database
        database.init_db()
        print(" -> SQLite Database Initialized & Jharkhand Clusters Seeded.")
    except Exception as e:
        print(f" -> DB Warning: {e}")
        
    port = find_available_port(8000)
    url = f"http://127.0.0.1:{port}"
    print(f" -> Server bound to: {url}")
    print(f" -> Live SCADA Gas Telemetry: {url}/api/telemetry/live-gas")
    print(f" -> Press Ctrl+C in terminal to stop.")
    print("=" * 70)
    
    open_browser(url)
    
    import uvicorn
    uvicorn.run("backend.app:app", host="127.0.0.1", port=port, log_level="info")

if __name__ == "__main__":
    main()
