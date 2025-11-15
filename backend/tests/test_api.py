import requests
import json

# Test plan generation
url = "http://localhost:8003/api/plans/generate"
data = {
    "title": "Learn Python",
    "description": "I want to learn Python programming from scratch to build web applications",
    "timeline": "2 months",
}

print("Testing plan generation...")
response = requests.post(url, json=data)

print(f"\nStatus Code: {response.status_code}")
print(f"\nResponse:")
print(json.dumps(response.json(), indent=2))

if response.status_code == 201:
    print("\n✅ SUCCESS! Plan generated!")
    plan_id = response.json()["plan"]["id"]
    print(f"Plan ID: {plan_id}")
else:
    print("\n❌ FAILED!")
