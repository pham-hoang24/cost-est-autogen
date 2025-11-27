from fastapi.testclient import TestClient
from main import app
import uuid

client = TestClient(app)

def test_chat_endpoint():
    session_id = str(uuid.uuid4())
    response = client.post("/chat", json={
        "session_id": session_id,
        "message": "Hi, I want to build a mobile app."
    })
    
    if response.status_code != 200:
        print(f"Error: {response.text}")
        
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    print(f"Agent response: {data['response']}")

if __name__ == "__main__":
    try:
        test_chat_endpoint()
        print("Chat test passed!")
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
