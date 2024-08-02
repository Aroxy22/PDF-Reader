import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NestedValuesRenderer from './NestedValuesRenderer';

const FileUpload = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoiceData, setSelectedInvoiceData] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate for navigation

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/invoices');
            const data = await response.json();
            setInvoices(data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFiles(Array.from(event.target.files));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]);
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/process_invoice', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            console.log('Uploaded files:', result);
            fetchInvoices(); // Refresh invoices after upload
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = async (filename) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/invoice/${filename}`);
            const data = await response.json();
            setSelectedInvoiceData(data);
            navigate(`/invoice/${filename}`); // Navigate to invoice details page
        } catch (error) {
            console.error('Error fetching invoice details:', error);
        }
    };

    const handleEditInvoice = async (filename) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/invoice/${filename}`);
            const data = await response.json();
            setSelectedInvoiceData(data);
            navigate(`/edit_invoice/${filename}`); // Navigate to edit invoice page
        } catch (error) {
            console.error('Error fetching invoice details:', error);
        }
    };

    const handleExportInvoices = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/export_invoices');
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'invoices.xlsx';
                link.click();
                URL.revokeObjectURL(url);
            } else {
                console.error('Error exporting invoices');
            }
        } catch (error) {
            console.error('Error exporting invoices:', error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" multiple onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
            {loading && <p>Loading...</p>}

            <h2>Processed PDFs</h2>
            
            <table>
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Processed At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice, index) => (
                        <tr key={index}>
                            <td>{invoice.filename}</td>
                            <td>{invoice.processed_at}</td>
                            <td>
                                <button onClick={() => handleViewInvoice(invoice.filename)}>View</button>
                                <button onClick={() => handleEditInvoice(invoice.filename)}>Edit</button>
                            </td>
                        </tr>
                    ))}
                    {/* Placeholder row during file upload */}
                    {loading && selectedFiles.map((file, index) => (
                        <tr key={index}>
                            <td colSpan="2">Processing {file.name}...</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={handleExportInvoices}>Export Invoices</button>
            {/* Conditionally render invoice details */}
            {selectedInvoiceData && (
                <div>
                    <h2>Invoice Details: {selectedInvoiceData.invoice_number}</h2>
                    <NestedValuesRenderer data={selectedInvoiceData} />
                </div>
            )}
        </div>
    );
};

export default FileUpload;
