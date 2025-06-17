'use client';

import React, { useEffect, useState } from 'react';
import Button from '../button/button';
import { AdditionalDataDTO } from '@/types/DTOs/new_additional_data';
import { AddNewContractorDTO } from '@/types/DTOs/new_contractor';
import "bootstrap-icons/font/bootstrap-icons.css";
import '../../../types/result'
import contractorsService from '@/lib/services/contractors_service';
import styles from './add_contractor_popup.module.css';

interface AddContractorPopupProps {
  mode: 'create' | 'edit' | 'closed';
  userId: number;
  isOpen: boolean;
  initialContractor: AddNewContractorDTO | null;
  initialContractorId:number | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onContractorAdded?: () => void; // Callback to refresh the contractors list
  onError?: (error: string) => void;
}

const AddUpdateContractorPopup: React.FC<AddContractorPopupProps> = ({
  mode,
  userId,
  isOpen,
  initialContractor,
  initialContractorId,
  loading: externalLoading,
  error: externalError,
  onClose,
  onContractorAdded,
  onError,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [contractor, setContractor] = useState<AddNewContractorDTO>({
  userId: userId,
  name: '',
  description: '',
  additionalData: []
  });

  const loading = externalLoading || internalLoading;
  const error = externalError || internalError;

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialContractor) {
        setContractor(initialContractor);
      } else if (mode === 'create') {
        resetForm();
      }
      setInternalError(null);
    }
  }, [isOpen, mode, initialContractor, userId]);

  const addAdditionalData = () => {
    setContractor(prev => ({
      ...prev,
      additionalData: [
        ...prev.additionalData,
        { fieldName: '', fieldType: 'string', fieldValue: '' } as AdditionalDataDTO
      ]
    }));
  };

  const removeAdditionalData = (index: number) => {
    setContractor(prev => ({
      ...prev,
      additionalData: prev.additionalData.filter((_, i) => i !== index)
    }));
  };

  const updateAdditionalData = (index: number, field: keyof AdditionalDataDTO, value: string) => {
    setContractor(prev => ({
      ...prev,
      additionalData: prev.additionalData.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const resetForm = () => {
    setContractor({
      userId: userId,  
      name: '',
      description: '',
      additionalData: []
    });
    setInternalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalLoading(true);
    setInternalError(null);

    try {
      if (!contractor.name.trim()) {
        throw new Error('Contractor name is required');
      }

      for (const field of contractor.additionalData) {
        if (!field.fieldName.trim()) {
          throw new Error('All additional field names must be provided');
        }
        if (!field.fieldValue.trim()) {
          throw new Error('All additional field values must be provided');
        }
      }
      
      try {
        const response: Result<any> = mode === 'create' 
          ? await contractorsService.create(contractor) 
          : await contractorsService.update(initialContractorId!, contractor);
        
        if (mode === 'create') {
          // Creating a contractor returns his Id (int)
          const result: Result<number> = await response;
          if (!result.isSuccess) {
            throw new Error(result.errorMessage || 'Failed to create contractor.');
          }
        } else {
          const result: Result<any> = await response;
          if (!result.isSuccess) {
            throw new Error(result.errorMessage || 'Failed to update contractor.');
          }
        }
      } catch (err) {
        throw err;
      }
      

      resetForm();
      onClose();
      if (onContractorAdded) {
        onContractorAdded();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${mode === 'create' ? 'create' : 'update'} contractor.`;
      setInternalError(errorMessage);
    } finally {
      setInternalLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;
  
  const isEditing = mode === 'edit';
  const title = isEditing ? 'Edit Contractor' : 'Add New Contractor';
  const submitButtonText = isEditing ? 'Update Contractor' : 'Create Contractor';

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <Button onClick={handleClose} size='small' disabled={false}> 
            x 
          </Button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Name *
            </label>
            <input
              type="text"
              value={contractor.name}
              onChange={(e) => setContractor(prev => ({ ...prev, name: e.target.value }))}
              disabled={loading}
              className={styles.input}
              placeholder="Enter contractor name"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Description
            </label>
            <textarea
              value={contractor.description}
              onChange={(e) => setContractor(prev => ({ ...prev, description: e.target.value }))}
              disabled={loading}
              rows={3}
              className={styles.textarea}
              placeholder="Enter contractor description"
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.additionalFieldsHeader}>
              <label className={styles.label}>Additional Fields</label>
              <Button type="button" onClick={addAdditionalData} disabled={loading} size="small">
                +
              </Button>
            </div>

            {contractor.additionalData.map((field, index) => (
              <div key={index} className={styles.fieldCard}>
                <div className={styles.fieldHeader}>
                  <span className={styles.fieldTitle}>Field {index + 1}</span>
                  <Button type="button" onClick={() => removeAdditionalData(index)} disabled={loading} size="small">
                    X
                  </Button>
                </div>

                <div className={styles.fieldGrid}>
                  <div>
                    <label className={styles.smallLabel}>
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={field.fieldName}
                      onChange={(e) => updateAdditionalData(index, 'fieldName', e.target.value)}
                      disabled={loading}
                      className={styles.smallInput}
                      placeholder="e.g., Phone, License"
                    />
                  </div>

                  <div>
                    <label className={styles.smallLabel}>
                      Field Type
                    </label>
                    <select
                      value={field.fieldType}
                      onChange={(e) => updateAdditionalData(index, 'fieldType', e.target.value)}
                      disabled={loading}
                      className={styles.select}
                    >
                      <option value="string">Text (string)</option>
                      <option value="int">Number (int)</option>
                      <option value="double">Decimal (double)</option>
                      <option value="bool">Boolean</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={styles.smallLabel}>
                    Field Value
                  </label>
                  <input
                    type="text"
                    value={field.fieldValue}
                    onChange={(e) => updateAdditionalData(index, 'fieldValue', e.target.value)}
                    disabled={loading}
                    className={styles.smallInput}
                    placeholder="Enter field value"
                  />
                </div>
              </div>
            ))}

            {contractor.additionalData.length === 0 && (
              <p className={styles.emptyFieldsMessage}>
                No additional fields added. Click "Add Field" to add custom data.
              </p>
            )}
          </div>

          <div className={styles.formActions}>
            <Button type="button" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={loading || !contractor.name.trim()}>
              {submitButtonText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateContractorPopup;