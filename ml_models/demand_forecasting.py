"""
Demand Forecasting using ARIMA and LSTM models

This module implements time series forecasting to predict future demand
for inventory items based on historical sales data.
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_percentage_error
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

class DemandForecaster:
    def __init__(self, method='arima', forecast_horizon=12):
        """
        Initialize the demand forecaster.
        
        Parameters:
        -----------
        method : str
            Forecasting method to use ('arima' or 'lstm').
        forecast_horizon : int
            Number of time periods to forecast.
        """
        self.method = method
        self.forecast_horizon = forecast_horizon
        self.model = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        
    def preprocess_data(self, data, date_column='date', demand_column='demand'):
        """
        Preprocess time series data for forecasting.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            DataFrame containing time series data.
        date_column : str
            Name of the column containing dates.
        demand_column : str
            Name of the column containing demand values.
            
        Returns:
        --------
        pandas.DataFrame
            Preprocessed data.
        """
        # Ensure data is sorted by date
        data = data.sort_values(date_column)
        
        # Set date as index
        if date_column in data.columns:
            data = data.set_index(date_column)
        
        # Resample to monthly frequency if needed
        if isinstance(data.index, pd.DatetimeIndex) and data.index.inferred_freq != 'M':
            data = data.resample('M').sum()
        
        # Handle missing values
        data = data.fillna(method='ffill')
        
        return data
    
    def check_stationarity(self, data):
        """
        Check if the time series is stationary using the Augmented Dickey-Fuller test.
        
        Parameters:
        -----------
        data : pandas.Series
            Time series data.
            
        Returns:
        --------
        bool
            True if the series is stationary, False otherwise.
        """
        result = adfuller(data.dropna())
        return result[1] < 0.05  # p-value < 0.05 indicates stationarity
    
    def prepare_lstm_data(self, data, time_steps=12):
        """
        Prepare data for LSTM model by creating sequences.
        
        Parameters:
        -----------
        data : pandas.Series
            Time series data.
        time_steps : int
            Number of time steps to use for each sequence.
            
        Returns:
        --------
        tuple
            (X, y) where X is the input sequences and y is the target values.
        """
        # Scale the data
        scaled_data = self.scaler.fit_transform(data.values.reshape(-1, 1))
        
        X, y = [], []
        for i in range(len(scaled_data) - time_steps):
            X.append(scaled_data[i:i + time_steps, 0])
            y.append(scaled_data[i + time_steps, 0])
        
        return np.array(X).reshape(-1, time_steps, 1), np.array(y)
    
    def fit_arima(self, data, order=(1, 1, 1)):
        """
        Fit an ARIMA model to the data.
        
        Parameters:
        -----------
        data : pandas.Series
            Time series data.
        order : tuple
            ARIMA order (p, d, q).
        """
        # Check stationarity
        is_stationary = self.check_stationarity(data)
        
        # If not stationary, difference the data
        d = 0 if is_stationary else 1
        order = (order[0], d, order[2])
        
        # Fit ARIMA model
        self.model = ARIMA(data, order=order)
        self.model = self.model.fit()
    
    def fit_lstm(self, data, time_steps=12, epochs=100, batch_size=32):
        """
        Fit an LSTM model to the data.
        
        Parameters:
        -----------
        data : pandas.Series
            Time series data.
        time_steps : int
            Number of time steps to use for each sequence.
        epochs : int
            Number of training epochs.
        batch_size : int
            Batch size for training.
        """
        # Prepare data for LSTM
        X, y = self.prepare_lstm_data(data, time_steps)
        
        # Build LSTM model
        self.model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(time_steps, 1)),
            Dropout(0.2),
            LSTM(50),
            Dropout(0.2),
            Dense(1)
        ])
        
        self.model.compile(optimizer='adam', loss='mean_squared_error')
        
        # Train the model
        self.model.fit(X, y, epochs=epochs, batch_size=batch_size, verbose=0)
        
        # Store the time steps
        self.time_steps = time_steps
    
    def fit(self, data, date_column='date', demand_column='demand', **kwargs):
        """
        Fit the forecasting model to the data.
        
        Parameters:
        -----------
        data : pandas.DataFrame
            DataFrame containing time series data.
        date_column : str
            Name of the column containing dates.
        demand_column : str
            Name of the column containing demand values.
        **kwargs : dict
            Additional arguments for the specific forecasting method.
        """
        # Preprocess data
        processed_data = self.preprocess_data(data, date_column, demand_column)
        
        # Extract the demand series
        demand_series = processed_data[demand_column] if demand_column in processed_data.columns else processed_data
        
        # Fit the appropriate model
        if self.method == 'arima':
            order = kwargs.get('order', (1, 1, 1))
            self.fit_arima(demand_series, order)
        elif self.method == 'lstm':
            time_steps = kwargs.get('time_steps', 12)
            epochs = kwargs.get('epochs', 100)
            batch_size = kwargs.get('batch_size', 32)
            self.fit_lstm(demand_series, time_steps, epochs, batch_size)
        else:
            raise ValueError(f"Unknown forecasting method: {self.method}")
    
    def forecast(self, steps=None):
        """
        Generate forecasts.
        
        Parameters:
        -----------
        steps : int, optional
            Number of steps to forecast. If None, uses self.forecast_horizon.
            
        Returns:
        --------
        pandas.Series or numpy.ndarray
            Forecasted values.
        """
        if steps is None:
            steps = self.forecast_horizon
        
        if self.method == 'arima':
            forecast_result = self.model.forecast(steps=steps)
            return forecast_result
        elif self.method == 'lstm':
            # Get the last sequence from the training data
            last_sequence = self.model.predict(np.zeros((1, self.time_steps, 1)))
            
            # Generate forecasts iteratively
            forecasts = []
            for _ in range(steps):
                # Predict the next value
                next_value = self.model.predict(last_sequence.reshape(1, self.time_steps, 1))[0]
                forecasts.append(next_value)
                
                # Update the sequence
                last_sequence = np.append(last_sequence[1:], next_value)
            
            # Inverse transform to get the original scale
            forecasts = self.scaler.inverse_transform(np.array(forecasts).reshape(-1, 1))
            return forecasts.flatten()
    
    def evaluate(self, test_data):
        """
        Evaluate the model on test data.
        
        Parameters:
        -----------
        test_data : pandas.Series or pandas.DataFrame
            Test data to evaluate the model on.
            
        Returns:
        --------
        dict
            Dictionary containing evaluation metrics.
        """
        if isinstance(test_data, pd.DataFrame):
            test_data = test_data.iloc[:, 0]
        
        # Generate forecasts for the test period
        forecasts = self.forecast(steps=len(test_data))
        
        # Calculate metrics
        mape = mean_absolute_percentage_error(test_data, forecasts)
        
        return {
            'mape': mape,
            'accuracy': 1 - mape
        }
    
    def plot_forecast(self, historical_data=None, forecast_data=None, save_path=None):
        """
        Plot historical data and forecasts.
        
        Parameters:
        -----------
        historical_data : pandas.Series, optional
            Historical data to plot.
        forecast_data : pandas.Series or numpy.ndarray, optional
            Forecast data to plot. If None, generates new forecasts.
        save_path : str, optional
            Path to save the plot. If None, the plot is displayed.
        """
        plt.figure(figsize=(12, 6))
        
        # Plot historical data
        if historical_data is not None:
            plt.plot(historical_data.index, historical_data.values, label='Historical')
        
        # Generate or plot forecasts
        if forecast_data is None:
            forecast_data = self.forecast()
        
        # Create forecast index
        if historical_data is not None:
            last_date = historical_data.index[-1]
            if isinstance(last_date, pd.Timestamp):
                # For monthly data
                forecast_index = pd.date_range(
                    start=last_date + pd.DateOffset(months=1),
                    periods=len(forecast_data),
                    freq='M'
                )
            else:
                # For numeric indices
                forecast_index = range(
                    len(historical_data),
                    len(historical_data) + len(forecast_data)
                )
        else:
            forecast_index = range(len(forecast_data))
        
        # Plot forecasts
        plt.plot(forecast_index, forecast_data, label='Forecast', color='red', linestyle='--')
        
        plt.title(f'Demand Forecast ({self.method.upper()})')
        plt.xlabel('Date')
        plt.ylabel('Demand')
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
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        if self.method == 'arima':
            # Save ARIMA model
            self.model.save(path)
        elif self.method == 'lstm':
            # Save LSTM model
            self.model.save(path + '.keras')
            
            # Save scaler
            joblib.dump(self.scaler, path + '_scaler.joblib')
            
            # Save additional parameters
            params = {
                'method': self.method,
                'forecast_horizon': self.forecast_horizon,
                'time_steps': self.time_steps
            }
            joblib.dump(params, path + '_params.joblib')
    
    @classmethod
    def load_model(cls, path, method='arima'):
        """
        Load a trained model from disk.
        
        Parameters:
        -----------
        path : str
            Path to the saved model.
        method : str
            Forecasting method ('arima' or 'lstm').
            
        Returns:
        --------
        DemandForecaster
            Loaded model.
        """
        forecaster = cls(method=method)
        
        if method == 'arima':
            # Load ARIMA model
            from statsmodels.tsa.arima.model import ARIMAResults
            forecaster.model = ARIMAResults.load(path)
        elif method == 'lstm':
            # Load LSTM model
            forecaster.model = load_model(path + '.keras')
            
            # Load scaler
            forecaster.scaler = joblib.load(path + '_scaler.joblib')
            
            # Load additional parameters
            params = joblib.load(path + '_params.joblib')
            forecaster.forecast_horizon = params['forecast_horizon']
            forecaster.time_steps = params['time_steps']
        
        return forecaster


# Example usage
if __name__ == "__main__":
    # Generate sample data
    np.random.seed(42)
    
    # Create date range
    date_range = pd.date_range(start='2020-01-01', periods=36, freq='M')
    
    # Generate demand with trend, seasonality, and noise
    trend = np.linspace(100, 200, 36)  # Upward trend
    seasonality = 50 * np.sin(np.linspace(0, 6*np.pi, 36))  # Seasonal pattern
    noise = np.random.normal(0, 20, 36)  # Random noise
    
    demand = trend + seasonality + noise
    
    # Create DataFrame
    data = pd.DataFrame({
        'date': date_range,
        'demand': demand
    })
    
    # Split into train and test sets
    train_data = data.iloc[:24]
    test_data = data.iloc[24:]
    
    # Create and fit ARIMA forecaster
    arima_forecaster = DemandForecaster(method='arima')
    arima_forecaster.fit(train_data)
    
    # Generate and plot forecasts
    arima_forecasts = arima_forecaster.forecast(steps=12)
    arima_forecaster.plot_forecast(
        historical_data=train_data.set_index('date')['demand'],
        forecast_data=arima_forecasts
    )
    
    # Evaluate ARIMA model
    arima_metrics = arima_forecaster.evaluate(test_data.set_index('date')['demand'])
    print(f"ARIMA Model Metrics: {arima_metrics}")
    
    # Create and fit LSTM forecaster
    lstm_forecaster = DemandForecaster(method='lstm')
    lstm_forecaster.fit(train_data, epochs=50)
    
    # Generate and plot forecasts
    lstm_forecasts = lstm_forecaster.forecast(steps=12)
    lstm_forecaster.plot_forecast(
        historical_data=train_data.set_index('date')['demand'],
        forecast_data=lstm_forecasts
    )
    
    # Evaluate LSTM model
    lstm_metrics = lstm_forecaster.evaluate(test_data.set_index('date')['demand'])
    print(f"LSTM Model Metrics: {lstm_metrics}")
    
    # Save models
    os.makedirs('models', exist_ok=True)
    arima_forecaster.save_model('models/arima_forecaster')
    lstm_forecaster.save_model('models/lstm_forecaster')
