import { GetContractorDTO } from "@/types/DTOs/get_contractor";
import { AddNewContractorDTO } from "@/types/DTOs/new_contractor";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5070/api';

const contractorsService = {
  async getAll(page:number, count:number, orderByAsc:boolean) {
    const response = await fetch(`${API_BASE_URL}/contractors`);
    if (!response.ok) throw new Error('Failed to fetch contractors');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        count: count.toString(),
        orderByAsc: orderByAsc.toString()
      });
      
      const response = await fetch(`${API_BASE_URL}/contractors?${params.toString()}`, {
        headers: {
        'Content-Type': 'application/json',
        'userId': '1'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
            
      return response.json();
    } catch (err) {
      console.error('Error fetching contractors:', err);
      throw err;
    }
  },

  async getById(id:number) {
    try{

    } catch (err) {
      console.error('Error fetching contractors:', err);
      throw err;
    }
    const response = await fetch(`${API_BASE_URL}/contractors/${id}`);
    //if (!response.ok) throw new Error('Failed to fetch contractor');
    return response.json();
  },

  async create(contractor:AddNewContractorDTO) {
    console.log('Creating contractor in contractors service.');
    const response = await fetch(`${API_BASE_URL}/contractors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contractor),
    });
    //if (!response.ok) throw new Error('Failed to create contractor');
    return response.json(); 
  },

  async update(id:number, contractor:AddNewContractorDTO) {
    const response: Response = await fetch(`${API_BASE_URL}/contractors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'UserId': '1'
      },
      body: JSON.stringify(contractor),
    });
    return response.json();
  },

  async delete(id:number) {
    try {      
      const response = await fetch(`${API_BASE_URL}/contractors/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'UserId': '1'
        },
        method: 'DELETE'
      });
      
      //if (!response.ok) {
      //  throw new Error(`HTTP error! status: ${response.status}`);
      //}
      
      return response.json();
    } catch (err) {
      console.error('Error deleting contractor:', err);
      throw err;
    }
  },

  async loadSampleData() {
      return [
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
    }
};

export default contractorsService;