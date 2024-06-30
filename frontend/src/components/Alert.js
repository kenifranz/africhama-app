import React from 'react';
import styles from './Alert.module.css';

const Alert = ({ message, type }) => (
  <div className={`${styles.alert} ${styles[type]}`}>
    {message}
  </div>
);

export default Alert;