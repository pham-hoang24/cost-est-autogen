#!/usr/bin/env python3
"""
Test script to check port binding
"""

import socket
import sys

def test_port(port):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', port))
            print(f"✅ Port {port} is available")
            return True
    except OSError:
        print(f"❌ Port {port} is not available")
        return False

if __name__ == "__main__":
    print("🔍 Testing port availability...")
    
    ports = [8000, 8001, 8002, 3000, 8080]
    
    for port in ports:
        if test_port(port):
            print(f"🎯 Use port {port} for your app")
            break
    else:
        print("❌ No ports available")
        sys.exit(1)
