#!/usr/bin/env python3
"""
Test script to check port binding
"""

import pytest
import socket
import sys

# This file is a standalone utility script and isn't meant to be collected by pytest.
pytest.skip("utility script (not a pytest test module)", allow_module_level=True)


def check_port(port: int) -> bool:
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
        if check_port(port):
            print(f"🎯 Use port {port} for your app")
            break
    else:
        print("❌ No ports available")
        sys.exit(1)
