'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/button/button';

const App: React.FC = () => {
  const router = useRouter();

  const navigateToContractors = () => {
    router.push('/contractors');
  };

  const navigateToHome = () => {
    router.push('/');
  };

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ marginBottom: '30px' }}>Contractors Management System</h1>
      
      <div style={{
        display: 'flex', 
        gap: '15px', 
        flexWrap: 'wrap',
        marginBottom: '30px'
      }}>
        <Button onClick={navigateToContractors} size="large">
          View Contractors
        </Button>
        
        <Button onClick={navigateToHome} size="medium">
          Home
        </Button>
      </div>

      <div style={{ 
        color: '#666', 
        lineHeight: '1.6',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '6px'
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