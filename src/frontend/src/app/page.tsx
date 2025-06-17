'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/button/button';

const App: React.FC = () => {
  const router = useRouter();

  const colors = {
    cardBg: '#f8fff8',
    cardBorder: '#27ae60',
    headerText: '#2d5a3d',
    bodyText: '#555555',
    accentBg: '#e8f5e8',
    grayPanelsBg: '#f5f5f5',
    grayPanelText: '#333'
  };

  const navigateToContractors = () => {
    router.push('/contractors');
  };

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      margin: '0 auto',
      backgroundColor: colors.accentBg,
      color: colors.headerText,
    }}>
      <h1 style={{ marginBottom: '30px' }}>Contractors Management System</h1>
      
      <div style={{
        display: 'flex', 
        gap: '15px', 
        flexWrap: 'wrap',
        marginBottom: '30px',
      }}>
        <Button onClick={navigateToContractors} size="large">
          View Contractors
        </Button>
      </div>

      <div style={{ 
        padding: '20px',
        borderRadius: '6px',
        color: colors.bodyText,
        backgroundColor: colors.cardBg
      }}>
        <h3 style={{ marginTop: '0' }}>Welcome to the Contractors Management System</h3>
        <p>
          Click "View Contractors" to see the list of all contractors with their details and additional data.
        </p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>View contractor details and descriptions</li>
          <li>See additional data fields for each contractor</li>
        </ul>
      </div>
    </div>
  );
};

export default App;