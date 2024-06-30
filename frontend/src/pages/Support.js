import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './Support.module.css';

const Support = () => {
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/support/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data.tickets);
    } catch (err) {
      setError('Failed to fetch support tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/support/create-ticket', { subject, message }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Support ticket created successfully');
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create support ticket');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Support</h2>
      {error && <Alert message={error} type="error" />}
      {success && <Alert message={success} type="success" />}
      
      <div className={styles.createTicketSection}>
        <h3>Create a New Support Ticket</h3>
        <form onSubmit={handleSubmit} className={styles.ticketForm}>
          <div className={styles.formGroup}>
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>

      <div className={styles.ticketHistorySection}>
        <h3>Your Ticket History</h3>
        {tickets.length > 0 ? (
          <ul className={styles.ticketList}>
            {tickets.map(ticket => (
              <li key={ticket.id} className={styles.ticketItem}>
                <div className={styles.ticketHeader}>
                  <strong>{ticket.subject}</strong>
                  <span className={styles.ticketStatus}>{ticket.status}</span>
                </div>
                <p>{ticket.message}</p>
                <small>Created on: {new Date(ticket.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>You haven't created any support tickets yet.</p>
        )}
      </div>

      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default Support;