import pytest
from unittest.mock import Mock, patch
from services.plan_generator import generate_plan_with_ai

class TestPlanGenerator:
    """Tests for AI plan generation"""
    
    @patch('services.plan_generator.client')
    def test_generate_plan_success(self, mock_openai_client):
        """Test successful plan generation"""
        # Mock OpenAI response
        mock_response = Mock()
        mock_choice = Mock()
        mock_message = Mock()
        mock_message.content = '''
        {
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
        '''
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        
        mock_openai_client.chat.completions.create.return_value = mock_response
        
        result = generate_plan_with_ai(
            title="Learn Python",
            description="I want to learn Python",
            timeline="2 months"
        )
        
        assert "tasks" in result
        assert "resources" in result
        assert len(result["tasks"]) > 0
        assert len(result["resources"]) > 0
    
    @patch('services.plan_generator.client')
    def test_generate_plan_with_markdown_code_blocks(self, mock_openai_client):
        """Test handling of markdown code blocks in response"""
        mock_response = Mock()
        mock_choice = Mock()
        mock_message = Mock()
        mock_message.content = '''```json
        {
            "tasks": [{"title": "Task 1", "description": "Desc", "order": 1}],
            "resources": [{"title": "Res 1", "url": "https://example.com", "type": "link"}]
        }
```'''
        mock_choice.message = mock_message
        mock_response.choices = [mock_choice]
        
        mock_openai_client.chat.completions.create.return_value = mock_response
        
        result = generate_plan_with_ai(
            title="Learn Python",
            description="Description",
            timeline="1 month"
        )
        
        assert "tasks" in result
        assert "resources" in result
    
    @patch('services.plan_generator.client')
    def test_generate_plan_fallback_on_error(self, mock_openai_client):
        """Test fallback plan when AI fails"""
        # Mock OpenAI to raise an exception
        mock_openai_client.chat.completions.create.side_effect = Exception("API Error")
        
        with pytest.raises(Exception):
            generate_plan_with_ai(
                title="Learn Python",
                description="Description",
                timeline="1 month"
            )
