'use client';

import React, { useCallback, useState } from 'react';
import Button from '../../components/ui/button/button';
import { GetContractorDTO } from '@/types/DTOs/get_contractor';
import AddUpdateContractorPopup from '@/components/ui/popups/add_contractor_popup';
import { AddNewContractorDTO } from '@/types/DTOs/new_contractor';
import { AdditionalDataDTO } from '@/types/DTOs/new_additional_data';
import { EditState } from '../../types/edit_state';
import contractorsService from '../../lib/services/contractors_service';
import reportsService from '../../lib/services/reports_service';
import styles from './contractors_page.module.css';

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

  const updatePage = async (nextPage:number) => {
    setPage(nextPage)
    await fetchContractors(nextPage)
  }

  const getReport = async () => {
    try {
    const response = await reportsService.getReport();
    
    if (response) {
      console.error('Error getting report:', response);      
      setError(response.errorMessage || 'Failed to generate report');
    }    
    } catch (err) {
      setError('Failed to generate report');
    }
  }

  const deleteContractor = async (contractorId:number) => {
    try {
      await contractorsService.delete(contractorId);      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete a contractor.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContractors = async (queryPage:number) => {
    setLoading(true);
    setError(null);
    
    try {
      
      const result: Result<PaginatedData<GetContractorDTO>> = await contractorsService.getAll(queryPage, 10, true);

      if (!result.isSuccess) {
        throw new Error(result.errorMessage || 'API returned failure');
      }
      
      if (!result.value) {
        throw new Error('No data received from API');
      }

      setTotalPages(result.value!.totalPages)
      setPage(queryPage)
      setContractors(result.value!.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contractors');
    } finally {
      setLoading(false);
    }
    
  };

  const loadSampleData = async () => {
    const sampleContractors: GetContractorDTO[] = await contractorsService.loadSampleData();
    setContractors(sampleContractors);
  };

  const clearContractors = () => {
    setContractors([]);
    setError(null);
  };

  return (
    <div className={styles.container}>
      
      <div className={styles.mainContent}>
        <div className={styles.headerSection}>
          <h1>Contractors</h1>
        </div>
        <div className={styles.buttonGroup}>
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
      {contractors.length > 0 && (
        <div className={styles.paginationContainer}>
          <Button disabled={page < 2} onClick={() => updatePage(page - 1)}> Previous page </Button>
            <span className={styles.pageInfo}>
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
        initialContractor={editState.contractor}
        initialContractorId={editState.contractorId}
        loading={editState.loading}
        error={editState.error}
        userId={1}
      />
      {error && (
        <div className={styles.errorMessage}>
          Error: {error}
        </div>
      )}

      {contractors.length === 0 && !loading && !error && (
        <div className={styles.emptyState}>
        <p>No contractors loaded. Click a button above to load contractors.</p>
        </div>
      )}

      <div className={styles.contractorsList}>
        {contractors.map(contractor => (
          <div key={contractor.id} className={styles.contractorCard}>
            <div className={styles.contractorHeader}>
              <div className={styles.contractorName}>
                {contractor.name}
              </div>
              {contractor.description && (
                <div className={styles.contractorDescription}>
                  {contractor.description}
                </div>
              )}
            </div>
            
            {contractor.additionalData && contractor.additionalData.length > 0 && (
              <div className={styles.additionalDataSection}>
                <h4 className={styles.additionalDataTitle}>
                  Additional Information:
                </h4>
                {contractor.additionalData.map((data, index) => (
                  <div key={index} className={styles.additionalDataItem}>
                    <span className={styles.fieldName}>
                      {data.fieldName}:
                    </span>{' '}
                    {data.fieldValue}{' '}
                    <span className={styles.fieldType}>
                      ({data.fieldType})
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.contractorActions}>
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