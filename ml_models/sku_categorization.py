"""
SKU Categorization using K-Means Clustering

This module implements K-Means clustering to categorize inventory items
into fast-moving, medium-moving, and slow-moving categories based on
sales velocity and turnover rates.
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import joblib
import os

class SKUCategorizer:
    def __init__(self, n_clusters=3):
        """Initialize the SKU categorizer with the specified number of clusters."""
        self.n_clusters = n_clusters
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        self.scaler = StandardScaler()
        self.cluster_labels = ['fast-moving', 'medium-moving', 'slow-moving']
        
    def preprocess_data(self, data):
        """
        Preprocess the inventory data for clustering.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            DataFrame containing inventory data with at least 'sales_velocity' 
            and 'turnover_rate' columns.
            
        Returns:
        --------
        numpy.ndarray
            Scaled features for clustering
        """
        # Select relevant features for clustering
        features = data[['sales_velocity', 'turnover_rate']]
        
        # Scale the features
        scaled_features = self.scaler.fit_transform(features)
        
        return scaled_features
    
    def fit(self, data):
        """
        Fit the K-Means model to the data.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            DataFrame containing inventory data with at least 'sales_velocity' 
            and 'turnover_rate' columns.
        """
        scaled_features = self.preprocess_data(data)
        self.kmeans.fit(scaled_features)
        
        # Determine which cluster corresponds to which category based on centroids
        centroids = self.kmeans.cluster_centers_
        # Sort clusters by the sum of their centroid values (higher = faster moving)
        cluster_speeds = centroids.sum(axis=1)
        cluster_order = np.argsort(cluster_speeds)[::-1]
        
        # Map cluster indices to category labels
        self.cluster_mapping = {
            cluster_order[0]: 'fast-moving',
            cluster_order[1]: 'medium-moving',
            cluster_order[2]: 'slow-moving'
        }
        
    def predict(self, data):
        """
        Predict the category of each SKU in the data.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            DataFrame containing inventory data with at least 'sales_velocity' 
            and 'turnover_rate' columns.
            
        Returns:
        --------
        pandas.DataFrame
            Original data with an additional 'category' column.
        """
        scaled_features = self.preprocess_data(data)
        cluster_labels = self.kmeans.predict(scaled_features)
        
        # Map cluster indices to category labels
        data['category'] = [self.cluster_mapping[label] for label in cluster_labels]
        
        return data
    
    def visualize_clusters(self, data, save_path=None):
        """
        Visualize the clusters.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            DataFrame containing inventory data with at least 'sales_velocity' 
            and 'turnover_rate' columns, and a 'category' column.
        save_path : str, optional
            Path to save the visualization. If None, the plot is displayed.
        """
        plt.figure(figsize=(10, 8))
        
        # Plot each category with a different color
        for category in self.cluster_labels:
            category_data = data[data['category'] == category]
            plt.scatter(
                category_data['sales_velocity'], 
                category_data['turnover_rate'],
                label=category,
                alpha=0.7
            )
        
        # Plot centroids
        centroids = self.kmeans.cluster_centers_
        plt.scatter(
            centroids[:, 0], 
            centroids[:, 1], 
            s=300, 
            c='red', 
            marker='X', 
            label='Centroids'
        )
        
            c='red', 
            marker='X', 
            label='Centroids'
        )
        
        plt.title('SKU Categorization by Sales Velocity and Turnover Rate')
        plt.xlabel('Sales Velocity')
        plt.ylabel('Turnover Rate')
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
            'kmeans': self.kmeans,
            'scaler': self.scaler,
            'cluster_mapping': self.cluster_mapping,
            'n_clusters': self.n_clusters
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
        SKUCategorizer
            Loaded model.
        """
        model_data = joblib.load(path)
        
        categorizer = cls(n_clusters=model_data['n_clusters'])
        categorizer.kmeans = model_data['kmeans']
        categorizer.scaler = model_data['scaler']
        categorizer.cluster_mapping = model_data['cluster_mapping']
        
        return categorizer


# Example usage
if __name__ == "__main__":
    # Generate sample data
    np.random.seed(42)
    n_samples = 1000
    
    # Generate synthetic data with three distinct clusters
    sales_velocity_fast = np.random.normal(100, 20, size=int(n_samples * 0.3))
    turnover_rate_fast = np.random.normal(0.8, 0.1, size=int(n_samples * 0.3))
    
    sales_velocity_medium = np.random.normal(50, 15, size=int(n_samples * 0.5))
    turnover_rate_medium = np.random.normal(0.5, 0.1, size=int(n_samples * 0.5))
    
    sales_velocity_slow = np.random.normal(20, 10, size=n_samples - int(n_samples * 0.3) - int(n_samples * 0.5))
    turnover_rate_slow = np.random.normal(0.2, 0.1, size=n_samples - int(n_samples * 0.3) - int(n_samples * 0.5))
    
    # Combine data
    sales_velocity = np.concatenate([sales_velocity_fast, sales_velocity_medium, sales_velocity_slow])
    turnover_rate = np.concatenate([turnover_rate_fast, turnover_rate_medium, turnover_rate_slow])
    
    # Create DataFrame
    data = pd.DataFrame({
        'sku_id': [f'SKU-{i:04d}' for i in range(1, n_samples + 1)],
        'sales_velocity': sales_velocity,
        'turnover_rate': turnover_rate
    })
    
    # Clip turnover rate to be between 0 and 1
    data['turnover_rate'] = data['turnover_rate'].clip(0, 1)
    
    # Create and fit the categorizer
    categorizer = SKUCategorizer()
    categorizer.fit(data)
    
    # Predict categories
    categorized_data = categorizer.predict(data)
    
    # Print summary
    print("SKU Categorization Summary:")
    print(categorized_data['category'].value_counts())
    
    # Visualize the clusters
    categorizer.visualize_clusters(categorized_data)
    
    # Save the model
    os.makedirs('models', exist_ok=True)
    categorizer.save_model('models/sku_categorizer.joblib')
