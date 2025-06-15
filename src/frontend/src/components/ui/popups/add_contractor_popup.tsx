'use client';

import React, { useState } from 'react';
import Button from '../button/button';
import { AdditionalDataDTO } from '@/types/DTOs/new_additional_data';
import { AddNewContractorDTO } from '@/types/DTOs/new_contractor';

interface Result<T> {
  isSuccess: boolean;
  value?: T;
  errorMessage?: string;
  errorCode?: number;
}

interface AddContractorPopupProps {
  targetUrl: string;
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onContractorAdded?: () => void; // Callback to refresh the contractors list
}

const AddContractorPopup: React.FC<AddContractorPopupProps> = ({
  targetUrl,
  userId,
  isOpen,
  onClose,
  onContractorAdded
}) => {
  const [contractor, setContractor] = useState<AddNewContractorDTO>({
    userId: userId,
    name: '',
    description: '',
    additionalData: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addAdditionalField = () => {
    setContractor(prev => ({
      ...prev,
      additionalFields: [
        ...prev.additionalData,
        { fieldName: '', fieldType: 'string', fieldValue: '' }
      ]
    }));
  };

  const removeAdditionalField = (index: number) => {
    setContractor(prev => ({
      ...prev,
      additionalFields: prev.additionalData.filter((_, i) => i !== index)
    }));
  };

  const updateAdditionalField = (index: number, field: keyof AdditionalDataDTO, value: string) => {
    setContractor(prev => ({
      ...prev,
      additionalFields: prev.additionalData.map((item, i) => 
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
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

      const contractorData = {
        name: contractor.name.trim(),
        description: contractor.description.trim(),
        userId: userId,
        additionalData: contractor.additionalData.map(field => ({
          fieldName: field.fieldName.trim(),
          fieldType: field.fieldType,
          fieldValue: field.fieldValue.trim()
        }))
      };

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractorData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // creating a contractor returns his Id (int)
      const result: Result<number> = await response.json();

      if (!result.isSuccess) {
        throw new Error(result.errorMessage || 'Failed to create a contractor.');
      }

      resetForm();
      onClose();
      if (onContractorAdded) {
        onContractorAdded();
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create a contractor.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

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
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Add New Contractor</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '5px',
              color: '#666'
            }}
          >
            ×
          </button>
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
                border: '1px solid #ddd',
                borderRadius: '4px',
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
              <Button type="button" onClick={addAdditionalField} disabled={loading} size="small">
                +
              </Button>
            </div>

            {contractor.additionalData.map((field, index) => (
              <div key={index} style={{
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Field {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeAdditionalField(index)}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d32f2f',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      padding: '2px 5px'
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={field.fieldName}
                      onChange={(e) => updateAdditionalField(index, 'fieldName', e.target.value)}
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
                      onChange={(e) => updateAdditionalField(index, 'fieldType', e.target.value)}
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
                      <option value="varchar">Text (varchar)</option>
                      <option value="int">Number (int)</option>
                      <option value="decimal">Decimal</option>
                      <option value="boolean">Boolean</option>
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
                    onChange={(e) => updateAdditionalField(index, 'fieldValue', e.target.value)}
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
              Create Contractor
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContractorPopup;