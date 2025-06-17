'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/button/button';
import styles from './app_page.module.css'

const App: React.FC = () => {
  const router = useRouter();

  const navigateToContractors = () => {
    router.push('/contractors');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Contractors Management System</h1>
      
      <div className={styles.buttonGroup}>
        <Button onClick={navigateToContractors} size="large">
          View Contractors
        </Button>
      </div>

      <div className={styles.welcomeCard}>
        <h3 className={styles.welcomeTitle}>Welcome to the Contractors Management System</h3>
        <p>
          Click "View Contractors" to see the list of all contractors with their details and additional data.
        </p>
        <ul className={styles.featuresList}>
          <li>View contractor details and descriptions</li>
          <li>See additional data fields for each contractor</li>
        </ul>
      </div>
    </div>
  );
};

export default App;