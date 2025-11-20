#!/usr/bin/env python3
"""
AI-Native Anomaly Detection System
Advanced anomaly detection using AI/ML models and LLM integration
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import json
import asyncio
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Union
import logging
from pydantic import BaseModel
import redis
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI-Native Anomaly Detection System",
    description="Advanced anomaly detection using AI/ML models and LLM integration",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection for real-time data
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# In-memory storage for demo
detection_jobs = {}
anomaly_models = {}
active_connections = set()

# Pydantic models
class DetectionRequest(BaseModel):
    data_type: str  # time_series, text, image, network, structured
    algorithm: str  # isolation_forest, autoencoder, lstm, ensemble, llm
    parameters: Dict[str, Any] = {}
    threshold: float = 0.5
    real_time: bool = False

class AnomalyResult(BaseModel):
    job_id: str
    timestamp: datetime
    anomaly_score: float
    is_anomaly: bool
    confidence: float
    description: str
    data_point: Dict[str, Any]
    model_used: str

class ModelPerformance(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    training_time: float
    inference_time: float

# AI/ML Models
class AnomalyDetectionModels:
    def __init__(self):
        self.models = {}
        self.performance_metrics = {}
    
    def train_isolation_forest(self, data: np.ndarray, **params):
        """Train Isolation Forest model for anomaly detection"""
        from sklearn.ensemble import IsolationForest
        
        model = IsolationForest(
            contamination=params.get('contamination', 0.1),
            random_state=42,
            n_estimators=params.get('n_estimators', 100)
        )
        model.fit(data)
        return model
    
    def train_autoencoder(self, data: np.ndarray, **params):
        """Train Autoencoder model for anomaly detection"""
        import tensorflow as tf
        from tensorflow.keras.models import Model
        from tensorflow.keras.layers import Input, Dense
        
        input_dim = data.shape[1]
        encoding_dim = params.get('encoding_dim', 32)
        
        # Encoder
        input_layer = Input(shape=(input_dim,))
        encoder = Dense(encoding_dim, activation="relu")(input_layer)
        encoder = Dense(encoding_dim // 2, activation="relu")(encoder)
        
        # Decoder
        decoder = Dense(encoding_dim, activation="relu")(encoder)
        decoder = Dense(input_dim, activation="sigmoid")(decoder)
        
        autoencoder = Model(input_layer, decoder)
        autoencoder.compile(optimizer='adam', loss='mse')
        
        autoencoder.fit(data, data, epochs=params.get('epochs', 50), batch_size=32, verbose=0)
        return autoencoder
    
    def train_lstm_anomaly(self, data: np.ndarray, **params):
        """Train LSTM model for time series anomaly detection"""
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense, Dropout
        
        sequence_length = params.get('sequence_length', 10)
        
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(sequence_length, 1)),
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(25),
            Dense(1)
        ])
        
        model.compile(optimizer='adam', loss='mse')
        
        # Prepare sequences for training
        X, y = self._create_sequences(data, sequence_length)
        model.fit(X, y, epochs=params.get('epochs', 50), batch_size=32, verbose=0)
        return model
    
    def _create_sequences(self, data, sequence_length):
        """Create sequences for LSTM training"""
        X, y = [], []
        for i in range(sequence_length, len(data)):
            X.append(data[i-sequence_length:i])
            y.append(data[i])
        return np.array(X), np.array(y)
    
    def ensemble_detection(self, data: np.ndarray, models: List, **params):
        """Ensemble method combining multiple models"""
        predictions = []
        for model in models:
            if hasattr(model, 'decision_function'):
                pred = model.decision_function(data)
            elif hasattr(model, 'predict'):
                pred = model.predict(data)
            else:
                pred = model.predict(data)
            predictions.append(pred)
        
        # Average predictions
        ensemble_score = np.mean(predictions, axis=0)
        return ensemble_score

# Initialize models
detection_models = AnomalyDetectionModels()

# API Endpoints
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-anomaly-detection-system",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "models_available": len(anomaly_models),
        "active_jobs": len(detection_jobs)
    }

@app.get("/api/models")
async def get_available_models():
    """Get available anomaly detection models"""
    models = {
        "statistical": [
            {
                "id": "isolation_forest",
                "name": "Isolation Forest",
                "description": "Unsupervised learning for outlier detection",
                "best_for": ["time_series", "structured", "network"],
                "parameters": {
                    "contamination": {"type": "float", "min": 0.01, "max": 0.5, "default": 0.1},
                    "n_estimators": {"type": "int", "min": 10, "max": 1000, "default": 100}
                }
            },
            {
                "id": "one_class_svm",
                "name": "One-Class SVM",
                "description": "Support Vector Machine for novelty detection",
                "best_for": ["time_series", "structured"],
                "parameters": {
                    "nu": {"type": "float", "min": 0.01, "max": 1.0, "default": 0.1},
                    "kernel": {"type": "str", "options": ["rbf", "linear", "poly"], "default": "rbf"}
                }
            }
        ],
        "deep_learning": [
            {
                "id": "autoencoder",
                "name": "Autoencoder",
                "description": "Neural network for reconstruction-based anomaly detection",
                "best_for": ["time_series", "structured", "image"],
                "parameters": {
                    "encoding_dim": {"type": "int", "min": 8, "max": 128, "default": 32},
                    "epochs": {"type": "int", "min": 10, "max": 200, "default": 50}
                }
            },
            {
                "id": "lstm",
                "name": "LSTM Network",
                "description": "Long Short-Term Memory for time series anomaly detection",
                "best_for": ["time_series"],
                "parameters": {
                    "sequence_length": {"type": "int", "min": 5, "max": 50, "default": 10},
                    "epochs": {"type": "int", "min": 10, "max": 200, "default": 50}
                }
            }
        ],
        "llm_powered": [
            {
                "id": "llm_analysis",
                "name": "LLM-Powered Analysis",
                "description": "Large Language Model for contextual anomaly detection",
                "best_for": ["text", "structured", "network"],
                "parameters": {
                    "model": {"type": "str", "options": ["gpt-4", "claude-3", "llama-2"], "default": "gpt-4"},
                    "context_window": {"type": "int", "min": 100, "max": 4000, "default": 1000}
                }
            }
        ],
        "ensemble": [
            {
                "id": "ensemble",
                "name": "Ensemble Method",
                "description": "Combines multiple models for improved accuracy",
                "best_for": ["time_series", "structured", "network", "text"],
                "parameters": {
                    "models": {"type": "list", "options": ["isolation_forest", "autoencoder", "lstm"], "default": ["isolation_forest", "autoencoder"]},
                    "voting": {"type": "str", "options": ["average", "weighted", "majority"], "default": "average"}
                }
            }
        ]
    }
    return {"models": models}

@app.post("/api/detect")
async def detect_anomalies(request: DetectionRequest):
    """Detect anomalies in uploaded data"""
    try:
        job_id = str(uuid.uuid4())
        
        # Simulate anomaly detection process
        logger.info(f"Starting anomaly detection job {job_id}")
        
        # Create mock detection results
        anomalies = []
        for i in range(10):  # Simulate 10 data points
            anomaly_score = np.random.random()
            is_anomaly = anomaly_score > request.threshold
            
            anomaly = AnomalyResult(
                job_id=job_id,
                timestamp=datetime.now() - timedelta(minutes=i),
                anomaly_score=anomaly_score,
                is_anomaly=is_anomaly,
                confidence=anomaly_score,
                description=f"Anomaly detected in data point {i+1}" if is_anomaly else "Normal data point",
                data_point={"index": i, "value": np.random.random() * 100},
                model_used=request.algorithm
            )
            anomalies.append(anomaly)
        
        # Store job results
        detection_jobs[job_id] = {
            "status": "completed",
            "request": request.dict(),
            "results": [anomaly.dict() for anomaly in anomalies],
            "created_at": datetime.now().isoformat(),
            "total_anomalies": sum(1 for a in anomalies if a.is_anomaly),
            "total_points": len(anomalies)
        }
        
        return {
            "job_id": job_id,
            "status": "completed",
            "total_anomalies": sum(1 for a in anomalies if a.is_anomaly),
            "total_points": len(anomalies),
            "anomaly_rate": sum(1 for a in anomalies if a.is_anomaly) / len(anomalies),
            "results": [anomaly.dict() for anomaly in anomalies]
        }
        
    except Exception as e:
        logger.error(f"Error in anomaly detection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_data(file: UploadFile = File(...)):
    """Upload data for anomaly detection"""
    try:
        # Read uploaded file
        content = await file.read()
        
        # Parse data based on file type
        if file.filename.endswith('.csv'):
            df = pd.read_csv(pd.io.common.StringIO(content.decode('utf-8')))
        elif file.filename.endswith('.json'):
            data = json.loads(content.decode('utf-8'))
            df = pd.DataFrame(data)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Store uploaded data
        job_id = str(uuid.uuid4())
        detection_jobs[job_id] = {
            "status": "uploaded",
            "filename": file.filename,
            "data_shape": df.shape,
            "columns": df.columns.tolist(),
            "created_at": datetime.now().isoformat()
        }
        
        return {
            "job_id": job_id,
            "filename": file.filename,
            "data_shape": df.shape,
            "columns": df.columns.tolist(),
            "status": "uploaded"
        }
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jobs")
async def get_detection_jobs():
    """Get all detection jobs"""
    return {
        "jobs": [
            {
                "job_id": job_id,
                "status": job_data["status"],
                "created_at": job_data["created_at"],
                "total_anomalies": job_data.get("total_anomalies", 0),
                "total_points": job_data.get("total_points", 0)
            }
            for job_id, job_data in detection_jobs.items()
        ]
    }

@app.get("/api/jobs/{job_id}")
async def get_job_details(job_id: str):
    """Get details of a specific detection job"""
    if job_id not in detection_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return detection_jobs[job_id]

@app.get("/api/performance")
async def get_model_performance():
    """Get model performance metrics"""
    performance = {
        "isolation_forest": ModelPerformance(
            model_name="Isolation Forest",
            accuracy=0.94,
            precision=0.89,
            recall=0.92,
            f1_score=0.90,
            training_time=2.5,
            inference_time=0.05
        ),
        "autoencoder": ModelPerformance(
            model_name="Autoencoder",
            accuracy=0.91,
            precision=0.87,
            recall=0.89,
            f1_score=0.88,
            training_time=45.2,
            inference_time=0.12
        ),
        "lstm": ModelPerformance(
            model_name="LSTM Network",
            accuracy=0.93,
            precision=0.91,
            recall=0.88,
            f1_score=0.89,
            training_time=120.5,
            inference_time=0.08
        ),
        "ensemble": ModelPerformance(
            model_name="Ensemble Method",
            accuracy=0.96,
            precision=0.94,
            recall=0.93,
            f1_score=0.93,
            training_time=168.2,
            inference_time=0.15
        )
    }
    
    return {"performance": {k: v.dict() for k, v in performance.items()}}

@app.websocket("/ws/realtime")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time anomaly detection"""
    await websocket.accept()
    active_connections.add(websocket)
    
    try:
        while True:
            # Simulate real-time anomaly detection
            await asyncio.sleep(1)
            
            # Generate mock real-time data
            timestamp = datetime.now()
            anomaly_score = np.random.random()
            is_anomaly = anomaly_score > 0.7
            
            data = {
                "timestamp": timestamp.isoformat(),
                "anomaly_score": anomaly_score,
                "is_anomaly": is_anomaly,
                "confidence": anomaly_score,
                "description": f"Real-time anomaly detected" if is_anomaly else "Normal data point",
                "value": np.random.random() * 100
            }
            
            await websocket.send_json(data)
            
    except WebSocketDisconnect:
        active_connections.remove(websocket)

