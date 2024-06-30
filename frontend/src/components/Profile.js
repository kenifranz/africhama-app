import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Profile.module.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token'); // Assume token is stored in localStorage
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (err) {
      setError('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!user) return <div className={styles.error}>User not found</div>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.profilePicture}>
          {user.first_name[0]}
          {user.last_name[0]}
        </div>
        <h1>{user.first_name} {user.last_name}</h1>
        <span className={styles.memberCode}>Member Code: {user.member_code}</span>
      </div>
      
      <div className={styles.profileContent}>
        <section className={styles.userInfo}>
          <h2>Personal Information</h2>
          <div className={styles.infoGrid}>
            <div>
              <strong>Username:</strong> {user.username}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Country:</strong> {user.country}
            </div>
            <div>
              <strong>City:</strong> {user.city}
            </div>
            <div>
              <strong>Age:</strong> {user.age}
            </div>
            <div>
              <strong>Membership Class:</strong> {user.class}
            </div>
          </div>
        </section>

        <section className={styles.accountStatus}>
          <h2>Account Status</h2>
          <div className={styles.statusItem}>
            <span>Subscription Status:</span>
            <span className={styles.active}>Active</span>
          </div>
          <div className={styles.statusItem}>
            <span>Next Renewal Date:</span>
            <span>December 31, 2023</span>
          </div>
          <div className={styles.statusItem}>
            <span>Maintenance Fee Status:</span>
            <span className={styles.paid}>Paid</span>
          </div>
        </section>

        <section className={styles.profileActions}>
          <h2>Profile Actions</h2>
          <button className={styles.actionButton}>Edit Profile</button>
          <button className={styles.actionButton}>Change Password</button>
          <button className={styles.actionButton}>Upgrade Membership</button>
        </section>
      </div>
    </div>
  );
};

export default Profile;