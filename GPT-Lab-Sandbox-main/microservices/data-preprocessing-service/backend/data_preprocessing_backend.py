"""
Professional Data Preprocessing Pipeline Backend
Flask API for comprehensive data preprocessing with PDF reporting
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
import json
import io
import base64
from datetime import datetime
from data_preprocessing_engine import DataPreprocessingEngine
from pdf_report_generator import PDFReportGenerator
import os

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002"
], allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'], 
methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Initialize engines
preprocessing_engine = DataPreprocessingEngine()
pdf_generator = PDFReportGenerator()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Data Preprocessing Pipeline',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/demo/datasets', methods=['GET'])
def get_demo_datasets():
    """Get available demo datasets"""
    demo_datasets = [
        {
            'id': 'ecommerce-customers',
            'name': 'E-commerce Customer Data',
            'description': 'Customer transaction and behavior data for recommendation systems',
            'size': '2.4 MB',
            'records': 15000,
            'features': 12,
            'quality_score': 87,
            'data_types': ['numeric', 'categorical', 'datetime'],
            'use_cases': ['Customer Segmentation', 'Recommendation Systems', 'Churn Prediction'],
            'sample_preview': [
                {'customer_id': 'CUST_001', 'age': 28, 'purchase_amount': 125.50, 'category': 'Electronics'},
                {'customer_id': 'CUST_002', 'age': 35, 'purchase_amount': 89.99, 'category': 'Clothing'},
                {'customer_id': 'CUST_003', 'age': 42, 'purchase_amount': 234.75, 'category': 'Home & Garden'}
            ]
        },
        {
            'id': 'financial-transactions',
            'name': 'Financial Transaction Data',
            'description': 'Banking transaction data for fraud detection and risk analysis',
            'size': '5.8 MB',
            'records': 25000,
            'features': 15,
            'quality_score': 92,
            'data_types': ['numeric', 'categorical', 'datetime'],
            'use_cases': ['Fraud Detection', 'Risk Assessment', 'Transaction Analysis'],
            'sample_preview': [
                {'transaction_id': 'TXN_001', 'amount': 150.00, 'type': 'debit', 'merchant': 'Amazon'},
                {'transaction_id': 'TXN_002', 'amount': 75.50, 'type': 'credit', 'merchant': 'Salary'},
                {'transaction_id': 'TXN_003', 'amount': 25.99, 'type': 'debit', 'merchant': 'Starbucks'}
            ]
        },
        {
            'id': 'medical-records',
            'name': 'Medical Records Dataset',
            'description': 'Anonymized patient medical records for healthcare analytics',
            'size': '3.2 MB',
            'records': 8000,
            'features': 18,
            'quality_score': 89,
            'data_types': ['numeric', 'categorical', 'text'],
            'use_cases': ['Disease Prediction', 'Treatment Optimization', 'Patient Risk Assessment'],
            'sample_preview': [
                {'patient_id': 'P_001', 'age': 45, 'blood_pressure': 120, 'diagnosis': 'Hypertension'},
                {'patient_id': 'P_002', 'age': 32, 'blood_pressure': 110, 'diagnosis': 'Normal'},
                {'patient_id': 'P_003', 'age': 58, 'blood_pressure': 140, 'diagnosis': 'High Risk'}
            ]
        },
        {
            'id': 'iot-sensor-data',
            'name': 'IoT Sensor Data',
            'description': 'Industrial sensor data for predictive maintenance and monitoring',
            'size': '7.1 MB',
            'records': 50000,
            'features': 8,
            'quality_score': 94,
            'data_types': ['numeric', 'datetime'],
            'use_cases': ['Predictive Maintenance', 'Anomaly Detection', 'Performance Monitoring'],
            'sample_preview': [
                {'sensor_id': 'SENSOR_001', 'temperature': 72.5, 'pressure': 15.2, 'vibration': 0.8},
                {'sensor_id': 'SENSOR_002', 'temperature': 68.3, 'pressure': 14.8, 'vibration': 0.6},
                {'sensor_id': 'SENSOR_003', 'temperature': 75.1, 'pressure': 16.1, 'vibration': 1.2}
            ]
        }
    ]
    
    return jsonify({
        'status': 'success',
        'datasets': demo_datasets,
        'total_count': len(demo_datasets)
    })

@app.route('/api/demo/generate-data', methods=['POST'])
def generate_demo_data():
    """Generate demo dataset based on selected type"""
    data = request.get_json()
    dataset_type = data.get('dataset_type', 'ecommerce-customers')
    
    np.random.seed(42)  # For reproducible results
    
    if dataset_type == 'ecommerce-customers':
        # Generate e-commerce customer data
        n_records = 15000
        data = {
            'customer_id': [f'CUST_{i:06d}' for i in range(1, n_records + 1)],
            'age': np.random.normal(35, 12, n_records).astype(int),
            'annual_income': np.random.normal(50000, 15000, n_records),
            'purchase_amount': np.random.exponential(100, n_records),
            'purchase_frequency': np.random.poisson(3, n_records),
            'category': np.random.choice(['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports'], n_records),
            'city': np.random.choice(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'], n_records),
            'membership_type': np.random.choice(['Basic', 'Premium', 'VIP'], n_records, p=[0.6, 0.3, 0.1]),
            'satisfaction_score': np.random.normal(4.2, 0.8, n_records),
            'last_purchase_days': np.random.exponential(30, n_records).astype(int),
            'total_orders': np.random.poisson(15, n_records),
            'is_premium': np.random.choice([0, 1], n_records, p=[0.7, 0.3])
        }
        
        # Add some missing values and outliers
        missing_indices = np.random.choice(n_records, size=int(n_records * 0.05), replace=False)
        data['annual_income'][missing_indices] = np.nan
        
        outlier_indices = np.random.choice(n_records, size=int(n_records * 0.02), replace=False)
        data['purchase_amount'][outlier_indices] *= 10
        
    elif dataset_type == 'financial-transactions':
        # Generate financial transaction data
        n_records = 25000
        data = {
            'transaction_id': [f'TXN_{i:08d}' for i in range(1, n_records + 1)],
            'amount': np.random.lognormal(4, 1.5, n_records),
            'transaction_type': np.random.choice(['debit', 'credit', 'transfer'], n_records, p=[0.6, 0.3, 0.1]),
            'merchant_category': np.random.choice(['Retail', 'Food', 'Gas', 'Online', 'Healthcare'], n_records),
            'hour': np.random.randint(0, 24, n_records),
            'day_of_week': np.random.randint(0, 7, n_records),
            'is_weekend': np.random.choice([0, 1], n_records, p=[0.7, 0.3]),
            'account_balance': np.random.normal(5000, 2000, n_records),
            'credit_score': np.random.normal(720, 100, n_records),
            'transaction_frequency': np.random.poisson(5, n_records),
            'is_fraud': np.random.choice([0, 1], n_records, p=[0.98, 0.02]),
            'merchant_risk_score': np.random.uniform(0, 1, n_records),
            'location_risk': np.random.choice(['Low', 'Medium', 'High'], n_records, p=[0.7, 0.25, 0.05]),
            'device_type': np.random.choice(['Mobile', 'Desktop', 'ATM'], n_records, p=[0.6, 0.35, 0.05]),
            'is_foreign': np.random.choice([0, 1], n_records, p=[0.85, 0.15])
        }
        
    elif dataset_type == 'medical-records':
        # Generate medical records data
        n_records = 8000
        data = {
            'patient_id': [f'P_{i:06d}' for i in range(1, n_records + 1)],
            'age': np.random.normal(45, 20, n_records).astype(int),
            'blood_pressure_systolic': np.random.normal(120, 20, n_records),
            'blood_pressure_diastolic': np.random.normal(80, 15, n_records),
            'heart_rate': np.random.normal(72, 15, n_records),
            'cholesterol': np.random.normal(200, 50, n_records),
            'bmi': np.random.normal(25, 5, n_records),
            'glucose_level': np.random.normal(100, 30, n_records),
            'smoking_status': np.random.choice(['Never', 'Former', 'Current'], n_records, p=[0.6, 0.25, 0.15]),
            'exercise_frequency': np.random.choice(['None', 'Light', 'Moderate', 'Heavy'], n_records, p=[0.3, 0.4, 0.25, 0.05]),
            'family_history': np.random.choice([0, 1], n_records, p=[0.7, 0.3]),
            'medication_count': np.random.poisson(2, n_records),
            'hospital_visits': np.random.poisson(1, n_records),
            'diagnosis': np.random.choice(['Normal', 'Hypertension', 'Diabetes', 'High Risk'], n_records, p=[0.5, 0.3, 0.15, 0.05]),
            'treatment_duration': np.random.exponential(12, n_records),
            'symptoms_count': np.random.poisson(2, n_records),
            'risk_score': np.random.uniform(0, 1, n_records),
            'follow_up_required': np.random.choice([0, 1], n_records, p=[0.8, 0.2])
        }
        
    elif dataset_type == 'iot-sensor-data':
        # Generate IoT sensor data
        n_records = 50000
        data = {
            'sensor_id': [f'SENSOR_{i:04d}' for i in range(1, 1001)],
            'timestamp': pd.date_range('2024-01-01', periods=n_records, freq='1min'),
            'temperature': np.random.normal(70, 10, n_records),
            'pressure': np.random.normal(15, 2, n_records),
            'vibration': np.random.exponential(1, n_records),
            'humidity': np.random.normal(50, 15, n_records),
            'voltage': np.random.normal(220, 5, n_records),
            'current': np.random.normal(10, 2, n_records),
            'power_consumption': np.random.normal(2200, 200, n_records)
        }
        
        # Add some anomalies
        anomaly_indices = np.random.choice(n_records, size=int(n_records * 0.01), replace=False)
        data['temperature'][anomaly_indices] += np.random.normal(0, 20, len(anomaly_indices))
        data['vibration'][anomaly_indices] *= 5
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Profile the generated data
    profile = preprocessing_engine.load_data(df)
    
    return jsonify({
        'status': 'success',
        'dataset_type': dataset_type,
        'data_profile': profile,
        'sample_data': df.head(10).to_dict('records')
    })

@app.route('/api/process', methods=['POST'])
def process_data():
    """Process data through the preprocessing pipeline"""
    data = request.get_json()
    
    # Get processing parameters
    missing_strategy = data.get('missing_strategy', 'auto')
    encoding_method = data.get('encoding_method', 'auto')
    scaling_method = data.get('scaling_method', 'standard')
    outlier_method = data.get('outlier_method', 'iqr')
    feature_selection = data.get('feature_selection', False)
    
    try:
        # Generate demo data based on type
        dataset_type = data.get('dataset_type', 'ecommerce-customers')
        
        # This would normally load the actual dataset, but for demo we'll generate it
        # In a real implementation, you'd load from the uploaded file or database
        
        # For demo purposes, we'll simulate the processing steps
        processing_steps = [
            {
                'name': 'Data Loading',
                'description': 'Loading dataset and performing initial profiling',
                'status': 'completed',
                'processing_time': '0m 15s',
                'records_processed': 15000
            },
            {
                'name': 'Missing Value Analysis',
                'description': f'Analyzing and handling missing values using {missing_strategy} strategy',
                'status': 'completed',
                'processing_time': '0m 23s',
                'records_processed': 15000
            },
            {
                'name': 'Outlier Detection',
                'description': f'Detecting outliers using {outlier_method} method',
                'status': 'completed',
                'processing_time': '0m 18s',
                'records_processed': 15000
            },
            {
                'name': 'Feature Encoding',
                'description': f'Encoding categorical variables using {encoding_method} method',
                'status': 'completed',
                'processing_time': '0m 12s',
                'records_processed': 15000
            },
            {
                'name': 'Feature Scaling',
                'description': f'Scaling numerical features using {scaling_method} method',
                'status': 'completed',
                'processing_time': '0m 8s',
                'records_processed': 15000
            }
        ]
        
        # Generate quality metrics
        quality_metrics = {
            'completeness': 94.2,
            'uniqueness': 98.7,
            'validity': 91.5,
            'consistency': 89.3,
            'accuracy': 87.8,
            'overall_score': 92.3
        }
        
        # Generate processing summary
        summary = {
            'timestamp': datetime.now().isoformat(),
            'original_shape': (15000, 12),
            'processed_shape': (14850, 15),
            'processing_steps': processing_steps,
            'quality_metrics': quality_metrics,
            'outliers_detected': 150,
            'features_processed': 15,
            'memory_usage_mb': 2.4,
            'processing_time': '2m 34s',
            'recommendations': [
                'Consider additional feature engineering for better model performance',
                'Dataset shows good quality with minimal cleaning needed',
                'Recommended train/validation/test split: 70/15/15',
                'Consider dimensionality reduction for high-dimensional data'
            ]
        }
        
        return jsonify({
            'status': 'success',
            'processing_summary': summary,
            'message': 'Data preprocessing completed successfully'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Processing failed: {str(e)}'
        }), 500

@app.route('/api/visualizations', methods=['POST'])
def generate_visualizations():
    """Generate data visualizations"""
    try:
        # In a real implementation, this would generate actual visualizations
        # For demo purposes, we'll return mock visualization data
        
        visualizations = {
            'missing_heatmap': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'distributions': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'correlation': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        }
        
        return jsonify({
            'status': 'success',
            'visualizations': visualizations
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Visualization generation failed: {str(e)}'
        }), 500

@app.route('/api/report/pdf', methods=['POST'])
def generate_pdf_report():
    """Generate PDF report"""
    try:
        data = request.get_json()
        
        # Generate PDF report
        pdf_bytes = pdf_generator.generate_report(data)
        
        # Return PDF as base64
        pdf_base64 = base64.b64encode(pdf_bytes).decode()
        
        return jsonify({
            'status': 'success',
            'pdf_data': pdf_base64,
            'filename': f"data_preprocessing_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'PDF generation failed: {str(e)}'
        }), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get processing analytics and metrics"""
    analytics = {
        'total_processed_datasets': 127,
        'average_processing_time': '3m 45s',
        'average_quality_score': 89.2,
        'most_common_issues': [
            {'issue': 'Missing Values', 'frequency': 45, 'percentage': 35.4},
            {'issue': 'Outliers', 'frequency': 32, 'percentage': 25.2},
            {'issue': 'Data Type Mismatch', 'frequency': 28, 'percentage': 22.0},
            {'issue': 'Duplicate Records', 'frequency': 22, 'percentage': 17.3}
        ],
        'processing_trends': [
            {'date': '2024-01-01', 'datasets_processed': 12, 'avg_quality': 87.5},
            {'date': '2024-01-02', 'datasets_processed': 15, 'avg_quality': 89.2},
            {'date': '2024-01-03', 'datasets_processed': 18, 'avg_quality': 91.1},
            {'date': '2024-01-04', 'datasets_processed': 22, 'avg_quality': 88.7},
            {'date': '2024-01-05', 'datasets_processed': 19, 'avg_quality': 92.3}
        ],
        'feature_engineering_stats': {
            'total_features_created': 156,
            'most_effective_features': ['age_group', 'income_category', 'purchase_frequency_score'],
            'feature_importance_scores': [0.85, 0.78, 0.72, 0.68, 0.65]
        }
    }
    
    return jsonify({
        'status': 'success',
        'analytics': analytics
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8086, debug=True)
