"""
TARGET JIT: Inventory Management System with AI/ML

This is the main application file that integrates the ML models and provides
a web interface using Streamlit.
"""

import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import sys
import joblib
from datetime import datetime, timedelta

# Add the ml_models directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml_models'))

# Import ML models
from sku_categorization import SKUCategorizer
from demand_forecasting import DemandForecaster
from anomaly_detection import AnomalyDetector
from inventory_optimization import InventoryOptimizer

# Set page config
st.set_page_config(
    page_title="TARGET JIT - Inventory Management",
    page_icon="📦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Define functions for data generation and processing

def generate_sample_data(n_samples=2000):
    """Generate sample inventory data for demonstration."""
    np.random.seed(42)
    
    # Create date range for the past 2 years
    end_date = datetime.now()
    start_date = end_date - timedelta(days=730)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # Create SKU IDs
    sku_ids = [f'SKU-{i:04d}' for i in range(1, n_samples + 1)]
    
    # Create categories
    categories = ['Electronics', 'Clothing', 'Food', 'Home Goods', 'Office Supplies']
    sku_categories = np.random.choice(categories, size=n_samples)
    
    # Create price data
    unit_costs = np.random.uniform(10, 100, n_samples)
    
    # Create inventory parameters
    lead_times = np.random.uniform(1, 14, n_samples)
    lead_time_stds = np.random.uniform(0.2, 3, n_samples)
    ordering_costs = np.random.uniform(50, 200, n_samples)
    
    # Create sales velocity and turnover rate with different distributions for each category
    sales_velocity = np.zeros(n_samples)
    turnover_rate = np.zeros(n_samples)
    
    for i, category in enumerate(categories):
        mask = sku_categories == category
        if category == 'Electronics':
            sales_velocity[mask] = np.random.normal(50, 20, size=mask.sum())
            turnover_rate[mask] = np.random.beta(5, 2, size=mask.sum())
        elif category == 'Clothing':
            sales_velocity[mask] = np.random.normal(80, 30, size=mask.sum())
            turnover_rate[mask] = np.random.beta(4, 3, size=mask.sum())
        elif category == 'Food':
            sales_velocity[mask] = np.random.normal(120, 40, size=mask.sum())
            turnover_rate[mask] = np.random.beta(8, 2, size=mask.sum())
        elif category == 'Home Goods':
            sales_velocity[mask] = np.random.normal(30, 15, size=mask.sum())
            turnover_rate[mask] = np.random.beta(3, 4, size=mask.sum())
        else:  # Office Supplies
            sales_velocity[mask] = np.random.normal(40, 10, size=mask.sum())
            turnover_rate[mask] = np.random.beta(4, 4, size=mask.sum())
    
    # Ensure positive values
    sales_velocity = np.maximum(sales_velocity, 1)
    turnover_rate = np.clip(turnover_rate, 0.01, 0.99)
    
    # Create current stock levels
    current_stock = np.random.normal(500, 200, n_samples)
    current_stock = np.maximum(current_stock, 0).astype(int)
    
    # Create reorder points
    reorder_points = np.random.normal(200, 50, n_samples)
    reorder_points = np.maximum(reorder_points, 0).astype(int)
    
    # Create DataFrame
    inventory_data = pd.DataFrame({
        'sku_id': sku_ids,
        'category': sku_categories,
        'unit_cost': unit_costs,
        'lead_time': lead_times,
        'lead_time_std': lead_time_stds,
        'ordering_cost': ordering_costs,
        'sales_velocity': sales_velocity,
        'turnover_rate': turnover_rate,
        'current_stock': current_stock,
        'reorder_point': reorder_points
    })
    
    # Generate historical sales data
    sales_data = []
    
    for sku_id, category, velocity in zip(sku_ids, sku_categories, sales_velocity):
        # Base demand for this SKU
        base_demand = velocity
        
        # Generate daily sales with seasonality and trend
        for date in dates:
            # Add seasonality (weekly pattern)
            day_of_week = date.dayofweek
            weekday_factor = 1.0 + 0.2 * (day_of_week < 5)  # Higher on weekdays
            
            # Add seasonality (monthly pattern)
            month = date.month
            monthly_factor = 1.0 + 0.1 * np.sin(2 * np.pi * month / 12)
            
            # Add trend (slight increase over time)
            days_since_start = (date - start_date).days
            trend_factor = 1.0 + 0.0005 * days_since_start
            
            # Calculate expected demand
            expected_demand = base_demand * weekday_factor * monthly_factor * trend_factor
            
            # Add random noise
            actual_demand = np.random.poisson(expected_demand)
            
            # Add to sales data
            sales_data.append({
                'date': date,
                'sku_id': sku_id,
                'category': category,
                'quantity': actual_demand
            })
    
    sales_df = pd.DataFrame(sales_data)
    
    return inventory_data, sales_df

def categorize_skus(data):
    """Categorize SKUs using K-means clustering."""
    # Check if model exists, otherwise train a new one
    model_path = 'models/sku_categorizer.joblib'
    
    if os.path.exists(model_path):
        categorizer = SKUCategorizer.load_model(model_path)
    else:
        # Create directory if it doesn't exist
        os.makedirs('models', exist_ok=True)
        
        # Create and train a new categorizer
        categorizer = SKUCategorizer()
        categorizer.fit(data)
        categorizer.save_model(model_path)
    
    # Predict categories
    result = categorizer.predict(data)
    
    return result

def forecast_demand(data, sku_id=None):
    """Forecast demand using time series models."""
    # Prepare data
    if sku_id:
        data = data[data['sku_id'] == sku_id]
    
    # Aggregate by date
    data = data.groupby('date')['quantity'].sum().reset_index()
    
    # Check if model exists, otherwise train a new one
    model_path = 'models/arima_forecaster'
    
    if os.path.exists(model_path):
        forecaster = DemandForecaster.load_model(model_path, method='arima')
    else:
        # Create directory if it doesn't exist
        os.makedirs('models', exist_ok=True)
        
        # Create and train a new forecaster
        forecaster = DemandForecaster(method='arima')
        forecaster.fit(data, date_column='date', demand_column='quantity')
        forecaster.save_model(model_path)
    
    # Generate forecasts
    forecast_horizon = 30  # 30 days
    forecasts = forecaster.forecast(steps=forecast_horizon)
    
    # Create forecast DataFrame
    last_date = data['date'].max()
    forecast_dates = pd.date_range(start=last_date + timedelta(days=1), periods=forecast_horizon)
    
    forecast_df = pd.DataFrame({
        'date': forecast_dates,
        'forecast': forecasts
    })
    
    return forecast_df

def detect_anomalies(data):
    """Detect anomalies in inventory data."""
    # Check if model exists, otherwise train a new one
    model_path = 'models/anomaly_detector.joblib'
    
    if os.path.exists(model_path):
        detector = AnomalyDetector.load_model(model_path)
    else:
        # Create directory if it doesn't exist
        os.makedirs('models', exist_ok=True)
        
        # Create and train a new detector
        detector = AnomalyDetector(method='isolation_forest', contamination=0.05)
        detector.fit(data, features=['sales_velocity', 'turnover_rate', 'current_stock'])
        detector.save_model(model_path)
    
    # Predict anomalies
    result = detector.predict(data)
    
    # Get anomaly scores
    result = detector.get_anomaly_scores(result)
    
    return result

def optimize_inventory(data):
    """Optimize inventory levels using linear programming."""
    # Prepare data
    optimization_data = data.copy()
    
    # Add required columns
    optimization_data['demand_mean'] = optimization_data['sales_velocity'] * 365  # Annual demand
    optimization_data['demand_std'] = optimization_data['demand_mean'] * 0.2  # Assume 20% variation
    optimization_data['lead_time_mean'] = optimization_data['lead_time']
    
    # Create optimizer
    optimizer = InventoryOptimizer()
    
    # Optimize inventory levels
    result = optimizer.optimize_inventory_levels(optimization_data)
    
    return result

# Main application
def main():
    # Sidebar
    st.sidebar.title("TARGET JIT")
    st.sidebar.subheader("Inventory Management System")
    
    # Navigation
    page = st.sidebar.selectbox(
        "Navigation",
        ["Dashboard", "SKU Categorization", "Demand Forecasting", "Anomaly Detection", "Inventory Optimization"]
    )
    
    # Generate or load data
    if 'inventory_data' not in st.session_state or 'sales_data' not in st.session_state:
        with st.spinner("Generating sample data..."):
            inventory_data, sales_data = generate_sample_data()
            st.session_state.inventory_data = inventory_data
            st.session_state.sales_data = sales_data
    else:
        inventory_data = st.session_state.inventory_data
        sales_data = st.session_state.sales_data
    
    # Dashboard
    if page == "Dashboard":
        st.title("Inventory Dashboard")
        
        # Key metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total SKUs", f"{len(inventory_data):,}")
        
        with col2:
            total_stock = inventory_data['current_stock'].sum()
            st.metric("Total Stock", f"{total_stock:,}")
        
        with col3:
            below_reorder = (inventory_data['current_stock'] < inventory_data['reorder_point']).sum()
            st.metric("Items Below Reorder Point", f"{below_reorder:,}")
        
        with col4:
            avg_turnover = inventory_data['turnover_rate'].mean()
            st.metric("Average Turnover Rate", f"{avg_turnover:.2f}")
        
        # Stock by category
        st.subheader("Stock by Category")
        category_stock = inventory_data.groupby('category')['current_stock'].sum().reset_index()
        
        fig, ax = plt.subplots(figsize=(10, 6))
        sns.barplot(x='category', y='current_stock', data=category_stock, ax=ax)
        ax.set_xlabel('Category')
        ax.set_ylabel('Current Stock')
        ax.set_title('Total Stock by Category')
        st.pyplot(fig)
        
        # Recent sales trend
        st.subheader("Recent Sales Trend")
        
        # Aggregate daily sales
        daily_sales = sales_data.groupby('date')['quantity'].sum().reset_index()
        daily_sales = daily_sales.sort_values('date')
        
        # Get last 30 days
        last_30_days = daily_sales.tail(30)
        
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.plot(last_30_days['date'], last_30_days['quantity'])
        ax.set_xlabel('Date')
        ax.set_ylabel('Units Sold')
        ax.set_title('Sales Trend (Last 30 Days)')
        fig.autofmt_xdate()
        st.pyplot(fig)
        
        # Inventory table
        st.subheader("Inventory Overview")
        st.dataframe(inventory_data.head(10))
    
    # SKU Categorization
    elif page == "SKU Categorization":
        st.title("SKU Categorization")
        st.write("Categorize inventory items into fast-moving, medium-moving, and slow-moving categories.")
        
        # Run categorization
        if st.button("Run Categorization"):
            with st.spinner("Categorizing SKUs..."):
                categorized_data = categorize_skus(inventory_data)
                st.session_state.categorized_data = categorized_data
        
        # Display results
        if 'categorized_data' in st.session_state:
            categorized_data = st.session_state.categorized_data
            
            # Summary
            st.subheader("Categorization Summary")
            category_counts = categorized_data['category'].value_counts()
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("Fast-Moving Items", f"{category_counts.get('fast-moving', 0):,}")
            
            with col2:
                st.metric("Medium-Moving Items", f"{category_counts.get('medium-moving', 0):,}")
            
            with col3:
                st.metric("Slow-Moving Items", f"{category_counts.get('slow-moving', 0):,}")
            
            # Visualization
            st.subheader("Category Distribution")
            
            fig, ax = plt.subplots(figsize=(10, 6))
            sns.countplot(x='category', data=categorized_data, ax=ax)
            ax.set_xlabel('Category')
            ax.set_ylabel('Count')
            ax.set_title('SKU Category Distribution')
            st.pyplot(fig)
            
            # Scatter plot
            st.subheader("SKU Categorization Visualization")
            
            fig, ax = plt.subplots(figsize=(10, 6))
            
            for category, color in zip(['fast-moving', 'medium-moving', 'slow-moving'], ['green', 'blue', 'red']):
                subset = categorized_data[categorized_data['category'] == category]
                ax.scatter(subset['sales_velocity'], subset['turnover_rate'], label=category, alpha=0.7, color=color)
            
            ax.set_xlabel('Sales Velocity')
            ax.set_ylabel('Turnover Rate')
            ax.set_title('SKU Categorization by Sales Velocity and Turnover Rate')
            ax.legend()
            ax.grid(True, linestyle='--', alpha=0.7)
            st.pyplot(fig)
            
            # Table
            st.subheader("Categorized SKUs")
            st.dataframe(categorized_data)
    
    # Demand Forecasting
    elif page == "Demand Forecasting":
        st.title("Demand Forecasting")
        st.write("Predict future demand for inventory items using time series analysis.")
        
        # SKU selection
        all_skus = inventory_data['sku_id'].tolist()
        selected_sku = st.selectbox("Select SKU for Forecasting", ["All SKUs"] + all_skus)
        
        # Run forecasting
        if st.button("Generate Forecast"):
            with st.spinner("Generating forecast..."):
                if selected_sku == "All SKUs":
                    forecast_df = forecast_demand(sales_data)
                else:
                    forecast_df = forecast_demand(sales_data, sku_id=selected_sku)
                
                st.session_state.forecast_df = forecast_df
                st.session_state.selected_sku = selected_sku
        
        # Display results
        if 'forecast_df' in st.session_state:
            forecast_df = st.session_state.forecast_df
            
            # Summary
            st.subheader("Forecast Summary")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                avg_forecast = forecast_df['forecast'].mean()
                st.metric("Average Daily Forecast", f"{avg_forecast:.2f}")
            
            with col2:
                total_forecast = forecast_df['forecast'].sum()
                st.metric("Total Forecast (30 Days)", f"{total_forecast:.2f}")
            
            with col3:
                max_forecast = forecast_df['forecast'].max()
                st.metric("Peak Daily Forecast", f"{max_forecast:.2f}")
            
            # Visualization
            st.subheader("Demand Forecast")
            
            fig, ax = plt.subplots(figsize=(12, 6))
            ax.plot(forecast_df['date'], forecast_df['forecast'])
            ax.set_xlabel('Date')
            ax.set_ylabel('Forecasted Demand')
            
            if st.session_state.selected_sku == "All SKUs":
                ax.set_title('Demand Forecast for All SKUs (Next 30 Days)')
            else:
                ax.set_title(f'Demand Forecast for {st.session_state.selected_sku} (Next 30 Days)')
            
            fig.autofmt_xdate()
            ax.grid(True, linestyle='--', alpha=0.7)
            st.pyplot(fig)
            
            # Table
            st.subheader("Forecast Data")
            st.dataframe(forecast_df)
    
    # Anomaly Detection
    elif page == "Anomaly Detection":
        st.title("Anomaly Detection")
        st.write("Detect irregularities in inventory data to identify errors or unusual patterns.")
        
        # Run anomaly detection
        if st.button("Detect Anomalies"):
            with st.spinner("Detecting anomalies..."):
                anomaly_data = detect_anomalies(inventory_data)
                st.session_state.anomaly_data = anomaly_data
        
        # Display results
        if 'anomaly_data' in st.session_state:
            anomaly_data = st.session_state.anomaly_data
            
            # Summary
            st.subheader("Anomaly Detection Summary")
            
            anomaly_count = anomaly_data['anomaly'].sum()
            anomaly_percentage = anomaly_count / len(anomaly_data) * 100
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.metric("Anomalies Detected", f"{anomaly_count:,}")
            
            with col2:
                st.metric("Anomaly Percentage", f"{anomaly_percentage:.2f}%")
            
            # Visualization
            st.subheader("Anomaly Visualization")
            
            fig, ax = plt.subplots(figsize=(12, 8))
            
            # Plot normal points
            normal_data = anomaly_data[~anomaly_data['anomaly']]
            ax.scatter(
                normal_data['sales_velocity'],
                normal_data['current_stock'],
                label='Normal',
                alpha=0.7,
                color='blue'
            )
            
            # Plot anomalies
            anomalous_data = anomaly_data[anomaly_data['anomaly']]
            ax.scatter(
                anomalous_data['sales_velocity'],
                anomalous_data['current_stock'],
                label='Anomaly',
                alpha=0.7,
                color='red'
            )
            
            ax.set_xlabel('Sales Velocity')
            ax.set_ylabel('Current Stock')
            ax.set_title('Anomaly Detection')
            ax.legend()
            ax.grid(True, linestyle='--', alpha=0.7)
            st.pyplot(fig)
            
            # Table of anomalies
            st.subheader("Detected Anomalies")
            st.dataframe(anomalous_data)
    
    # Inventory Optimization
    elif page == "Inventory Optimization":
        st.title("Inventory Optimization")
        st.write("Optimize inventory levels to minimize costs while maintaining service levels.")
        
        # Run optimization
        if st.button("Optimize Inventory"):
            with st.spinner("Optimizing inventory levels..."):
                optimized_data = optimize_inventory(inventory_data)
                st.session_state.optimized_data = optimized_data
        
        # Display results
        if 'optimized_data' in st.session_state:
            optimized_data = st.session_state.optimized_data
            
            # Summary
            st.subheader("Optimization Summary")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                avg_eoq = optimized_data['eoq'].mean()
                st.metric("Average EOQ", f"{avg_eoq:.2f}")
            
            with col2:
                avg_rop = optimized_data['reorder_point'].mean()
                st.metric("Average Reorder Point", f"{avg_rop:.2f}")
            
            with col3:
                total_cost = optimized_data['total_annual_cost'].sum()
                st.metric("Total Annual Cost", f"${total_cost:,.2f}")
            
            # Visualization
            st.subheader("Optimization Results")
            
            # EOQ vs Demand
            fig, ax = plt.subplots(figsize=(10, 6))
            ax.scatter(optimized_data['demand_mean'], optimized_data['eoq'], alpha=0.7)
            ax.set_xlabel('Annual Demand')
            ax.set_ylabel('Economic Order Quantity (EOQ)')
            ax.set_title('EOQ vs Annual Demand')
            ax.grid(True, linestyle='--', alpha=0.7)
            st.pyplot(fig)
            
            # Reorder Point vs Lead Time Demand
            fig, ax = plt.subplots(figsize=(10, 6))
            ax.scatter(optimized_data['lead_time_demand'], optimized_data['reorder_point'], alpha=0.7)
            ax.set_xlabel  optimized_data['reorder_point'], alpha=0.7)
            ax.set_xlabel('Lead Time Demand')
            ax.set_ylabel('Reorder Point')
            ax.set_title('Reorder Point vs Lead Time Demand')
            ax.grid(True, linestyle='--', alpha=0.7)
            st.pyplot(fig)
            
            # Cost breakdown
            fig, ax = plt.subplots(figsize=(10, 6))
            cost_data = [
                optimized_data['annual_holding_cost'].sum(),
                optimized_data['annual_ordering_cost'].sum()
            ]
            ax.bar(['Holding Cost', 'Ordering Cost'], cost_data)
            ax.set_ylabel('Cost ($)')
            ax.set_title('Total Annual Cost Breakdown')
            ax.grid(True, linestyle='--', alpha=0.7)
            st.pyplot(fig)
            
            # Table
            st.subheader("Optimized Inventory Parameters")
            st.dataframe(optimized_data[['sku_id', 'category', 'eoq', 'reorder_point', 'safety_stock', 'total_annual_cost']])

# Run the application
if __name__ == "__main__":
    main()
