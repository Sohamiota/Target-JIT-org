"""
Inventory Optimization using Linear Programming

This module implements linear programming techniques to optimize inventory levels,
reorder points, and safety stock to minimize costs while maintaining service levels.
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.optimize import linprog
import pulp
import joblib
import os

class InventoryOptimizer:
    def __init__(self, holding_cost_rate=0.25, stockout_cost_rate=0.5, service_level=0.95):
        """
        Initialize the inventory optimizer.
        
        Parameters:
        -----------
        holding_cost_rate : float
            Annual holding cost as a fraction of item value.
        stockout_cost_rate : float
            Stockout cost as a fraction of item value.
        service_level : float
            Target service level (probability of not stocking out).
        """
        self.holding_cost_rate = holding_cost_rate
        self.stockout_cost_rate = stockout_cost_rate
        self.service_level = service_level
    
    def calculate_economic_order_quantity(self, demand, ordering_cost, unit_cost):
        """
        Calculate the Economic Order Quantity (EOQ).
        
        Parameters:
        -----------
        demand : float
            Annual demand.
        ordering_cost : float
            Cost per order.
        unit_cost : float
            Cost per unit.
            
        Returns:
        --------
        float
            Economic Order Quantity.
        """
        return np.sqrt((2 * demand * ordering_cost) / (self.holding_cost_rate * unit_cost))
    
    def calculate_reorder_point(self, lead_time_demand, lead_time_std, service_level=None):
        """
        Calculate the Reorder Point (ROP).
        
        Parameters:
        -----------
        lead_time_demand : float
            Expected demand during lead time.
        lead_time_std : float
            Standard deviation of demand during lead time.
        service_level : float, optional
            Target service level. If None, uses self.service_level.
            
        Returns:
        --------
        float
            Reorder Point.
        """
        if service_level is None:
            service_level = self.service_level
        
        # Calculate safety factor (z-score) based on service level
        from scipy.stats import norm
        z = norm.ppf(service_level)
        
        # Calculate safety stock
        safety_stock = z * lead_time_std
        
        # Calculate reorder point
        reorder_point = lead_time_demand + safety_stock
        
        return reorder_point
    
    def optimize_inventory_levels(self, data):
        """
        Optimize inventory levels using linear programming.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            DataFrame containing inventory data with at least the following columns:
            - sku_id: SKU identifier
            - demand_mean: Mean demand
            - demand_std: Standard deviation of demand
            - lead_time_mean: Mean lead time
            - lead_time_std: Standard deviation of lead time
            - unit_cost: Cost per unit
            - ordering_cost: Cost per order
            
        Returns:
        --------
        pandas.DataFrame
            Original data with additional columns for optimized inventory parameters.
        """
        # Create a copy of the data
        result = data.copy()
        
        # Calculate lead time demand and its standard deviation
        result['lead_time_demand'] = result['demand_mean'] * result['lead_time_mean']
        result['lead_time_demand_std'] = np.sqrt(
            (result['demand_mean'] ** 2) * (result['lead_time_std'] ** 2) +
            (result['lead_time_mean'] ** 2) * (result['demand_std'] ** 2)
        )
        
        # Calculate EOQ for each SKU
        result['eoq'] = result.apply(
            lambda row: self.calculate_economic_order_quantity(
                row['demand_mean'], row['ordering_cost'], row['unit_cost']
            ),
            axis=1
        )
        
        # Calculate reorder point for each SKU
        result['reorder_point'] = result.apply(
            lambda row: self.calculate_reorder_point(
                row['lead_time_demand'], row['lead_time_demand_std']
            ),
            axis=1
        )
        
        # Calculate safety stock
        result['safety_stock'] = result['reorder_point'] - result['lead_time_demand']
        
        # Calculate optimal inventory level (EOQ + safety stock)
        result['optimal_inventory'] = result['eoq'] + result['safety_stock']
        
        # Calculate annual holding cost
        result['annual_holding_cost'] = (
            result['optimal_inventory'] * result['unit_cost'] * self.holding_cost_rate
        )
        
        # Calculate annual ordering cost
        result['annual_ordering_cost'] = (
            result['demand_mean'] / result['eoq'] * result['ordering_cost']
        )
        
        # Calculate total annual cost
        result['total_annual_cost'] = result['annual_holding_cost'] + result['annual_ordering_cost']
        
        return result
    
    def optimize_multi_echelon(self, data, network_structure):
        """
        Optimize inventory levels in a multi-echelon supply chain.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            DataFrame containing inventory data.
        network_structure : dict
            Dictionary defining the supply chain network structure.
            
        Returns:
        --------
        dict
            Optimized inventory parameters for each echelon.
        """
        # This is a simplified implementation
        # In a real system, this would use more advanced multi-echelon optimization techniques
        
        results = {}
        
        # Optimize each echelon separately
        for echelon, echelon_data in data.groupby('echelon'):
            results[echelon] = self.optimize_inventory_levels(echelon_data)
        
        return results
    
    def visualize_optimization_results(self, data, save_path=None):
        """
        Visualize optimization results.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            DataFrame containing optimization results.
        save_path : str, optional
            Path to save the visualization. If None, the plot is displayed.
        """
        plt.figure(figsize=(15, 10))
        
        # Create subplots
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Plot EOQ vs Demand
        axes[0, 0].scatter(data['demand_mean'], data['eoq'], alpha=0.7)
        axes[0, 0].set_title('Economic Order Quantity vs Demand')
        axes[0, 0].set_xlabel('Annual Demand')
        axes[0, 0].set_ylabel('EOQ')
        axes[0, 0].grid(True, linestyle='--', alpha=0.7)
        
        # Plot Reorder Point vs Lead Time Demand
        axes[0, 1].scatter(data['lead_time_demand'], data['reorder_point'], alpha=0.7)
        axes[0, 1].set_title('Reorder Point vs Lead Time Demand')
        axes[0, 1].set_xlabel('Lead Time Demand')
        axes[0, 1].set_ylabel('Reorder Point')
        axes[0, 1].grid(True, linestyle='--', alpha=0.7)
        
        # Plot Safety Stock vs Lead Time Demand Std
        axes[1, 0].scatter(data['lead_time_demand_std'], data['safety_stock'], alpha=0.7)
        axes[1, 0].set_title('Safety Stock vs Lead Time Demand Std')
        axes[1, 0].set_xlabel('Lead Time Demand Std')
        axes[1, 0].set_ylabel('Safety Stock')
        axes[1, 0].grid(True, linestyle='--', alpha=0.7)
        
        # Plot Total Cost breakdown
        cost_data = [
            data['annual_holding_cost'].sum(),
            data['annual_ordering_cost'].sum()
        ]
        axes[1, 1].bar(['Holding Cost', 'Ordering Cost'], cost_data)
        axes[1, 1].set_title('Total Annual Cost Breakdown')
        axes[1, 1].set_ylabel('Cost')
        axes[1, 1].grid(True, linestyle='--', alpha=0.7)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path)
            plt.close()
        else:
            plt.show()
    
    def save_model(self, path):
        """
        Save the optimizer parameters to disk.
        
        Parameters:
        -----------
        path : str
            Path to save the parameters.
        """
        params = {
            'holding_cost_rate': self.holding_cost_rate,
            'stockout_cost_rate': self.stockout_cost_rate,
            'service_level': self.service_level
        }
        joblib.dump(params, path)
    
    @classmethod
    def load_model(cls, path):
        """
        Load optimizer parameters from disk.
        
        Parameters:
        -----------
        path : str
            Path to the saved parameters.
            
        Returns:
        --------
        InventoryOptimizer
            Loaded optimizer.
        """
        params = joblib.load(path)
        
        optimizer = cls(
            holding_cost_rate=params['holding_cost_rate'],
            stockout_cost_rate=params['stockout_cost_rate'],
            service_level=params['service_level']
        )
        
        return optimizer


# Example usage
if __name__ == "__main__":
    # Generate sample data
    np.random.seed(42)
    n_samples = 100
    
    # Create DataFrame
    data = pd.DataFrame({
        'sku_id': [f'SKU-{i:04d}' for i in range(1, n_samples + 1)],
        'demand_mean': np.random.uniform(100, 1000, n_samples),
        'demand_std': np.random.uniform(10, 100, n_samples),
        'lead_time_mean': np.random.uniform(1, 4, n_samples),
        'lead_time_std': np.random.uniform(0.2, 1, n_samples),
        'unit_cost': np.random.uniform(10, 100, n_samples),
        'ordering_cost': np.random.uniform(50, 200, n_samples)
    })
    
    # Create and use the optimizer
    optimizer = InventoryOptimizer()
    results = optimizer.optimize_inventory_levels(data)
    
    # Print summary
    print("Inventory Optimization Summary:")
    print(f"Total SKUs: {len(results)}")
    print(f"Average EOQ: {results['eoq'].mean():.2f}")
    print(f"Average Reorder Point: {results['reorder_point'].mean():.2f}")
    print(f"Average Safety Stock: {results['safety_stock'].mean():.2f}")
    print(f"Total Annual Cost: ${results['total_annual_cost'].sum():.2f}")
    
    # Visualize results
    optimizer.visualize_optimization_results(results)
    
    # Save the optimizer
    os.makedirs('models', exist_ok=True)
    optimizer.save_model('models/inventory_optimizer.joblib')
