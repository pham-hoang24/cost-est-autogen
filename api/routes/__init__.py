"""
API Routes package.
Contains all FastAPI router modules.
"""

# Import routers lazily to avoid circular imports
# The routers are imported in main.py when needed

__all__ = ["chat", "estimation", "methods", "validation", "tracing"]

