interface ContractorAdditionalData {
  contractorId: number;
  fieldName: string;
  fieldType: 'string' | 'int' | 'double' | 'bool' | 'date';
  fieldValue: string;
}