import { GetAdditionalDataDto } from "./get_additional_data";

export interface GetContractorDTO {
    id: number,
    name: string,
    description: string,
    userId: number,
    additionalData: GetAdditionalDataDto[]
}