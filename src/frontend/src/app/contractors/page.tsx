'use client';

import React, { useCallback, useState } from 'react';
import Button from '../../components/ui/button/button';
import { GetContractorDTO } from '@/types/DTOs/get_contractor';
import AddUpdateContractorPopup from '@/components/ui/popups/add_contractor_popup';
import { AddNewContractorDTO } from '@/types/DTOs/new_contractor';
import { AdditionalDataDTO } from '@/types/DTOs/new_additional_data';
import { EditState } from '../../components/ui/popups/edit_state'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const ContractorsPage: React.FC = () => {
  const [contractors, setContractors] = useState<GetContractorDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [editState, setEditState] = useState<EditState>({
    mode: 'closed',
    contractor: null,
    contractorId: null,
    loading: false,
    error: null
  });

  const colors = {
    cardBg: '#f8fff8',
    cardBorder: '#27ae60',
    headerText: '#2d5a3d',
    bodyText: '#555555',
    accentBg: '#e8f5e8',
    grayPanelsBg: '#f5f5f5',
    grayPanelText: '#333'
  };

  const transformContractorForEdit = (contractor: GetContractorDTO): AddNewContractorDTO => {
    return {
      name: contractor.name,
      description: contractor.description,
      userId: contractor.userId,
      additionalData: contractor.additionalData.map(item => ({
        fieldName: item.fieldName,
        fieldType: item.fieldType,
        fieldValue: item.fieldValue
      } as AdditionalDataDTO))
    };
  };

  const openCreatePopup = useCallback(() => {
    setEditState({
      mode: 'create',
      contractor: null,
      contractorId: null,
      loading: false,
      error: null
    });
    setShowPopup(true);
  }, []);

  const openEditPopup = useCallback((contractor: GetContractorDTO) => {
    setEditState({
      mode: 'edit',
      contractor: transformContractorForEdit(contractor),
      contractorId: contractor.id,
      loading: false,
      error: null
    });
    setShowPopup(true);
  }, []);

  const closePopup = useCallback(() => {
    setShowPopup(false);
    setEditState({
      mode: 'closed',
      contractor: null,
      contractorId: null,
      loading: false,
      error: null
    });
  }, []);

  const handleContractorSaved = useCallback(async () => {
    closePopup();
    await fetchContractors(page);
  }, [page]);

  const handleEditError = useCallback((error: string) => {
    setEditState(prev => ({
      ...prev,
      error,
      loading: false
    }));
  }, []);

  const handleContractorDelete = useCallback(async (contractor: GetContractorDTO, currentPage: number) => {
    await deleteContractor(contractor.id);
    await fetchContractors(currentPage);
  }, []);

  const getApiConfig = () => {
    const isEditing = editState.mode === 'edit';
    return {
      url: `${apiUrl}${isEditing ? `/api/contractors/${editState.contractorId}` : '/api/contractors'}`,
      method: isEditing ? 'PUT' : 'POST'
    };
  };

  const updatePage = async (nextPage:number) => {
    setPage(nextPage)
    
    await fetchContractors(nextPage)
  }

  const getReport = async () => {
    const response = await fetch(`${apiUrl}/api/report`, {
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

  const deleteContractor = async (contractorId:number) => {
try {      
      const response = await fetch(`${apiUrl}/api/contractors/${contractorId.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'UserId': '1'
        },
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: Result<any> = await response.json();

      if (!result.isSuccess) {
        throw new Error(result.errorMessage || 'API returned failure');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete a contractor.');
      console.error('Error deleting contractor:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContractors = async (queryPage:number) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: queryPage.toString(),
        count: '10',
        orderByAsc: 'true'
      });
      
      const response = await fetch(`${apiUrl}/api/contractors?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'userId': '1'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: Result<PaginatedData<GetContractorDTO>> = await response.json();
      
      if (!result.isSuccess) {
        throw new Error(result.errorMessage || 'API returned failure');
      }
      
      if (!result.value) {
        throw new Error('No data received from API');
      }
      
      setTotalPages(result.value.totalPages)
      setContractors(result.value.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contractors');
      console.error('Error fetching contractors:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: colors.accentBg, color: colors.headerText }}>
      
      <div style={{margin: 'auto', width: '70%', textAlign: 'center'}}>
        <div style={{margin: 'auto', width: '50%'}}>
          <h1>Contractors</h1>
        </div>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
          <Button onClick={() => window.history.back()}>
          ←
          </Button>
          <Button onClick={() => fetchContractors(1)} loading={loading} disabled={loading}>
            Load Contractors from API
          </Button>
          
          <Button onClick={loadSampleData} variant="default">
            Load Sample Data
          </Button>
          
          <Button onClick={clearContractors} variant="default">
            Clear List
          </Button>

          <Button onClick={openCreatePopup } variant="default">
            Add new contractor. 
          </Button>

          <Button onClick={getReport} variant="default"> 
            Get contractors report.
          </Button>
        </div>
      </div>
      {contractors.length > 0 
      && (<div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', backgroundColor: colors.accentBg, border: '1px', borderColor: colors.cardBorder }}>
        <Button disabled={page < 2} onClick={() => updatePage(page - 1)}> Previous page </Button>
        <span style={{ 
              padding: '8px 16px',
              backgroundColor: colors.grayPanelsBg,
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: colors.grayPanelText
            }}>
              Page {page} of {totalPages}
            </span>
        <Button disabled={page >= totalPages} onClick={() => updatePage(page + 1)}> Next page </Button>
      </div>)}
      <AddUpdateContractorPopup 
        mode={editState.mode}
        isOpen={showPopup} 
        onClose={closePopup}
        onContractorAdded={handleContractorSaved}
        onError={handleEditError}
        targetUrl={getApiConfig().url}
        httpMethod={getApiConfig().method as "POST" | "PUT"}
        initialContractor={editState.contractor}
        loading={editState.loading}
        error={editState.error}
        userId={1}
      />
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
        <div style={{textAlign: 'center'}}>
        <p>No contractors loaded. Click a button above to load contractors.</p>
        </div>
      )}

      <div style={{backgroundColor: colors.cardBg}}>
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
              <div style={{ marginTop: '10px'}}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                  Additional Information:
                </h4>
                {contractor.additionalData.map((data, index) => (
                  <div 
                    key={index}
                    style={{ 
                      margin: '3px 0', 
                      //paddingLeft: '10px' 
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
            <div style={{gap: '10px', display: 'flex'}}>
              <Button onClick={() => openEditPopup(contractor)} size='small'>Edit contractor</Button>
              <Button onClick={() => handleContractorDelete(contractor, page)} size='small'> <i className="bi bi-trash3"></i> </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractorsPage;