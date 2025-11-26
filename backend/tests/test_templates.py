from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_templates():
    response = client.get("/api/templates")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Check structure of first template
    template = data[0]
    assert "id" in template
    assert "title" in template
    assert "description" in template
    assert "timeline" in template
    assert "category" in template
    assert "icon" in template

def test_get_template_by_id():
    # Get first template ID
    response = client.get("/api/templates")
    first_id = response.json()[0]["id"]
    
    # Fetch specific template
    response = client.get(f"/api/templates/{first_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == first_id

def test_get_nonexistent_template():
    response = client.get("/api/templates/nonexistent-id-123")
    assert response.status_code == 404