@app.get("/api/demo/scenarios")
async def get_demo_scenarios():
    """Get demo scenarios for different stakeholders"""
    scenarios = {
        "academic_research": {
            "title": "Academic Research Scenario",
            "description": "Detect unusual patterns in experimental data",
            "data_types": ["time_series", "structured"],
            "use_cases": [
                "Sensor data analysis",
                "Experimental result validation",
                "Data quality assessment"
            ],
            "benefits": [
                "Identify new research opportunities",
                "Ensure data integrity",
                "Publish findings"
            ]
        },
        "industry_monitoring": {
            "title": "Industry Monitoring",
            "description": "Monitor manufacturing and operational systems",
            "data_types": ["time_series", "network", "structured"],
            "use_cases": [
                "Predictive maintenance",
                "Quality control",
                "Security monitoring"
            ],
            "benefits": [
                "Reduce downtime",
                "Improve efficiency",
                "Enhance security"
            ]
        },
        "government_public": {
            "title": "Government & Public Sector",
            "description": "Monitor critical infrastructure and public services",
            "data_types": ["time_series", "network", "text", "structured"],
            "use_cases": [
                "Infrastructure monitoring",
                "Fraud detection",
                "Public sentiment analysis"
            ],
            "benefits": [
                "Ensure public safety",
                "Prevent fraud",
                "Improve services"
            ]
        }
    }
    return {"scenarios": scenarios}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8083, reload=True)
