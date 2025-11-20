"""
Simple Chart Generator for Data Preprocessing Pipeline
Creates SVG-based charts without heavy dependencies
"""

import json
import base64
import random
from datetime import datetime, timedelta

class SimpleChartGenerator:
    def __init__(self):
        self.colors = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#6A994E', '#7209B7']
        
    def generate_data_distribution_chart(self, dataset_type='ecommerce-customers'):
        """Generate SVG data distribution chart"""
        if dataset_type == 'ecommerce-customers':
            # Generate realistic e-commerce data
            random.seed(42)
            
            # Age distribution data
            age_data = [random.randint(18, 80) for _ in range(1000)]
            age_bins = [0, 20, 30, 40, 50, 60, 70, 80]
            age_counts = [sum(1 for age in age_data if age_bins[i] <= age < age_bins[i+1]) for i in range(len(age_bins)-1)]
            
            # Purchase amount data
            amount_data = [random.lognormvariate(4.5, 0.8) for _ in range(1000)]
            amount_bins = [0, 50, 100, 200, 500, 1000, 2000]
            amount_counts = [sum(1 for amt in amount_data if amount_bins[i] <= amt < amount_bins[i+1]) for i in range(len(amount_bins)-1)]
            
            # Category data
            categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Sports', 'Beauty']
            category_counts = [300, 250, 200, 150, 50, 50]
            
            svg = f"""
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                <rect width="800" height="600" fill="#f8f9fa"/>
                <text x="400" y="30" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="#333">
                    E-commerce Customer Data Distribution
                </text>
                
                <!-- Age Distribution -->
                <text x="50" y="80" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Age Distribution</text>
                <g transform="translate(50, 100)">
                    {self._create_bar_chart(age_counts, age_bins[:-1], 300, 150, "Age Groups", "Count")}
                </g>
                
                <!-- Purchase Amount Distribution -->
                <text x="450" y="80" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Purchase Amount Distribution</text>
                <g transform="translate(450, 100)">
                    {self._create_bar_chart(amount_counts, amount_bins[:-1], 300, 150, "Amount ($)", "Count")}
                </g>
                
                <!-- Category Distribution -->
                <text x="50" y="350" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Category Distribution</text>
                <g transform="translate(50, 370)">
                    {self._create_pie_chart(category_counts, categories, 200, 200)}
                </g>
                
                <!-- Monthly Trend -->
                <text x="450" y="350" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Monthly Sales Trend</text>
                <g transform="translate(450, 370)">
                    {self._create_line_chart([800, 950, 1100, 1050, 1200, 1300, 1250, 1400, 1350, 1500, 1450, 1600], 
                                           ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 
                                           300, 200)}
                </g>
            </svg>
            """
            
        elif dataset_type == 'financial-transactions':
            # Generate financial data
            random.seed(42)
            
            # Transaction amounts
            amounts = [random.lognormvariate(3, 1.5) for _ in range(1000)]
            amount_bins = [0, 100, 500, 1000, 5000, 10000]
            amount_counts = [sum(1 for amt in amounts if amount_bins[i] <= amt < amount_bins[i+1]) for i in range(len(amount_bins)-1)]
            
            # Hourly pattern
            hourly_counts = [random.randint(20, 80) for _ in range(24)]
            
            # Transaction types
            types = ['Debit', 'Credit', 'Transfer']
            type_counts = [600, 300, 100]
            
            svg = f"""
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                <rect width="800" height="600" fill="#f8f9fa"/>
                <text x="400" y="30" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="#333">
                    Financial Transaction Data Distribution
                </text>
                
                <!-- Amount Distribution -->
                <text x="50" y="80" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Transaction Amount Distribution</text>
                <g transform="translate(50, 100)">
                    {self._create_bar_chart(amount_counts, amount_bins[:-1], 300, 150, "Amount ($)", "Count")}
                </g>
                
                <!-- Hourly Pattern -->
                <text x="450" y="80" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Hourly Transaction Pattern</text>
                <g transform="translate(450, 100)">
                    {self._create_bar_chart(hourly_counts, list(range(24)), 300, 150, "Hour", "Count")}
                </g>
                
                <!-- Transaction Types -->
                <text x="50" y="350" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Transaction Type Distribution</text>
                <g transform="translate(50, 370)">
                    {self._create_pie_chart(type_counts, types, 200, 200)}
                </g>
                
                <!-- Daily Volume -->
                <text x="450" y="350" font-family="Arial" font-size="16" font-weight="bold" fill="#333">Daily Volume Trend</text>
                <g transform="translate(450, 370)">
                    {self._create_line_chart([900, 1100, 1050, 1200, 1300, 1250, 1400, 1350, 1500, 1450, 1600, 1550, 1700, 1650, 1800], 
                                           list(range(15)), 300, 200)}
                </g>
            </svg>
            """
        
        return f"data:image/svg+xml;base64,{base64.b64encode(svg.encode()).decode()}"
    
    def generate_quality_metrics_chart(self):
        """Generate quality metrics radar chart"""
        metrics = ['Completeness', 'Uniqueness', 'Validity', 'Consistency', 'Accuracy', 'Timeliness']
        values = [94.2, 98.7, 91.5, 89.3, 87.8, 92.1]
        
        svg = f"""
        <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="400" fill="#f8f9fa"/>
            <text x="300" y="30" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#333">
                Data Quality Metrics
            </text>
            
            <!-- Radar Chart -->
            <g transform="translate(300, 200)">
                {self._create_radar_chart(values, metrics, 150)}
            </g>
            
            <!-- Bar Chart -->
            <g transform="translate(50, 50)">
                {self._create_bar_chart(values, metrics, 500, 300, "Metrics", "Score (%)")}
            </g>
        </svg>
        """
        
        return f"data:image/svg+xml;base64,{base64.b64encode(svg.encode()).decode()}"
    
    def generate_processing_trends_chart(self):
        """Generate processing trends chart"""
        # Generate 30 days of data
        dates = [(datetime.now() - timedelta(days=i)).strftime('%m/%d') for i in range(30, 0, -1)]
        datasets_processed = [random.randint(10, 25) for _ in range(30)]
        quality_scores = [random.uniform(85, 95) for _ in range(30)]
        
        svg = f"""
        <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
            <rect width="800" height="400" fill="#f8f9fa"/>
            <text x="400" y="30" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#333">
                Processing Trends Over Time
            </text>
            
            <!-- Datasets Processed -->
            <text x="50" y="60" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Datasets Processed</text>
            <g transform="translate(50, 80)">
                {self._create_line_chart(datasets_processed, dates, 700, 120)}
            </g>
            
            <!-- Quality Scores -->
            <text x="50" y="250" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Quality Scores (%)</text>
            <g transform="translate(50, 270)">
                {self._create_line_chart(quality_scores, dates, 700, 100)}
            </g>
        </svg>
        """
        
        return f"data:image/svg+xml;base64,{base64.b64encode(svg.encode()).decode()}"
    
    def generate_correlation_matrix(self, dataset_type='ecommerce-customers'):
        """Generate correlation matrix heatmap"""
        if dataset_type == 'ecommerce-customers':
            features = ['Age', 'Income', 'Purchase_Amount', 'Frequency', 'Satisfaction', 'Last_Purchase', 'Total_Orders']
            # Create correlation matrix
            corr_matrix = [
                [1.00, 0.45, 0.32, 0.12, 0.25, -0.15, 0.18],
                [0.45, 1.00, 0.60, 0.25, 0.30, -0.20, 0.22],
                [0.32, 0.60, 1.00, 0.40, 0.35, -0.25, 0.28],
                [0.12, 0.25, 0.40, 1.00, 0.20, -0.10, 0.15],
                [0.25, 0.30, 0.35, 0.20, 1.00, -0.18, 0.12],
                [-0.15, -0.20, -0.25, -0.10, -0.18, 1.00, -0.08],
                [0.18, 0.22, 0.28, 0.15, 0.12, -0.08, 1.00]
            ]
        else:
            features = ['Amount', 'Hour', 'Day_of_Week', 'Balance', 'Credit_Score', 'Frequency', 'Risk']
            corr_matrix = [
                [1.00, -0.15, -0.08, 0.45, 0.32, 0.12, -0.25],
                [-0.15, 1.00, 0.05, -0.10, -0.05, 0.20, 0.15],
                [-0.08, 0.05, 1.00, 0.02, 0.01, 0.18, 0.08],
                [0.45, -0.10, 0.02, 1.00, 0.60, 0.25, -0.30],
                [0.32, -0.05, 0.01, 0.60, 1.00, 0.15, -0.40],
                [0.12, 0.20, 0.18, 0.25, 0.15, 1.00, 0.10],
                [-0.25, 0.15, 0.08, -0.30, -0.40, 0.10, 1.00]
            ]
        
        svg = f"""
        <svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="600" fill="#f8f9fa"/>
            <text x="300" y="30" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#333">
                Feature Correlation Matrix
            </text>
            
            {self._create_heatmap(corr_matrix, features, 100, 100, 400, 400)}
        </svg>
        """
        
        return f"data:image/svg+xml;base64,{base64.b64encode(svg.encode()).decode()}"
    
    def generate_outlier_analysis(self, dataset_type='ecommerce-customers'):
        """Generate outlier analysis chart"""
        svg = f"""
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
            <rect width="800" height="600" fill="#f8f9fa"/>
            <text x="400" y="30" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#333">
                Outlier Analysis & Data Quality Issues
            </text>
            
            <!-- Box Plot -->
            <text x="50" y="80" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Purchase Amount Distribution</text>
            <g transform="translate(50, 100)">
                {self._create_box_plot([50, 100, 150, 200, 250, 300, 350, 400, 450, 500], 300, 100)}
            </g>
            
            <!-- Scatter Plot -->
            <text x="450" y="80" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Outlier Detection</text>
            <g transform="translate(450, 100)">
                {self._create_scatter_plot(100, 100)}
            </g>
            
            <!-- Missing Values Pattern -->
            <text x="50" y="280" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Missing Values Pattern</text>
            <g transform="translate(50, 300)">
                {self._create_missing_pattern(200, 100)}
            </g>
            
            <!-- Quality Issues -->
            <text x="450" y="280" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Data Quality Issues by Type</text>
            <g transform="translate(450, 300)">
                {self._create_bar_chart([45, 32, 28, 22, 15], 
                                       ['Missing', 'Outliers', 'Duplicates', 'Inconsistencies', 'Format'], 
                                       300, 100, "Issue Type", "Count")}
            </g>
        </svg>
        """
        
        return f"data:image/svg+xml;base64,{base64.b64encode(svg.encode()).decode()}"
    
    def generate_processing_performance_chart(self):
        """Generate processing performance chart"""
        dataset_sizes = ['Small', 'Medium', 'Large', 'XLarge']
        processing_times = [30, 120, 480, 1200]
        
        # Memory usage over time
        memory_usage = [100 + 50 * random.random() for _ in range(30)]
        
        # CPU utilization
        cpu_usage = [70 + 20 * random.random() for _ in range(30)]
        
        # Success rates
        steps = ['Loading', 'Cleaning', 'Encoding', 'Scaling', 'Validation']
        success_rates = [98.5, 95.2, 97.8, 99.1, 96.7]
        
        svg = f"""
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
            <rect width="800" height="600" fill="#f8f9fa"/>
            <text x="400" y="30" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#333">
                Processing Performance Analysis
            </text>
            
            <!-- Processing Time by Size -->
            <text x="50" y="80" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Processing Time by Dataset Size</text>
            <g transform="translate(50, 100)">
                {self._create_bar_chart(processing_times, dataset_sizes, 300, 120, "Dataset Size", "Time (s)")}
            </g>
            
            <!-- Memory Usage -->
            <text x="450" y="80" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Memory Usage Over Time</text>
            <g transform="translate(450, 100)">
                {self._create_line_chart(memory_usage, list(range(30)), 300, 120)}
            </g>
            
            <!-- CPU Utilization -->
            <text x="50" y="280" font-family="Arial" font-size="14" font-weight="bold" fill="#333">CPU Utilization</text>
            <g transform="translate(50, 300)">
                {self._create_line_chart(cpu_usage, list(range(30)), 300, 120)}
            </g>
            
            <!-- Success Rates -->
            <text x="450" y="280" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Success Rate by Step</text>
            <g transform="translate(450, 300)">
                {self._create_bar_chart(success_rates, steps, 300, 120, "Processing Step", "Success Rate (%)")}
            </g>
        </svg>
        """
        
        return f"data:image/svg+xml;base64,{base64.b64encode(svg.encode()).decode()}"
    
    def _create_bar_chart(self, values, labels, width, height, x_label="", y_label=""):
        """Create SVG bar chart"""
        if not values:
            return ""
        
        max_val = max(values)
        bar_width = width // len(values)
        
        bars = []
        for i, (val, label) in enumerate(zip(values, labels)):
            bar_height = (val / max_val) * height
            x = i * bar_width
            y = height - bar_height
            
            bars.append(f"""
                <rect x="{x}" y="{y}" width="{bar_width-2}" height="{bar_height}" 
                      fill="{self.colors[i % len(self.colors)]}" stroke="#333" stroke-width="1"/>
                <text x="{x + bar_width//2}" y="{height + 15}" text-anchor="middle" 
                      font-family="Arial" font-size="10" fill="#333">{label}</text>
                <text x="{x + bar_width//2}" y="{y - 5}" text-anchor="middle" 
                      font-family="Arial" font-size="10" fill="#333">{val}</text>
            """)
        
        return f"""
            <rect x="0" y="0" width="{width}" height="{height}" fill="white" stroke="#333" stroke-width="1"/>
            {''.join(bars)}
        """
    
    def _create_line_chart(self, values, labels, width, height):
        """Create SVG line chart"""
        if not values:
            return ""
        
        max_val = max(values)
        min_val = min(values)
        val_range = max_val - min_val if max_val != min_val else 1
        
        points = []
        for i, val in enumerate(values):
            x = (i / (len(values) - 1)) * width if len(values) > 1 else width // 2
            y = height - ((val - min_val) / val_range) * height
            points.append(f"{x},{y}")
        
        path_data = f"M {points[0]} " + " ".join([f"L {point}" for point in points[1:]])
        
        return f"""
            <rect x="0" y="0" width="{width}" height="{height}" fill="white" stroke="#333" stroke-width="1"/>
            <path d="{path_data}" fill="none" stroke="{self.colors[0]}" stroke-width="2"/>
            {''.join([f'<circle cx="{point.split(",")[0]}" cy="{point.split(",")[1]}" r="3" fill="{self.colors[0]}"/>' for point in points])}
        """
    
    def _create_pie_chart(self, values, labels, width, height):
        """Create SVG pie chart"""
        if not values:
            return ""
        
        total = sum(values)
        center_x, center_y = width // 2, height // 2
        radius = min(width, height) // 3
        
        current_angle = 0
        slices = []
        
        for i, (val, label) in enumerate(zip(values, labels)):
            percentage = val / total
            angle = percentage * 360
            
            start_angle = current_angle
            end_angle = current_angle + angle
            
            # Convert to radians
            start_rad = math.radians(start_angle - 90)
            end_rad = math.radians(end_angle - 90)
            
            # Calculate arc path
            x1 = center_x + radius * math.cos(start_rad)
            y1 = center_y + radius * math.sin(start_rad)
            x2 = center_x + radius * math.cos(end_rad)
            y2 = center_y + radius * math.sin(end_rad)
            
            large_arc = 1 if angle > 180 else 0
            
            path = f"M {center_x} {center_y} L {x1} {y1} A {radius} {radius} 0 {large_arc} 1 {x2} {y2} Z"
            
            slices.append(f"""
                <path d="{path}" fill="{self.colors[i % len(self.colors)]}" stroke="#333" stroke-width="1"/>
                <text x="{center_x + (radius + 20) * math.cos(math.radians(start_angle + angle/2 - 90))}" 
                      y="{center_y + (radius + 20) * math.sin(math.radians(start_angle + angle/2 - 90))}" 
                      text-anchor="middle" font-family="Arial" font-size="10" fill="#333">{label}</text>
            """)
            
            current_angle += angle
        
        return f"""
            <rect x="0" y="0" width="{width}" height="{height}" fill="white" stroke="#333" stroke-width="1"/>
            {''.join(slices)}
        """
    
    def _create_radar_chart(self, values, labels, radius):
        """Create SVG radar chart"""
        if not values:
            return ""
        
        center_x, center_y = radius, radius
        num_points = len(values)
        angle_step = 360 / num_points
        
        # Create grid circles
        grid_circles = []
        for i in range(1, 6):
            r = radius * i / 5
            grid_circles.append(f'<circle cx="{center_x}" cy="{center_y}" r="{r}" fill="none" stroke="#ddd" stroke-width="1"/>')
        
        # Create axis lines
        axis_lines = []
        for i in range(num_points):
            angle = math.radians(i * angle_step - 90)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)
            axis_lines.append(f'<line x1="{center_x}" y1="{center_y}" x2="{x}" y2="{y}" stroke="#ddd" stroke-width="1"/>')
        
        # Create data polygon
        points = []
        for i, val in enumerate(values):
            angle = math.radians(i * angle_step - 90)
            r = radius * val / 100
            x = center_x + r * math.cos(angle)
            y = center_y + r * math.sin(angle)
            points.append(f"{x},{y}")
        
        polygon_path = f"M {points[0]} " + " ".join([f"L {point}" for point in points[1:]]) + " Z"
        
        # Add labels
        label_texts = []
        for i, label in enumerate(labels):
            angle = math.radians(i * angle_step - 90)
            x = center_x + (radius + 20) * math.cos(angle)
            y = center_y + (radius + 20) * math.sin(angle)
            label_texts.append(f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Arial" font-size="10" fill="#333">{label}</text>')
        
        return f"""
            {''.join(grid_circles)}
            {''.join(axis_lines)}
            <polygon points="{','.join(points)}" fill="{self.colors[0]}" fill-opacity="0.3" stroke="{self.colors[0]}" stroke-width="2"/>
            {''.join(label_texts)}
        """
    
    def _create_heatmap(self, matrix, labels, x, y, width, height):
        """Create SVG heatmap"""
        rows = len(matrix)
        cols = len(matrix[0]) if matrix else 0
        
        cell_width = width // cols
        cell_height = height // rows
        
        cells = []
        for i, row in enumerate(matrix):
            for j, val in enumerate(row):
                # Color based on value (-1 to 1)
                intensity = (val + 1) / 2  # Normalize to 0-1
                color = f"rgb({int(255 * (1 - intensity))}, {int(255 * intensity)}, 0)"
                
                cell_x = x + j * cell_width
                cell_y = y + i * cell_height
                
                cells.append(f"""
                    <rect x="{cell_x}" y="{cell_y}" width="{cell_width}" height="{cell_height}" 
                          fill="{color}" stroke="#333" stroke-width="1"/>
                    <text x="{cell_x + cell_width//2}" y="{cell_y + cell_height//2}" 
                          text-anchor="middle" font-family="Arial" font-size="8" fill="#333">{val:.2f}</text>
                """)
        
        # Add labels
        label_texts = []
        for i, label in enumerate(labels):
            # X-axis labels
            label_texts.append(f'<text x="{x + i * cell_width + cell_width//2}" y="{y + height + 15}" text-anchor="middle" font-family="Arial" font-size="10" fill="#333">{label}</text>')
            # Y-axis labels
            label_texts.append(f'<text x="{x - 10}" y="{y + i * cell_height + cell_height//2}" text-anchor="end" font-family="Arial" font-size="10" fill="#333">{label}</text>')
        
        return f"""
            <rect x="{x}" y="{y}" width="{width}" height="{height}" fill="white" stroke="#333" stroke-width="1"/>
            {''.join(cells)}
            {''.join(label_texts)}
        """
    
    def _create_box_plot(self, values, width, height):
        """Create SVG box plot"""
        if not values:
            return ""
        
        values.sort()
        q1_idx = len(values) // 4
        q3_idx = 3 * len(values) // 4
        median_idx = len(values) // 2
        
        q1 = values[q1_idx]
        median = values[median_idx]
        q3 = values[q3_idx]
        min_val = values[0]
        max_val = values[-1]
        
        # Scale values to fit width
        val_range = max_val - min_val if max_val != min_val else 1
        scale = width / val_range
        
        def scale_val(val):
            return (val - min_val) * scale
        
        box_x = scale_val(q1)
        box_width = scale_val(q3) - scale_val(q1)
        
        return f"""
            <rect x="0" y="0" width="{width}" height="{height}" fill="white" stroke="#333" stroke-width="1"/>
            <line x1="{scale_val(min_val)}" y1="{height//2}" x2="{scale_val(max_val)}" y2="{height//2}" stroke="#333" stroke-width="2"/>
            <rect x="{box_x}" y="{height//4}" width="{box_width}" height="{height//2}" fill="{self.colors[0]}" stroke="#333" stroke-width="1"/>
            <line x1="{scale_val(median)}" y1="{height//4}" x2="{scale_val(median)}" y2="{3*height//4}" stroke="#333" stroke-width="2"/>
        """
    
    def _create_scatter_plot(self, width, height):
        """Create SVG scatter plot"""
        points = []
        for _ in range(50):
            x = random.uniform(0, width)
            y = random.uniform(0, height)
            color = self.colors[random.randint(0, len(self.colors)-1)]
            points.append(f'<circle cx="{x}" cy="{y}" r="3" fill="{color}"/>')
        
        return f"""
            <rect x="0" y="0" width="{width}" height="{height}" fill="white" stroke="#333" stroke-width="1"/>
            {''.join(points)}
        """
    
    def _create_missing_pattern(self, width, height):
        """Create SVG missing values pattern"""
        cells = []
        for i in range(10):
            for j in range(20):
                x = j * (width // 20)
                y = i * (height // 10)
                cell_width = width // 20
                cell_height = height // 10
                
                color = "#ff6b6b" if random.random() < 0.1 else "#51cf66"
                cells.append(f'<rect x="{x}" y="{y}" width="{cell_width}" height="{cell_height}" fill="{color}" stroke="#333" stroke-width="0.5"/>')
        
        return f"""
            <rect x="0" y="0" width="{width}" height="{height}" fill="white" stroke="#333" stroke-width="1"/>
            {''.join(cells)}
        """

# Import math for calculations
import math
