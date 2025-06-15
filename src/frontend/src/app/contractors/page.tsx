'use client';

import React, { useState } from 'react';
import Button from '../../components/ui/button/button';
import { GetContractorDTO } from '@/types/DTOs/get_contractor';
import AddContractorPopup from '@/components/ui/popups/add_contractor_popup';

const ContractorsPage: React.FC = () => {
  const [contractors, setContractors] = useState<GetContractorDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const getReport = async () => {
    const response = await fetch(`http://localhost:5070/api/report`, {
        headers: {
          'Content-Type': 'application/pdf',
          'userId': '1'
        }
      })
      .then(response => response.blob())
      .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'document.pdf';
          link.click();
          window.URL.revokeObjectURL(url);
      });
  }

  const popCreate = () => {
    setShowPopup(true)
  }

  const fetchContractors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: '1',
        count: '10',
        orderByAsc: 'true'
      });
      
      // Replace with your actual API endpoint
      const response = await fetch(`http://localhost:7140/api/contractors?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'userId': '1'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: Result<PaginatedData<GetContractorDTO>> = await response.json();
      
      //result.value?.data?.forEach((contractor, index) => {
      //  console.log(`Contractor ${index + 1}:`);
      //  console.log(`  ID: ${contractor.id}`);
      //  console.log(`  Name: ${contractor.name}`);
      //  console.log(`  Description: ${contractor.description}`);
      //  console.log(`  User ID: ${contractor.userId}`);
      //  
      //  if (contractor.additionalData && contractor.additionalData.length > 0) {
      //    console.log(`  Additional Data:`);
      //    contractor.additionalData.forEach((data, dataIndex) => {
      //      console.log(`    ${dataIndex + 1}. Field: ${data.fieldName}, Type: ${data.fieldType}, Value: ${data.fieldValue}`);
      //    });
      //  } else {
      //    console.log(`  Additional Data: None`);
      //  }
      //  console.log('---');
      //});
      
      if (!result.isSuccess) {
        throw new Error(result.errorMessage || 'API returned failure');
      }
      
      if (!result.value) {
        throw new Error('No data received from API');
      }
      
      setContractors(result.value.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contractors');
      console.error('Error fetching contractors:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    // Sample data for testing
    const sampleContractors: GetContractorDTO[] = [
      {
        id: 1,
        name: "ABC Construction",
        description: "Residential and commercial construction services",
        userId: 1,
        additionalData: [
          { contractorId: 1, fieldName: "Phone", fieldType: "varchar", fieldValue: "(555) 123-4567" },
          { contractorId: 1, fieldName: "Years in Business", fieldType: "int", fieldValue: "15" },
          { contractorId: 1, fieldName: "Hourly Rate", fieldType: "decimal", fieldValue: "85.50" }
        ]
      },
      {
        id: 2,
        name: "Smith Plumbing LLC",
        description: "Professional plumbing and repair services",
        userId: 1,
        additionalData: [
          { contractorId: 2, fieldName: "License Number", fieldType: "varchar", fieldValue: "PL-12345" },
          { contractorId: 2, fieldName: "Emergency Service", fieldType: "varchar", fieldValue: "24/7" },
          { contractorId: 2, fieldName: "Service Fee", fieldType: "decimal", fieldValue: "75.00" }
        ]
      },
      {
        id: 3,
        name: "Green Landscaping",
        description: "",
        userId: 1,
        additionalData: [
          { contractorId: 3, fieldName: "Service Area", fieldType: "varchar", fieldValue: "Metro Area" },
          { contractorId: 3, fieldName: "Crew Size", fieldType: "int", fieldValue: "8" }
        ]
      }
    ];
    
    setContractors(sampleContractors);
  };

  const clearContractors = () => {
    setContractors([]);
    setError(null);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Contractors</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Button onClick={fetchContractors} loading={loading} disabled={loading}>
          Load Contractors from API
        </Button>
        
        <Button onClick={loadSampleData} variant="default">
          Load Sample Data
        </Button>
        
        <Button onClick={clearContractors} variant="default">
          Clear List
        </Button>

        <Button onClick={popCreate} variant="default">
          Add new contractor. 
        </Button>

        <Button onClick={getReport} variant="default"> 
          Get contractors report.
        </Button>
      </div>
      <AddContractorPopup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        onContractorAdded={() => setShowPopup(false)} 
        targetUrl={'http://localhost:7140/api/contractors'} 
        userId={1}/>
      {error && (
        <div style={{ 
          color: '#d32f2f', 
          backgroundColor: '#ffebee', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      {contractors.length === 0 && !loading && !error && (
        <p>No contractors loaded. Click a button above to load contractors.</p>
      )}

      <div>
        {contractors.map(contractor => (
          <div 
            key={contractor.id}
            style={{
              border: '1px solid #ddd',
              marginBottom: '20px',
              padding: '15px',
              borderRadius: '4px'
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '5px' }}>
                {contractor.name}
              </div>
              {contractor.description && (
                <div style={{ color: '#666', marginBottom: '5px' }}>
                  {contractor.description}
                </div>
              )}
            </div>
            
            {contractor.additionalData && contractor.additionalData.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <h4 style={{ margin: '10px 0 5px 0', fontSize: '14px' }}>
                  Additional Information:
                </h4>
                {contractor.additionalData.map((data, index) => (
                  <div 
                    key={index}
                    style={{ 
                      margin: '3px 0', 
                      paddingLeft: '10px' 
                    }}>
                    <span style={{ fontWeight: 'bold' }}>{data.fieldName}:</span>{' '}
                    {data.fieldValue}{' '}
                    <span style={{ color: '#888', fontSize: '12px' }}>
                      ({data.fieldType})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractorsPage;