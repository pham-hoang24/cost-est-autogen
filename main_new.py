"""
main.py
=======

Cost Estimation Microservice - Entry Point

This is the application factory that:
1. Creates the FastAPI application
2. Configures middleware (CORS)
3. Registers all API routers

Business logic is in services/, schemas in api/schemas.py, routes in api/routes/.
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def create_app() -> FastAPI:
    """
    Application factory that creates and configures the FastAPI app.
    
    Returns:
        Configured FastAPI application
    """
    app = FastAPI(
        title="Cost Estimation Microservice",
        description="AI-powered software cost estimation using multiple methodologies",
        version="2.0.0",
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",  # Next.js dev server
            "http://localhost:3001",  # Alternative port
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Register routers
    _register_routers(app)
    
    return app


def _register_routers(app: FastAPI) -> None:
    """
    Register all API routers with the application.
    
    Args:
        app: FastAPI application instance
    """
    from api.routes.chat import router as chat_router
    from api.routes.estimation import router as estimation_router
    from api.routes.methods import router as methods_router
    from api.routes.validation import router as validation_router
    from api.routes.tracing import router as tracing_router
    
    app.include_router(chat_router)
    app.include_router(estimation_router)
    app.include_router(methods_router)
    app.include_router(validation_router)
    app.include_router(tracing_router)


# Create the application instance
app = create_app()


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "service": "cost-estimation"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

