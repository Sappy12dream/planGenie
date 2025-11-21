from datetime import datetime, timedelta
from typing import Dict, Tuple
from collections import defaultdict

class RateLimiter:
    """Simple in-memory rate limiter for suggestion generation."""
    
    def __init__(self):
        # Structure: {(user_id, plan_id): [(timestamp, count)]}
        self._requests: Dict[Tuple[str, str], list] = defaultdict(list)
        self.max_requests = 5
        self.window_hours = 1
    
    def is_allowed(self, user_id: str, plan_id: str) -> bool:
        """Check if request is allowed based on rate limit."""
        key = (user_id, plan_id)
        now = datetime.now()
        cutoff = now - timedelta(hours=self.window_hours)
        
        # Clean old requests
        self._requests[key] = [
            ts for ts in self._requests[key] 
            if ts > cutoff
        ]
        
        # Check limit
        if len(self._requests[key]) >= self.max_requests:
            return False
        
        # Add new request
        self._requests[key].append(now)
        return True
    
    def get_remaining(self, user_id: str, plan_id: str) -> int:
        """Get remaining requests for this user/plan."""
        key = (user_id, plan_id)
        now = datetime.now()
        cutoff = now - timedelta(hours=self.window_hours)
        
        # Clean old requests
        self._requests[key] = [
            ts for ts in self._requests[key] 
            if ts > cutoff
        ]
        
        return max(0, self.max_requests - len(self._requests[key]))

# Global instance
suggestion_rate_limiter = RateLimiter()
