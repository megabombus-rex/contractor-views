export interface AdditionalDataDTO {
    fieldName: string,
    fieldType: 'string' | 'int' | 'double' | 'bool' | 'date';
    fieldValue: string
}