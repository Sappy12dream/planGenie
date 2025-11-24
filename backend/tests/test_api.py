"""
Integration tests for the PlanGenie API
Note: This is a manual integration test script, not a pytest unit test
To run: Ensure backend is running on localhost:8003, then run: python tests/test_api.py
"""
import requests
import json

def test_plan_generation():
    """Test plan generation endpoint"""
    url = "http://localhost:8003/api/plans/generate"
    data = {
        "title": "Learn Python",
        "description": "I want to learn Python programming from scratch to build web applications",
        "timeline": "2 months",
    }

    print("Testing plan generation...")
    try:
        response = requests.post(url, json=data, timeout=30)
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"\nResponse:")
        print(json.dumps(response.json(), indent=2))

        if response.status_code == 201:
            print("\n✅ SUCCESS! Plan generated!")
            plan_id = response.json()["plan"]["id"]
            print(f"Plan ID: {plan_id}")
        else:
            print("\n❌ FAILED!")
            
    except requests.ConnectionError:
        print("\n⚠️  ERROR: Could not connect to backend server")
        print("Make sure the backend is running on http://localhost:8003")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")


if __name__ == "__main__":
    test_plan_generation()
