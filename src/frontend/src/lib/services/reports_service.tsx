const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5070/api';

const reportsService = {
    async getReport() {
        const response = await fetch(`${API_BASE_URL}/report`, {
                headers: {
                'Content-Type': 'application/pdf',
                'userId': '1'
                }
        });

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/pdf')) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'document.pdf';
            link.click();
            window.URL.revokeObjectURL(url);
        } else {
            return response.json();
        }
    }
}


export default reportsService;