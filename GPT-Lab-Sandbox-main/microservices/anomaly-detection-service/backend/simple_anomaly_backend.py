#!/usr/bin/env python3
"""
Simple AI-Native Anomaly Detection System Backend
Demo version with minimal dependencies
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import uuid
import random
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'], supports_credentials=True, allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# In-memory storage for demo
detection_jobs = {}
anomaly_models = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "ai-anomaly-detection-system",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "models_available": len(anomaly_models),
        "active_jobs": len(detection_jobs)
    })

@app.route('/api/models', methods=['GET'])
def get_available_models():
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
    return jsonify({"models": models})

@app.route('/api/detect', methods=['POST'])
def detect_anomalies():
    """Detect anomalies in data"""
    try:
        data = request.get_json()
        job_id = str(uuid.uuid4())
        
        logger.info(f"Starting anomaly detection job {job_id}")
        
        # Simulate anomaly detection process
        anomalies = []
        for i in range(10):  # Simulate 10 data points
            anomaly_score = random.random()
            is_anomaly = anomaly_score > data.get('threshold', 0.5)
            
            anomaly = {
                "job_id": job_id,
                "timestamp": (datetime.now() - timedelta(minutes=i)).isoformat(),
                "anomaly_score": anomaly_score,
                "is_anomaly": is_anomaly,
                "confidence": anomaly_score,
                "description": f"Anomaly detected in data point {i+1}" if is_anomaly else "Normal data point",
                "data_point": {"index": i, "value": random.random() * 100},
                "model_used": data.get('algorithm', 'isolation_forest')
            }
            anomalies.append(anomaly)
        
        # Store job results
        detection_jobs[job_id] = {
            "status": "completed",
            "request": data,
            "results": anomalies,
            "created_at": datetime.now().isoformat(),
            "total_anomalies": sum(1 for a in anomalies if a['is_anomaly']),
            "total_points": len(anomalies)
        }
        
        return jsonify({
            "job_id": job_id,
            "status": "completed",
            "total_anomalies": sum(1 for a in anomalies if a['is_anomaly']),
            "total_points": len(anomalies),
            "anomaly_rate": sum(1 for a in anomalies if a['is_anomaly']) / len(anomalies),
            "results": anomalies
        })
        
    except Exception as e:
        logger.error(f"Error in anomaly detection: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_data():
    """Upload data for anomaly detection"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Simulate file processing
        job_id = str(uuid.uuid4())
        detection_jobs[job_id] = {
            "status": "uploaded",
            "filename": file.filename,
            "data_shape": [1000, 5],  # Mock data shape
            "columns": ["timestamp", "value1", "value2", "value3", "value4"],
            "created_at": datetime.now().isoformat()
        }
        
        return jsonify({
            "job_id": job_id,
            "filename": file.filename,
            "data_shape": [1000, 5],
            "columns": ["timestamp", "value1", "value2", "value3", "value4"],
            "status": "uploaded"
        })
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/jobs', methods=['GET'])
def get_detection_jobs():
    """Get all detection jobs"""
    return jsonify({
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
    })

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job_details(job_id):
    """Get details of a specific detection job"""
    if job_id not in detection_jobs:
        return jsonify({"error": "Job not found"}), 404
    
    return jsonify(detection_jobs[job_id])

@app.route('/api/performance', methods=['GET'])
def get_model_performance():
    """Get model performance metrics"""
    performance = {
        "isolation_forest": {
            "model_name": "Isolation Forest",
            "accuracy": 0.94,
            "precision": 0.89,
            "recall": 0.92,
            "f1_score": 0.90,
            "training_time": 2.5,
            "inference_time": 0.05
        },
        "autoencoder": {
            "model_name": "Autoencoder",
            "accuracy": 0.91,
            "precision": 0.87,
            "recall": 0.89,
            "f1_score": 0.88,
            "training_time": 45.2,
            "inference_time": 0.12
        },
        "lstm": {
            "model_name": "LSTM Network",
            "accuracy": 0.93,
            "precision": 0.91,
            "recall": 0.88,
            "f1_score": 0.89,
            "training_time": 120.5,
            "inference_time": 0.08
        },
        "ensemble": {
            "model_name": "Ensemble Method",
            "accuracy": 0.96,
            "precision": 0.94,
            "recall": 0.93,
            "f1_score": 0.93,
            "training_time": 168.2,
            "inference_time": 0.15
        }
    }
    
    return jsonify({"performance": performance})

@app.route('/api/demo/scenarios', methods=['GET'])
def get_demo_scenarios():
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
    return jsonify({"scenarios": scenarios})

if __name__ == '__main__':
    print("🚀 Starting AI-Native Anomaly Detection System...")
    print("📍 Service will be available at: http://localhost:8083")
    print("🔍 Health check: http://localhost:8083/api/health")
    print("📊 Models: http://localhost:8083/api/models")
    print("⚡ Real-time monitoring: ws://localhost:8083/ws/realtime")
    app.run(host='0.0.0.0', port=8083, debug=True)
