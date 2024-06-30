import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './SubscriptionMaintenance.module.css';

const SubscriptionMaintenance = () => {
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);

  const [subscription, setSubscription] = useState(null);
  const [maintenanceStatus, setMaintenanceStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSubscriptionAndMaintenanceStatus();
  }, []);

  const fetchSubscriptionAndMaintenanceStatus = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/subscription-maintenance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscription(response.data.subscription);
      setMaintenanceStatus(response.data.maintenanceStatus);
    } catch (err) {
      setError('Failed to fetch subscription and maintenance status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('/api/subscribe', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscription(response.data.subscription);
      setSuccess('Successfully subscribed');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to subscribe');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayMaintenance = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('/api/pay-maintenance', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaintenanceStatus(response.data.maintenanceStatus);
      setSuccess('Yearly maintenance fee paid successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to pay maintenance fee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Subscription and Maintenance</h2>
      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}
      
      <div className={styles.subscriptionSection}>
        <h3>Subscription Status</h3>
        {subscription ? (
          <div>
            <p>Status: {subscription.status}</p>
            <p>Expiry Date: {new Date(subscription.expiryDate).toLocaleDateString()}</p>
            {subscription.status === 'expired' && (
              <button onClick={handleSubscribe} className={styles.actionButton} disabled={isLoading}>
                Renew Subscription
              </button>
            )}
          </div>
        ) : (
          <div>
            <p>You are not currently subscribed.</p>
            <button onClick={handleSubscribe} className={styles.actionButton} disabled={isLoading}>
              Subscribe Now
            </button>
          </div>
        )}
      </div>

      <div className={styles.maintenanceSection}>
        <h3>Yearly Maintenance</h3>
        {maintenanceStatus ? (
          <div>
            <p>Last Payment Date: {new Date(maintenanceStatus.lastPaymentDate).toLocaleDateString()}</p>
            <p>Next Payment Due: {new Date(maintenanceStatus.nextPaymentDue).toLocaleDateString()}</p>
            {new Date(maintenanceStatus.nextPaymentDue) <= new Date() && (
              <button onClick={handlePayMaintenance} className={styles.actionButton} disabled={isLoading}>
                Pay Maintenance Fee
              </button>
            )}
          </div>
        ) : (
          <div>
            <p>No maintenance payment record found.</p>
            <button onClick={handlePayMaintenance} className={styles.actionButton} disabled={isLoading}>
              Pay Initial Maintenance Fee
            </button>
          </div>
        )}
      </div>

      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default SubscriptionMaintenance;