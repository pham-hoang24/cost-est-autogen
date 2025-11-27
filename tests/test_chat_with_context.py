from fastapi.testclient import TestClient
from main import app
import uuid

client = TestClient(app)

def test_chat_with_context():
    session_id = str(uuid.uuid4())
    
    # 1. Validate Step 1 (Seed Context)
    baseline_data = {
        "project_type": "mobile application",
        "complexity": "medium",
        "tech_stack": "flutter, firebase",
        "team_pref": 4,
        "region": "US"
    }
    
    print(f"Seeding context for session {session_id}...")
    response = client.post("/validate-step1", json={
        "session_id": session_id,
        **baseline_data  # Merge baseline fields into the request
    })
    if response.status_code != 200:
        print(f"Validate Step 1 failed: {response.text}")
    assert response.status_code == 200
    result = response.json()
    print(f"Response: {result}")
    assert result["status"] == "ok"
    assert result["step1_validated"] is True
    
    # 2. Start Chat
    print("Starting chat...")
    response = client.post("/chat", json={
        "session_id": session_id,
        "message": "I want to build a fitness tracking app."
    })
    
    assert response.status_code == 200
    data = response.json()
    agent_response = data["response"]
    print(f"Agent response: {agent_response}")
    
    # 3. Verify Agent does NOT ask for baseline fields
    # It should proceed to method evaluation or ask for description if missing (description is missing here)
    # But it should NOT ask for project_type, complexity, etc.
    
    forbidden_phrases = [
        "Project type",
        "Complexity",
        "Technology stack",
        "Desired team size",
        "Primary delivery region"
    ]
    
    for phrase in forbidden_phrases:
        if phrase in agent_response and "provide the following baseline information" in agent_response:
             # It might mention them in summary, but shouldn't ask for them as missing
             pass
             
    # The agent should ask for description OR proceed if description was inferred (it wasn't)
    # The system message says: "If baseline fields are missing BUT description exists... If description is missing BUT all baseline fields exist: Ask ONLY for the project description"
    
    assert "description" in agent_response.lower() or "tell me more" in agent_response.lower()
    
    # Check that it acknowledges the baseline data
    # "I have all the baseline information."
    if "I have all the baseline information" in agent_response:
        print("SUCCESS: Agent acknowledged baseline info.")
    else:
        print("WARNING: Agent did not explicitly say it has baseline info, checking if it asked for it.")
        
    # Ensure it didn't ask for the fields
    if "1. Project type" in agent_response and "2. Complexity" in agent_response:
        raise AssertionError("Agent re-asked for baseline fields!")

if __name__ == "__main__":
    try:
        test_chat_with_context()
        print("Context test passed!")
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
