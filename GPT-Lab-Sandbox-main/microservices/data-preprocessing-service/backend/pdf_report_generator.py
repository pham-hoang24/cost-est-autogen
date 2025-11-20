"""
Professional PDF Report Generator for Data Preprocessing Pipeline
Creates comprehensive reports with charts, analytics, and visualizations
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics import renderPDF
import base64
import io
from datetime import datetime
from typing import Dict, List, Any

class PDFReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Setup custom styles for the report"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#2E86AB')
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            spaceBefore=20,
            textColor=colors.HexColor('#A23B72')
        ))
        
        # Subsection style
        self.styles.add(ParagraphStyle(
            name='Subsection',
            parent=self.styles['Heading3'],
            fontSize=14,
            spaceAfter=8,
            spaceBefore=12,
            textColor=colors.HexColor('#F18F01')
        ))
        
        # Body text style
        self.styles.add(ParagraphStyle(
            name='BodyText',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            leading=14
        ))
        
        # Metric style
        self.styles.add(ParagraphStyle(
            name='Metric',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=4,
            textColor=colors.HexColor('#2E86AB'),
            fontName='Helvetica-Bold'
        ))
    
    def create_executive_summary(self, data: Dict[str, Any]) -> List:
        """Create executive summary section"""
        elements = []
        
        elements.append(Paragraph("EXECUTIVE SUMMARY", self.styles['SectionHeader']))
        elements.append(Spacer(1, 12))
        
        # Key metrics table
        metrics_data = [
            ['Metric', 'Value', 'Status'],
            ['Total Records', f"{data.get('original_shape', (0, 0))[0]:,}", '✓'],
            ['Total Features', f"{data.get('original_shape', (0, 0))[1]:,}", '✓'],
            ['Data Quality Score', f"{data.get('quality_metrics', {}).get('overall_score', 0):.1f}%", 
             '✓' if data.get('quality_metrics', {}).get('overall_score', 0) > 80 else '⚠'],
            ['Processing Time', data.get('processing_time', 'N/A'), '✓'],
            ['Memory Usage', f"{data.get('memory_usage_mb', 0):.1f} MB", '✓']
        ]
        
        metrics_table = Table(metrics_data, colWidths=[2*inch, 1.5*inch, 0.8*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E86AB')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(metrics_table)
        elements.append(Spacer(1, 20))
        
        # Summary paragraph
        summary_text = f"""
        This report presents the comprehensive analysis and preprocessing of a dataset containing 
        {data.get('original_shape', (0, 0))[0]:,} records and {data.get('original_shape', (0, 0))[1]:,} features. 
        The data preprocessing pipeline successfully processed the dataset with an overall quality score of 
        {data.get('quality_metrics', {}).get('overall_score', 0):.1f}%. The processing was completed in 
        {data.get('processing_time', 'N/A')} with {len(data.get('processing_steps', []))} preprocessing steps applied.
        """
        
        elements.append(Paragraph(summary_text, self.styles['BodyText']))
        
        return elements
    
    def create_data_quality_section(self, data: Dict[str, Any]) -> List:
        """Create data quality analysis section"""
        elements = []
        
        elements.append(Paragraph("DATA QUALITY ANALYSIS", self.styles['SectionHeader']))
        elements.append(Spacer(1, 12))
        
        quality_metrics = data.get('quality_metrics', {})
        
        # Quality metrics table
        quality_data = [
            ['Quality Dimension', 'Score', 'Status', 'Description'],
            ['Completeness', f"{quality_metrics.get('completeness', 0):.1f}%", 
             '✓' if quality_metrics.get('completeness', 0) > 90 else '⚠', 
             'Percentage of non-missing values'],
            ['Uniqueness', f"{quality_metrics.get('uniqueness', 0):.1f}%", 
             '✓' if quality_metrics.get('uniqueness', 0) > 95 else '⚠', 
             'Percentage of unique records'],
            ['Validity', f"{quality_metrics.get('validity', 0):.1f}%", 
             '✓' if quality_metrics.get('validity', 0) > 85 else '⚠', 
             'Data format and range compliance'],
            ['Consistency', f"{quality_metrics.get('consistency', 0):.1f}%", 
             '✓' if quality_metrics.get('consistency', 0) > 85 else '⚠', 
             'Cross-field validation compliance'],
            ['Accuracy', f"{quality_metrics.get('accuracy', 0):.1f}%", 
             '✓' if quality_metrics.get('accuracy', 0) > 80 else '⚠', 
             'Data correctness and precision']
        ]
        
        quality_table = Table(quality_data, colWidths=[1.5*inch, 1*inch, 0.8*inch, 2.2*inch])
        quality_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#A23B72')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
        ]))
        
        elements.append(quality_table)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def create_processing_steps_section(self, data: Dict[str, Any]) -> List:
        """Create processing steps section"""
        elements = []
        
        elements.append(Paragraph("PREPROCESSING STEPS", self.styles['SectionHeader']))
        elements.append(Spacer(1, 12))
        
        processing_steps = data.get('processing_steps', [])
        
        if processing_steps:
            for i, step in enumerate(processing_steps, 1):
                elements.append(Paragraph(f"Step {i}: {step.get('name', 'Unknown Step')}", self.styles['Subsection']))
                elements.append(Paragraph(f"Description: {step.get('description', 'No description available')}", self.styles['BodyText']))
                elements.append(Paragraph(f"Status: {step.get('status', 'Unknown')}", self.styles['BodyText']))
                elements.append(Paragraph(f"Processing Time: {step.get('processing_time', 'N/A')}", self.styles['BodyText']))
                elements.append(Spacer(1, 10))
        else:
            elements.append(Paragraph("No processing steps recorded.", self.styles['BodyText']))
        
        return elements
    
    def create_recommendations_section(self, data: Dict[str, Any]) -> List:
        """Create recommendations section"""
        elements = []
        
        elements.append(Paragraph("RECOMMENDATIONS", self.styles['SectionHeader']))
        elements.append(Spacer(1, 12))
        
        recommendations = data.get('recommendations', [])
        
        if recommendations:
            for i, rec in enumerate(recommendations, 1):
                elements.append(Paragraph(f"• {rec}", self.styles['BodyText']))
        else:
            elements.append(Paragraph("No specific recommendations available.", self.styles['BodyText']))
        
        elements.append(Spacer(1, 20))
        
        return elements
    
    def create_visualization_section(self, visualizations: Dict[str, str]) -> List:
        """Create visualization section with embedded charts"""
        elements = []
        
        elements.append(Paragraph("DATA VISUALIZATIONS", self.styles['SectionHeader']))
        elements.append(Spacer(1, 12))
        
        for viz_name, viz_data in visualizations.items():
            if viz_data:
                try:
                    # Decode base64 image
                    img_data = base64.b64decode(viz_data)
                    img_buffer = io.BytesIO(img_data)
                    
                    # Create image element
                    img = Image(img_buffer, width=6*inch, height=4*inch)
                    elements.append(img)
                    elements.append(Spacer(1, 12))
                except Exception as e:
                    elements.append(Paragraph(f"Error loading visualization {viz_name}: {str(e)}", self.styles['BodyText']))
        
        return elements
    
    def generate_report(self, data: Dict[str, Any], output_path: str = None) -> bytes:
        """Generate comprehensive PDF report"""
        if not output_path:
            output_path = f"data_preprocessing_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        doc = SimpleDocTemplate(output_path, pagesize=A4, rightMargin=72, leftMargin=72, 
                               topMargin=72, bottomMargin=18)
        
        elements = []
        
        # Title page
        elements.append(Paragraph("DATA PREPROCESSING PIPELINE REPORT", self.styles['CustomTitle']))
        elements.append(Spacer(1, 20))
        elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", 
                                self.styles['BodyText']))
        elements.append(PageBreak())
        
        # Executive Summary
        elements.extend(self.create_executive_summary(data))
        elements.append(PageBreak())
        
        # Data Quality Analysis
        elements.extend(self.create_data_quality_section(data))
        elements.append(PageBreak())
        
        # Processing Steps
        elements.extend(self.create_processing_steps_section(data))
        elements.append(PageBreak())
        
        # Visualizations
        visualizations = data.get('visualizations', {})
        if visualizations:
            elements.extend(self.create_visualization_section(visualizations))
            elements.append(PageBreak())
        
        # Recommendations
        elements.extend(self.create_recommendations_section(data))
        
        # Build PDF
        doc.build(elements)
        
        # Return PDF as bytes
        with open(output_path, 'rb') as f:
            pdf_bytes = f.read()
        
        return pdf_bytes
