import pytest
from unittest.mock import Mock, patch, MagicMock
from uuid import uuid4


class TestChatEndpoint:
    """Tests for AI chat functionality"""

    @patch("api.routes.chat.get_supabase_client")
    @patch("api.routes.chat.openai_client")
    def test_send_message_success(
        self,
        mock_openai,
        mock_get_supabase,
        client,
        mock_plan_id,
        mock_user_id,
    ):
        """Test successful chat message sending"""
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase

        # Mock plan ownership check
        plan_result = Mock()
        plan_result.data = [{"id": mock_plan_id, "user_id": mock_user_id}]

        # Mock chat history retrieval
        history_result = Mock()
        history_result.data = [
            {
                "role": "user",
                "content": "Previous message",
                "created_at": "2024-01-01T00:00:00Z",
            }
        ]

        # Mock message insert
        message_result = Mock()
        message_result.data = [
            {
                "id": str(uuid4()),
                "plan_id": mock_plan_id,
                "role": "user",
                "content": "Hello AI",
                "created_at": "2024-01-01T00:00:00Z",
            }
        ]

        # Mock AI response insert
        ai_message_result = Mock()
        ai_message_result.data = [
            {
                "id": str(uuid4()),
                "plan_id": mock_plan_id,
                "role": "assistant",
                "content": "Hello! How can I help?",
                "created_at": "2024-01-01T00:00:00Z",
            }
        ]

        # Setup mock chain
        mock_table = Mock()
        mock_supabase.table.return_value = mock_table

        select_chain = Mock()
        select_chain.eq.return_value.execute.return_value = plan_result
        select_chain.eq.return_value.order.return_value.execute.return_value = (
            history_result
        )
        mock_table.select.return_value = select_chain

        insert_chain = Mock()
        insert_chain.execute.side_effect = [message_result, ai_message_result]
        mock_table.insert.return_value = insert_chain

        # Mock OpenAI response
        mock_openai.chat.completions.create.return_value = Mock(
            choices=[Mock(message=Mock(content="Hello! How can I help?"))]
        )

        response = client.post(
            f"/api/plans/{mock_plan_id}/chat", json={"message": "Hello AI"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "user_message" in data
        assert "ai_response" in data
        assert data["user_message"]["content"] == "Hello AI"

    def test_send_message_missing_content(self, client, mock_plan_id):
        """Test chat message with missing content"""
        response = client.post(f"/api/plans/{mock_plan_id}/chat", json={})

        assert response.status_code == 422

    @patch("api.routes.chat.get_supabase_client")
    def test_send_message_plan_not_found(
        self, mock_get_supabase, client, mock_plan_id
    ):
        """Test chat message to non-existent plan"""
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase

        # Mock empty plan result
        plan_result = Mock()
        plan_result.data = []

        mock_table = Mock()
        mock_supabase.table.return_value = mock_table
        select_chain = Mock()
        select_chain.eq.return_value.execute.return_value = plan_result
        mock_table.select.return_value = select_chain

        response = client.post(
            f"/api/plans/{mock_plan_id}/chat", json={"message": "Hello"}
        )

        assert response.status_code == 404


class TestGetChatHistory:
    """Tests for retrieving chat history"""

    @patch("api.routes.chat.get_supabase_client")
    def test_get_chat_history_success(
        self, mock_get_supabase, client, mock_plan_id, mock_user_id
    ):
        """Test successful chat history retrieval"""
        mock_supabase = Mock()
        mock_get_supabase.return_value = mock_supabase

        # Mock plan ownership check
        plan_result = Mock()
        plan_result.data = [{"id": mock_plan_id, "user_id": mock_user_id}]

        # Mock chat history
        history_result = Mock()
        history_result.data = [
            {
                "id": str(uuid4()),
                "plan_id": mock_plan_id,
                "role": "user",
                "content": "Hello",
                "created_at": "2024-01-01T00:00:00Z",
            },
            {
                "id": str(uuid4()),
                "plan_id": mock_plan_id,
                "role": "assistant",
                "content": "Hi! How can I help?",
                "created_at": "2024-01-01T00:00:01Z",
            },
        ]

        mock_table = Mock()
        mock_supabase.table.return_value = mock_table

        select_chain = Mock()
        select_chain.eq.return_value.execute.return_value = plan_result
        select_chain.eq.return_value.order.return_value.execute.return_value = (
            history_result
        )
        mock_table.select.return_value = select_chain

        response = client.get(f"/api/plans/{mock_plan_id}/chat/history")

        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        assert len(data["messages"]) == 2
        assert data["messages"][0]["role"] == "user"
        assert data["messages"][1]["role"] == "assistant"
