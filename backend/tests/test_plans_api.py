import pytest
from unittest.mock import Mock, patch, MagicMock
from fastapi import HTTPException

class TestPlanGeneration:
    """Tests for plan generation endpoint"""
    
    @patch('api.routes.plans.generate_plan_with_ai')
    @patch('api.routes.plans.get_supabase_client')
    def test_generate_plan_success(
        self, 
        mock_get_supabase, 
        mock_generate_ai,
        client, 
        sample_plan_data,
        sample_task_data,
        sample_resource_data
    ):
        """Test successful plan generation"""
        # Mock AI response
        mock_generate_ai.return_value = {
            "tasks": [
                {
                    "title": "Task 1",
                    "description": "Description 1",
                    "order": 1
                }
            ],
            "resources": [
                {
                    "title": "Resource 1",
                    "url": "https://example.com",
                    "type": "link"
                }
            ]
        }
        
        # Mock Supabase responses
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase
        
        # Mock plan insert
        plan_result = Mock()
        plan_result.data = [sample_plan_data]
        mock_supabase.table.return_value.insert.return_value.execute.return_value = plan_result
        
        # Mock tasks insert
        tasks_result = Mock()
        tasks_result.data = [sample_task_data]
        mock_supabase.table.return_value.insert.return_value.execute.return_value = tasks_result
        
        # Mock resources insert
        resources_result = Mock()
        resources_result.data = [sample_resource_data]
        
        # Make API call
        response = client.post(
            "/api/plans/generate",
            json={
                "title": "Learn Python",
                "description": "I want to learn Python programming",
                "timeline": "2 months"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "plan" in data
        assert data["plan"]["title"] == "Test Plan"
        assert "tasks" in data["plan"]
        assert "resources" in data["plan"]
    
    def test_generate_plan_missing_title(self, client):
        """Test plan generation with missing title"""
        response = client.post(
            "/api/plans/generate",
            json={
                "description": "I want to learn Python programming"
            }
        )
        
        assert response.status_code == 422
    
    def test_generate_plan_short_description(self, client):
        """Test plan generation with too short description"""
        response = client.post(
            "/api/plans/generate",
            json={
                "title": "Learn Python",
                "description": "Short"
            }
        )
        
        assert response.status_code == 422

class TestGetPlan:
    """Tests for get plan endpoint"""
    
    @patch('api.routes.plans.get_supabase_client')
    def test_get_plan_success(
        self,
        mock_get_supabase,
        client,
        mock_plan_id,
        sample_plan_data,
        sample_task_data,
        sample_resource_data
    ):
        """Test successful plan retrieval"""
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase
        
        # Mock plan query
        plan_result = Mock()
        plan_result.data = [sample_plan_data]
        
        # Mock tasks query
        tasks_result = Mock()
        tasks_result.data = [sample_task_data]
        
        # Mock resources query
        resources_result = Mock()
        resources_result.data = [sample_resource_data]
        
        # Chain the mocks
        mock_table = Mock()
        mock_supabase.table.return_value = mock_table
        
        def mock_select_chain(*args, **kwargs):
            mock_chain = Mock()
            mock_chain.eq.return_value.execute.return_value = plan_result
            mock_chain.eq.return_value.order.return_value.execute.return_value = tasks_result
            mock_chain.eq.return_value.execute.return_value = resources_result
            return mock_chain
        
        mock_table.select = mock_select_chain
        
        response = client.get(f"/api/plans/{mock_plan_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == mock_plan_id
        assert data["title"] == "Test Plan"
    
    @patch('api.routes.plans.get_supabase_client')
    def test_get_plan_not_found(self, mock_get_supabase, client, mock_plan_id):
        """Test plan not found"""
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase
        
        # Mock empty result
        plan_result = Mock()
        plan_result.data = []
        
        mock_table = Mock()
        mock_supabase.table.return_value = mock_table
        mock_table.select.return_value.eq.return_value.execute.return_value = plan_result
        
        response = client.get(f"/api/plans/{mock_plan_id}")
        
        assert response.status_code == 404
