import subprocess
import threading
import time
import os
import signal
import sys

flask_process = None

def run_flask():
    global flask_process
    print("Starting Flask server...")
    # Adjusted path to your Flask app in the frontend folder
    flask_process = subprocess.Popen(["python3", "main/app.py"])

def run_live_server():
    print("Starting Live Server...")
    # Run live server in the current directory
    subprocess.call(["/Users/noorsayed/.npm-global/bin/live-server"])
    


def cleanup(signum, frame):
    print("Stopping servers...")
    if flask_process:
        flask_process.terminate()
    sys.exit(0)

if __name__ == "__main__":
    # Set up cleanup on ctrl+c
    signal.signal(signal.SIGINT, cleanup)
    
    # Start Flask in background
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.daemon = True  # This ensures Flask stops when main script ends
    flask_thread.start()
    
    # Give Flask time to start
    time.sleep(2)
    
    # Start live server in main thread
    run_live_server()