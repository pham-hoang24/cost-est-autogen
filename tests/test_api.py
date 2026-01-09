from fastapi.testclient import TestClient
from main import app
import json

client = TestClient(app)

def test_intake():
    response = client.post("/intake", json={
        "project_type": "web application",
        "complexity": "medium",
        "tech_stack": "python, react",
        "team_pref": 5,
        "region": "US",
        "description": "A simple web app for tracking expenses."
    })
    assert response.status_code == 200
    data = response.json()
    # Current /intake endpoint validates and persists baseline inputs
    assert data["status"] in {"validated", "invalid"}
    assert "is_valid" in data

def test_methods():
    response = client.get("/methods")
    assert response.status_code == 200
    methods = response.json()
    assert len(methods) > 0
    assert any(m["method_name"] == "COCOMO" for m in methods)

def test_estimate_mock():
    response = client.post("/estimate", json={
        "method_name": "COCOMO",
        "baseline_inputs": {
            "project_type": "web application",
            "complexity": "medium",
            "tech_stack": "python",
            "team_pref": 3,
            "region": "US"
        }
    })
    assert response.status_code == 200
    data = response.json()
    assert data["method_name"] == "COCOMO"
    # Currently returns mock response
    assert data["is_sufficient"] is False 

def test_hybrid_mock():
    response = client.post("/hybrid", json={
        "baseline_inputs": {
            "project_type": "web application",
            "complexity": "medium",
            "tech_stack": "python",
            "team_pref": 3,
            "region": "US"
        }
    })
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "hybrid"
    assert "composite_estimate" in data

if __name__ == "__main__":
    try:
        test_intake()
        test_methods()
        test_estimate_mock()
        test_hybrid_mock()
        print("All API tests passed!")
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
