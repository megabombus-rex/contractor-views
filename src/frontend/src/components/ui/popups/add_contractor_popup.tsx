'use client';

import React, { useEffect, useState } from 'react';
import Button from '../button/button';
import { AdditionalDataDTO } from '@/types/DTOs/new_additional_data';
import { AddNewContractorDTO } from '@/types/DTOs/new_contractor';
import "bootstrap-icons/font/bootstrap-icons.css";
import '../../../types/result'
import contractorsService from '@/lib/services/contractors_service';

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

  const colors = {
    cardBg: '#f8fff8',
    cardBorder: '#27ae60',
    headerText: '#2d5a3d',
    bodyText: '#555555',
    accentBg: '#e8f5e8',
    grayPanelsBg: '#f5f5f5',
    grayPanelText: '#333'
  };

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialContractor) {
        setContractor(initialContractor);
      } else if (mode === 'create') {
        resetForm();
      }
      setInternalError(null);
      console.log(mode)
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
    console.log("Adding additional field.")

    contractor.additionalData.forEach((additionalData, index) => {
        console.log(`Contractor ${index + 1}:`);
        console.log(`  Field Name: ${additionalData.fieldName}`);
        console.log(`  Field Type: ${additionalData.fieldType}`);
        console.log(`  Field Value: ${additionalData.fieldValue}`);
      });
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
        console.log('Trying to add or update.');
        const response: Result<any> = mode === 'create' 
          ? await contractorsService.create(contractor) 
          : await contractorsService.update(initialContractorId!, contractor);
        
        console.log(`Mode: ${mode}`);

        if (mode === 'create') {
          // Creating a contractor returns his Id (int)
          console.log(`Result fetching add.`)
          const result: Result<number> = await response;
          console.log(`Result got: ${result.errorCode}.`)
          if (!result.isSuccess) {
            console.log(`Message from add result: ${result.errorMessage}`)
            throw new Error(result.errorMessage || 'Failed to create contractor.');
          }
        } else {
          // Updating might return different response format
          console.log(`Result fetching update.`)
          const result: Result<any> = await response;
          if (!result.isSuccess) {
            console.log(`Message from put result: ${result.errorMessage}`)
            throw new Error(result.errorMessage || 'Failed to update contractor.');
          }
        }
      } catch (err) {
        const errorTemp: Error = err as Error;
        
        console.log(`Error message: ${errorTemp.message}`)

        throw err as Error;
      }
      

      resetForm();
      onClose();
      if (onContractorAdded) {
        console.log('ADDED');
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: colors.accentBg,
        color: colors.headerText,
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}> {title}</h2>
          <Button onClick={handleClose} size='small' disabled={false}> 
            x 
          </Button>
        </div>

        {error && (
          <div style={{
            color: '#d32f2f',
            backgroundColor: '#ffebee',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Name *
            </label>
            <input
              type="text"
              value={contractor.name}
              onChange={(e) => setContractor(prev => ({ ...prev, name: e.target.value }))}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                borderColor: colors.cardBorder,
                backgroundColor: colors.cardBg,
                color: colors.bodyText,
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter contractor name"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              value={contractor.description}
              onChange={(e) => setContractor(prev => ({ ...prev, description: e.target.value }))}
              disabled={loading}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid',
                borderRadius: '4px',
                borderColor: colors.cardBorder,
                backgroundColor: colors.cardBg,
                color: colors.bodyText,
                fontSize: '14px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              placeholder="Enter contractor description"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>Additional Fields</label>
              <Button type="button" onClick={addAdditionalData} disabled={loading} size="small">
                +
              </Button>
            </div>

            {contractor.additionalData.map((field, index) => (
              <div key={index} style={{
                border: '1px solid',
                borderRadius: '4px',
                padding: '15px',
                marginBottom: '10px',
                borderColor: colors.cardBorder,
                backgroundColor: colors.cardBg,
                color: colors.bodyText,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Field {index + 1}</span>
                  <Button type="button" onClick={() => removeAdditionalData(index)} disabled={loading} size="small">
                    X
                  </Button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={field.fieldName}
                      onChange={(e) => updateAdditionalData(index, 'fieldName', e.target.value)}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="e.g., Phone, License"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Field Type
                    </label>
                    <select
                      value={field.fieldType}
                      onChange={(e) => updateAdditionalData(index, 'fieldType', e.target.value)}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
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
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                    Field Value
                  </label>
                  <input
                    type="text"
                    value={field.fieldValue}
                    onChange={(e) => updateAdditionalData(index, 'fieldValue', e.target.value)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter field value"
                  />
                </div>
              </div>
            ))}

            {contractor.additionalData.length === 0 && (
              <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic' }}>
                No additional fields added. Click "Add Field" to add custom data.
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
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