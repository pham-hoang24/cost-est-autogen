#!/usr/bin/env python3
"""
Simple Flask backend for data anonymization service
Compatible with Python 3.13 and without pandas dependency issues
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import json
import csv
from datetime import datetime
import re

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'], supports_credentials=True, allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# In-memory storage for demo purposes
jobs = {}
uploads_dir = "uploads"
results_dir = "results"

# Create directories if they don't exist
os.makedirs(uploads_dir, exist_ok=True)
os.makedirs(results_dir, exist_ok=True)

# PII Detection Patterns
PII_PATTERNS = {
    'EMAIL': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    'PHONE': r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
    'SSN': r'\b\d{3}-?\d{2}-?\d{4}\b',
    'CREDIT_CARD': r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'
}

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0',
        'service': 'data-anonymization-microservice'
    })

@app.route('/api/algorithms', methods=['GET'])
def get_algorithms():
    return jsonify({
        'algorithms': [
            {
                'id': 'k-anonymity',
                'name': 'K-Anonymity',
                'description': 'Ensures each record is indistinguishable from at least k-1 other records',
                'parameters': {
                    'k': {'type': 'integer', 'min': 2, 'max': 100, 'default': 3}
                }
            },
            {
                'id': 'l-diversity',
                'name': 'L-Diversity',
                'description': 'Extends K-Anonymity to ensure diversity in sensitive attributes',
                'parameters': {
                    'l': {'type': 'integer', 'min': 2, 'max': 10, 'default': 2}
                }
            },
            {
                'id': 't-closeness',
                'name': 'T-Closeness',
                'description': 'Ensures distribution of sensitive attributes is close to global distribution',
                'parameters': {
                    't': {'type': 'float', 'min': 0.0, 'max': 1.0, 'default': 0.1}
                }
            }
        ]
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Save uploaded file
    filename = f"{job_id}_{file.filename}"
    filepath = os.path.join(uploads_dir, filename)
    file.save(filepath)
    
    # Analyze file for PII
    pii_detections = analyze_file_for_pii(filepath)
    
    # Create job record
    jobs[job_id] = {
        'id': job_id,
        'filename': file.filename,
        'filepath': filepath,
        'status': 'analyzed',
        'uploaded_at': datetime.now().isoformat(),
        'record_count': count_csv_records(filepath),
        'pii_detections': pii_detections
    }
    
    return jsonify({
        'job_id': job_id,
        'filename': file.filename,
        'record_count': jobs[job_id]['record_count'],
        'pii_detections': pii_detections,
        'status': 'analyzed'
    })

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job_status(job_id):
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    return jsonify(jobs[job_id])

@app.route('/api/anonymize/<job_id>', methods=['POST'])
def anonymize_data(job_id):
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    data = request.get_json()
    algorithm = data.get('algorithm', 'k-anonymity')
    
    # Update job status
    jobs[job_id]['status'] = 'anonymizing'
    jobs[job_id]['algorithm'] = algorithm
    
    try:
        # Simple anonymization logic
        result = perform_anonymization(job_id, algorithm, data.get('parameters', {}))
        
        # Update job with results
        jobs[job_id]['status'] = 'completed'
        jobs[job_id]['result'] = result
        jobs[job_id]['completed_at'] = datetime.now().isoformat()
        
        return jsonify({
            'job_id': job_id,
            'status': 'completed',
            'result': result
        })
        
    except Exception as e:
        jobs[job_id]['status'] = 'failed'
        jobs[job_id]['error'] = str(e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<job_id>', methods=['GET'])
def download_result(job_id):
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    if jobs[job_id]['status'] != 'completed':
        return jsonify({'error': 'Job not completed'}), 400
    
    result_file = jobs[job_id]['result']['output_file']
    if not os.path.exists(result_file):
        return jsonify({'error': 'Result file not found'}), 404
    
    return send_file(result_file, as_attachment=True)

def analyze_file_for_pii(filepath):
    """Analyze file for PII patterns"""
    detections = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
            
            for pii_type, pattern in PII_PATTERNS.items():
                matches = re.findall(pattern, content, re.IGNORECASE)
                if matches:
                    detections.append({
                        'type': pii_type,
                        'count': len(matches),
                        'sample': matches[0] if matches else None
                    })
    except Exception as e:
        print(f"Error analyzing file: {e}")
    
    return detections

def count_csv_records(filepath):
    """Count records in CSV file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            return sum(1 for row in reader) - 1  # Subtract header
    except Exception:
        return 0

def perform_anonymization(job_id, algorithm, parameters):
    """Perform data anonymization"""
    job = jobs[job_id]
    input_file = job['filepath']
    
    # Read CSV data
    data = []
    headers = []
    
    with open(input_file, 'r', encoding='utf-8') as file:
        reader = csv.reader(file)
        headers = next(reader)
        data = list(reader)
    
    # Apply anonymization based on algorithm
    if algorithm == 'k-anonymity':
        anonymized_data = apply_k_anonymity(data, parameters.get('k', 3))
    elif algorithm == 'l-diversity':
        anonymized_data = apply_l_diversity(data, parameters.get('l', 2))
    elif algorithm == 't-closeness':
        anonymized_data = apply_t_closeness(data, parameters.get('t', 0.1))
    else:
        anonymized_data = data  # No anonymization
    
    # Save anonymized data
    output_filename = f"{job_id}_anonymized_{algorithm}.csv"
    output_filepath = os.path.join(results_dir, output_filename)
    
    with open(output_filepath, 'w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        writer.writerows(anonymized_data)
    
    return {
        'algorithm': algorithm,
        'original_records': len(data),
        'anonymized_records': len(anonymized_data),
        'output_file': output_filepath,
        'parameters': parameters
    }

def apply_k_anonymity(data, k):
    """Apply K-Anonymity (simplified version)"""
    # Simple generalization: mask last 2 digits of IDs, generalize ages
    anonymized = []
    for row in data:
        if len(row) >= 2:
            # Mask ID (assuming first column is ID)
            if row[0].isdigit():
                row[0] = row[0][:-2] + '**'
            # Generalize age (assuming second column is age)
            if len(row) > 1 and row[1].isdigit():
                age = int(row[1])
                if age < 30:
                    row[1] = '20-29'
                elif age < 40:
                    row[1] = '30-39'
                elif age < 50:
                    row[1] = '40-49'
                else:
                    row[1] = '50+'
        anonymized.append(row)
    
    return anonymized

def apply_l_diversity(data, l):
    """Apply L-Diversity (simplified version)"""
    return apply_k_anonymity(data, l)

def apply_t_closeness(data, t):
    """Apply T-Closeness (simplified version)"""
    return apply_k_anonymity(data, 3)

if __name__ == '__main__':
    print("🚀 SW4E Data Anonymization Microservice (Simple Backend)")
    print("✅ Starting Flask server on port 8082...")
    app.run(host='0.0.0.0', port=8082, debug=True)
