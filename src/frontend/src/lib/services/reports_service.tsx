const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5070/api';

const reportsService = {
    async getReport() {
        return await fetch(`${API_BASE_URL}/report`, {
                headers: {
                'Content-Type': 'application/pdf',
                'userId': '1'
                }
            })
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'document.pdf';
                link.click();
                window.URL.revokeObjectURL(url);
            });
    }
}


export default reportsService;