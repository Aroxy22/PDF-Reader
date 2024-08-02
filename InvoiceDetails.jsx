// src/components/InvoiceDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams hook
import NestedValuesRenderer from './NestedValuesRenderer';
import { useNavigate } from 'react-router-dom';

const InvoiceDetails = () => {
    const { filename } = useParams(); // Get dynamic parameter from URL
    const [invoiceData, setInvoiceData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvoiceData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/invoice/${filename}`);
                const data = await response.json();
                setInvoiceData(data);
            } catch (error) {
                console.error('Error fetching invoice details:', error);
            }
        };
        fetchInvoiceData();
    }, [filename]);

    if (!invoiceData) {
        return <p>Loading invoice details...</p>;
    }

    const handleViewInvoice2 = () => {
        navigate('/'); // Navigate back to the main page
    };
    const handleViewInvoice3 = () => {
        navigate(`/edit_invoice/${filename}`); // Navigate back to the main page
    };
    return (
        <div>
                <div className="button-container">
    <button className="button-right" onClick={handleViewInvoice3}>Go to Edit</button>
    <h2 className="heading-center">View Invoice: {filename}</h2>
    <button className="button-left" onClick={handleViewInvoice2}>Back to Home</button>
</div>
            <NestedValuesRenderer data={invoiceData} />
            
        </div>
    );
};

export default InvoiceDetails;
