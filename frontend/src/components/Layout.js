import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>
            <img src="/logo.png" alt="Africhama Logo" />
          </Link>
          <ul className={styles.navLinks}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/network">Network</Link></li>
            <li><Link to="/gift-system">Gift System</Link></li>
            <li><Link to="/subscription">Subscription</Link></li>
            <li><Link to="/support">Support</Link></li>
          </ul>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <p>&copy; 2023 Africhama. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;