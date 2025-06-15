import { AdditionalDataDTO } from "./new_additional_data";

export interface AddNewContractorDTO {
    name: string,
    description: string,
    userId: number,
    additionalData: AdditionalDataDTO[]
}