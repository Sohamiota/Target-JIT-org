"""
Anomaly Detection for Inventory Data

This module implements anomaly detection algorithms to identify irregularities
in stock movement patterns, helping to detect errors or unusual demand spikes.
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os

class AnomalyDetector:
    def __init__(self, method='isolation_forest', contamination=0.05):
        """
        Initialize the anomaly detector.
        
        Parameters:
        -----------
        method : str
            Detection method to use ('isolation_forest' or 'z_score').
        contamination : float
            Expected proportion of anomalies in the data (for Isolation Forest).
        """
        self.method = method
        self.contamination = contamination
        self.model = None
        self.scaler = StandardScaler()
        
    def fit(self, data, features=None):
        """
        Fit the anomaly detection model to the data.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            DataFrame containing inventory data.
        features : list, optional
            List of feature columns to use for anomaly detection.
            If None, all numeric columns are used.
        """
        # Select features
        if features is None:
            features = data.select_dtypes(include=[np.number]).columns.tolist()
        
        X = data[features]
        
        # Scale the features
        X_scaled = self.scaler.fit_transform(X)
        
        if self.method == 'isolation_forest':
            self.model = IsolationForest(
                contamination=self.contamination,
                random_state=42
            )
            self.model.fit(X_scaled)
        
        # Store feature names
        self.features = features
    
    def predict(self, data):
        """
        Predict anomalies in the data.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            DataFrame containing inventory data.
            
        Returns:
        --------
        pandas.DataFrame
            Original data with an additional 'anomaly' column.
        """
        # Select features
        X = data[self.features]
        
        # Scale the features
        X_scaled = self.scaler.transform(X)
        
        if self.method == 'isolation_forest':
            # Predict anomalies (-1 for anomalies, 1 for normal)
            anomalies = self.model.predict(X_scaled)
            # Convert to boolean (True for anomalies)
            data['anomaly'] = anomalies == -1
        elif self.method == 'z_score':
            # Calculate Z-scores
            z_scores = np.abs(StandardScaler().fit_transform(X))
            # Mark as anomaly if any feature has Z-score > 3
            data['anomaly'] = (z_scores > 3).any(axis=1)
            # Store Z-scores
            for i, feature in enumerate(self.features):
                data[f'{feature}_z_score'] = z_scores[:, i]
        
        return data
    
    def get_anomaly_scores(self, data):
        """
        Get anomaly scores for the data.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            DataFrame containing inventory data.
            
        Returns:
        --------
        pandas.DataFrame
            Original data with an additional 'anomaly_score' column.
        """
        # Select features
        X = data[self.features]
        
        # Scale the features
        X_scaled = self.scaler.transform(X)
        
        if self.method == 'isolation_forest':
            # Get anomaly scores (negative scores indicate anomalies)
            scores = self.model.decision_function(X_scaled)
            # Convert to positive scores (higher = more anomalous)
            data['anomaly_score'] = -scores
        elif self.method == 'z_score':
            # Calculate max Z-score across features
            z_scores = np.abs(StandardScaler().fit_transform(X))
            data['anomaly_score'] = z_scores.max(axis=1)
        
        return data
    
    def visualize_anomalies(self, data, x_feature, y_feature, save_path=None):
        """
        Visualize anomalies in a scatter plot.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            DataFrame containing inventory data with an 'anomaly' column.
        x_feature : str
            Feature to plot on the x-axis.
        y_feature : str
            Feature to plot on the y-axis.
        save_path : str, optional
            Path to save the visualization. If None, the plot is displayed.
        """
        plt.figure(figsize=(10, 8))
        
        # Plot normal points
        normal_data = data[~data['anomaly']]
        plt.scatter(
            normal_data[x_feature],
            normal_data[y_feature],
            label='Normal',
            alpha=0.7
        )
        
        # Plot anomalies
        anomaly_data = data[data['anomaly']]
        plt.scatter(
            anomaly_data[x_feature],
            anomaly_data[y_feature],
            color='red',
            label='Anomaly',
            alpha=0.7
        )
        
        plt.title(f'Anomaly Detection ({self.method})')
        plt.xlabel(x_feature)
        plt.ylabel(y_feature)
        plt.legend()
        plt.grid(True, linestyle='--', alpha=0.7)
        
        if save_path:
            plt.savefig(save_path)
            plt.close()
        else:
            plt.show()
    
    def save_model(self, path):
        """
        Save the trained model to disk.
        
        Parameters:
        -----------
        path : str
            Path to save the model.
        """
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'method': self.method,
            'contamination': self.contamination,
            'features': self.features
        }
        joblib.dump(model_data, path)
    
    @classmethod
    def load_model(cls, path):
        """
        Load a trained model from disk.
        
        Parameters:
        -----------
        path : str
            Path to the saved model.
            
        Returns:
        --------
        AnomalyDetector
            Loaded model.
        """
        model_data = joblib.load(path)
        
        detector = cls(
            method=model_data['method'],
            contamination=model_data['contamination']
        )
        detector.model = model_data['model']
        detector.scaler = model_data['scaler']
        detector.features = model_data['features']
        
        return detector


# Example usage
if __name__ == "__main__":
    # Generate sample data
    np.random.seed(42)
    n_samples = 1000
    
    # Generate normal data
    stock_levels = np.random.normal(500, 100, size=n_samples)
    sales_velocity = np.random.normal(50, 10, size=n_samples)
    
    # Add some anomalies
    n_anomalies = 50
    anomaly_indices = np.random.choice(n_samples, n_anomalies, replace=False)
    
    # Extreme stock levels
    stock_levels[anomaly_indices[:20]] = np.random.normal(1000, 200, size=20)
    
    # Extreme sales velocity
    sales_velocity[anomaly_indices[20:40]] = np.random.normal(100, 20, size=20)
    
    # Both extreme
    stock_levels[anomaly_indices[40:]] = np.random.normal(1000, 200, size=10)
    sales_velocity[anomaly_indices[40:]] = np.random.normal(100, 20, size=10)
    
    # Create DataFrame
    data = pd.DataFrame({
        'sku_id': [f'SKU-{i:04d}' for i in range(1, n_samples + 1)],
        'stock_level': stock_levels,
        'sales_velocity': sales_velocity,
        'reorder_point': np.random.normal(200, 50, size=n_samples)
    })
    
    # Create and fit the anomaly detector
    detector = AnomalyDetector(method='isolation_forest', contamination=0.05)
    detector.fit(data, features=['stock_level', 'sales_velocity'])
    
    # Predict anomalies
    result = detector.predict(data)
    
    # Get anomaly scores
    result = detector.get_anomaly_scores(result)
    
    # Print summary
    print("Anomaly Detection Summary:")
    print(f"Total samples: {len(result)}")
    print(f"Anomalies detected: {result['anomaly'].sum()}")
    print(f"Anomaly rate: {result['anomaly'].mean():.2%}")
    
    # Visualize anomalies
    detector.visualize_anomalies(result, 'stock_level', 'sales_velocity')
    
    # Save the model
    os.makedirs('models', exist_ok=True)
    detector.save_model('models/anomaly_detector.joblib')
