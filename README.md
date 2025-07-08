# TARGET JIT: Inventory Management System with AI/ML

TARGET JIT is a comprehensive software solution designed to efficiently manage inventory comprising over 2000 Stock Keeping Units (SKUs). The project leverages machine learning techniques and a robust full-stack architecture to provide a data-driven approach to enhance inventory management, minimize waste, and improve operational efficiency.

## Features

1. **SKU Categorization**:
   - Automatically classifies items into fast-moving, slow-moving, and obsolete categories
   - Helps prioritize restocking decisions

2. **Inventory Forecasting**:
   - Predicts demand trends for different SKUs using historical sales data
   - Ensures optimal stock levels and prevents overstocking or stockouts

3. **Just-In-Time Inventory Management**:
   - Supports JIT principles to align stock availability with real-time demand
   - Minimizes holding costs and maximizes inventory turnover

4. **Analytics Dashboard**:
   - Provides an interactive dashboard for visualizing inventory performance metrics
   - Key metrics include stock turnover ratio, SKU classification, and demand predictions

5. **Reorder Alerts**:
   - Notifies users when stock levels fall below the reorder threshold
   - Reduces the risk of stockouts

6. **Custom Reporting**:
   - Generates detailed reports on inventory trends, sales performance, and restocking schedules
   - Enables data-driven decision-making

7. **User Management**:
   - Multi-user functionality with role-based access control
   - Ensures data security and streamlined collaboration

## Machine Learning Models

The project uses various ML models for the following tasks:

1. **Demand Forecasting**:
   - ARIMA (AutoRegressive Integrated Moving Average)
   - LSTM (Long Short-Term Memory) neural networks

2. **SKU Categorization**:
   - K-Means Clustering

3. **Anomaly Detection**:
   - Isolation Forest

4. **Optimization**:
   - Linear Programming (LP)

## Installation

1. Clone the repository:
   \`\`\`
   git clone https://github.com/yourusername/target-jit.git
   cd target-jit
   \`\`\`

2. Install the required dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`

3. Run the application:
   \`\`\`
   streamlit run app.py
   \`\`\`

## Usage

1. **Dashboard**: View key inventory metrics and performance indicators
2. **SKU Categorization**: Classify inventory items based on sales velocity and turnover rate
3. **Demand Forecasting**: Predict future demand for inventory items
4. **Anomaly Detection**: Identify irregularities in inventory data
5. **Inventory Optimization**: Optimize inventory levels to minimize costs

## Project Structure

\`\`\`
target-jit/
├── app.py                  # Main Streamlit application
├── ml_models/              # Machine learning model implementations
│   ├── sku_categorization.py
│   ├── demand_forecasting.py
│   ├── anomaly_detection.py
│   └── inventory_optimization.py
├── models/                 # Saved model files (created at runtime)
├── requirements.txt        # Project dependencies
└── README.md               # Project documentation
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
