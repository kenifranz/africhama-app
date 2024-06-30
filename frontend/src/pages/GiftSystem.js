import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Alert from '../components1/Alert';
import LoadingSpinner from '../components1/LoadingSpinner';
import styles from './GiftSystem.module.css';

const GiftSystem = () => {
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);

  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [pendingGifts, setPendingGifts] = useState([]);
  const [sentGifts, setSentGifts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/gifts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingGifts(response.data.pendingGifts);
      setSentGifts(response.data.sentGifts);
    } catch (err) {
      setError('Failed to fetch gifts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendGift = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/gifts/send', { receiverId, amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Gift sent successfully');
      setReceiverId('');
      setAmount('');
      fetchGifts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send gift');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveGift = async (giftId) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`/api/gifts/approve/${giftId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Gift approved successfully');
      fetchGifts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve gift');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Gift System</h2>
      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}
      
      <div className={styles.sendGiftSection}>
        <h3>Send a Gift</h3>
        <form onSubmit={handleSendGift} className={styles.giftForm}>
          <div className={styles.formGroup}>
            <label htmlFor="receiverId">Receiver's Member Code</label>
            <input
              type="text"
              id="receiverId"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="amount">Amount (USD)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
          </div>
          <button type="submit" className={styles.sendButton} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Gift'}
          </button>
        </form>
      </div>

      <div className={styles.pendingGiftsSection}>
        <h3>Pending Gifts to Approve</h3>
        {pendingGifts.length > 0 ? (
          <ul className={styles.giftList}>
            {pendingGifts.map(gift => (
              <li key={gift.id} className={styles.giftItem}>
                From: {gift.senderUsername} - Amount: ${gift.amount}
                <button 
                  onClick={() => handleApproveGift(gift.id)}
                  className={styles.approveButton}
                  disabled={isLoading}
                >
                  Approve
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending gifts to approve.</p>
        )}
      </div>

      <div className={styles.sentGiftsSection}>
        <h3>Sent Gifts</h3>
        {sentGifts.length > 0 ? (
          <ul className={styles.giftList}>
            {sentGifts.map(gift => (
              <li key={gift.id} className={styles.giftItem}>
                To: {gift.receiverUsername} - Amount: ${gift.amount} - Status: {gift.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>You haven't sent any gifts yet.</p>
        )}
      </div>

      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default GiftSystem;