import { AddNewContractorDTO } from "@/types/DTOs/new_contractor";

export interface EditState {
  mode: 'create' | 'edit' | 'closed';
  contractor: AddNewContractorDTO | null;
  contractorId: number | null;
  loading: boolean;
  error: string | null;
}