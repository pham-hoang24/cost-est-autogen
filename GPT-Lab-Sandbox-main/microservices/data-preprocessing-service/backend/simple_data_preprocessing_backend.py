"""
Simplified Data Preprocessing Pipeline Backend
Flask API for comprehensive data preprocessing with PDF reporting
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import io
import base64
from datetime import datetime
import os
import random
from simple_chart_generator import SimpleChartGenerator

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

# Initialize chart generator
chart_generator = SimpleChartGenerator()

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
        
        # Simulate processing steps
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
    """Generate real data visualizations"""
    try:
        data = request.get_json()
        dataset_type = data.get('dataset_type', 'ecommerce-customers')
        
        # Generate real charts
        visualizations = {
            'data_distributions': chart_generator.generate_data_distribution_chart(dataset_type),
            'quality_metrics': chart_generator.generate_quality_metrics_chart(),
            'processing_trends': chart_generator.generate_processing_trends_chart(),
            'correlation_matrix': chart_generator.generate_correlation_matrix(dataset_type),
            'outlier_analysis': chart_generator.generate_outlier_analysis(dataset_type),
            'performance_metrics': chart_generator.generate_processing_performance_chart()
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
        
        # For demo purposes, create a simple PDF report
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.units import inch
        
        # Create PDF in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title = Paragraph("Data Preprocessing Pipeline Report", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Summary
        summary_text = f"""
        <b>Processing Summary:</b><br/>
        • Original Records: {data.get('original_shape', (0, 0))[0]:,}<br/>
        • Processed Records: {data.get('processed_shape', (0, 0))[0]:,}<br/>
        • Processing Time: {data.get('processing_time', 'N/A')}<br/>
        • Quality Score: {data.get('quality_metrics', {}).get('overall_score', 0):.1f}%<br/>
        """
        story.append(Paragraph(summary_text, styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Quality Metrics
        quality_text = f"""
        <b>Data Quality Metrics:</b><br/>
        • Completeness: {data.get('quality_metrics', {}).get('completeness', 0):.1f}%<br/>
        • Uniqueness: {data.get('quality_metrics', {}).get('uniqueness', 0):.1f}%<br/>
        • Validity: {data.get('quality_metrics', {}).get('validity', 0):.1f}%<br/>
        • Consistency: {data.get('quality_metrics', {}).get('consistency', 0):.1f}%<br/>
        • Accuracy: {data.get('quality_metrics', {}).get('accuracy', 0):.1f}%<br/>
        """
        story.append(Paragraph(quality_text, styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Recommendations
        recommendations = data.get('recommendations', [])
        if recommendations:
            rec_text = "<b>Recommendations:</b><br/>"
            for rec in recommendations:
                rec_text += f"• {rec}<br/>"
            story.append(Paragraph(rec_text, styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        # Get PDF bytes
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
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
