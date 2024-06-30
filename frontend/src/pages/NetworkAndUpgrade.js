import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { updateUser } from '../store/authSlice';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './NetworkAndUpgrade.module.css';

const NetworkAndUpgrade = () => {
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();

  const [network, setNetwork] = useState({ E: [], P: [], B: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchNetwork();
  }, []);

  const fetchNetwork = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/network', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNetwork(response.data.network);
    } catch (err) {
      setError('Failed to fetch network data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (newClass) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('/api/upgrade', { newClass }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(updateUser(response.data.user));
      setSuccess(`Successfully upgraded to ${newClass}-Class`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upgrade class');
    } finally {
      setIsLoading(false);
    }
  };

  const renderUpgradeButtons = () => {
    switch(user.class) {
      case 'E':
        return (
          <>
            <button onClick={() => handleUpgrade('P')} className={styles.upgradeButton}>Upgrade to P-Class</button>
            <button onClick={() => handleUpgrade('B')} className={styles.upgradeButton}>Upgrade to B-Class</button>
          </>
        );
      case 'P':
        return <button onClick={() => handleUpgrade('B')} className={styles.upgradeButton}>Upgrade to B-Class</button>;
      default:
        return null;
    }
  };

  const renderNetworkList = (members, title) => (
    <div className={styles.networkSection}>
      <h3>{title}</h3>
      {members.length > 0 ? (
        <ul className={styles.memberList}>
          {members.map(member => (
            <li key={member.id} className={styles.memberItem}>
              {member.username} - {member.memberCode}
            </li>
          ))}
        </ul>
      ) : (
        <p>No members in this class yet.</p>
      )}
    </div>
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <h2>My Network and Upgrade</h2>
      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}
      <div className={styles.userInfo}>
        <p>Your current class: <strong>{user.class}-Class</strong></p>
        <p>Your member code: <strong>{user.memberCode}</strong></p>
      </div>
      <div className={styles.upgradeSection}>
        <h3>Upgrade Your Class</h3>
        {renderUpgradeButtons()}
      </div>
      <div className={styles.networkContainer}>
        {renderNetworkList(network.E, 'E-Class Members')}
        {renderNetworkList(network.P, 'P-Class Members')}
        {renderNetworkList(network.B, 'B-Class Members')}
      </div>
    </div>
  );
};

export default NetworkAndUpgrade;