// EditInvoice.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NestedField from './NestedField';

const EditInvoice = () => {
    const { filename } = useParams(); // Get dynamic parameter from URL
    const [invoiceData, setInvoiceData] = useState(null);
    const [updatedData, setUpdatedData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvoiceData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/invoice/${filename}`);
                const data = await response.json();
                setInvoiceData(data);
                setUpdatedData(data); // Initialize updated data with current invoice data
            } catch (error) {
                console.error('Error fetching invoice details:', error);
            }
        };
        fetchInvoiceData();
    }, [filename]);

    const handleNestedChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        const newData = { ...updatedData };
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        setUpdatedData(newData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5000/update_invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const result = await response.json();
            if (response.ok) {
                console.log('Invoice updated:', result);
                alert("Invoice updated") // Navigate back to the main page
            } else {
                console.error('Error updating invoice:', result);
            }
        } catch (error) {
            console.error('Error updating invoice:', error);
        }
    };

    if (!invoiceData) {
        return <p>Loading invoice details...</p>;
    }
    const handleViewInvoice2 = () => {
        navigate('/'); // Navigate back to the main page
    };
    const handleViewInvoice3 = () => {
        navigate(`/invoice/${filename}`); // Navigate back to the view page
    };

    return (
        <div>
            <div className="button-container">
    <button className="button-right" onClick={handleViewInvoice3}>Go to View</button>
    <h2 className="heading-center">Edit Invoice: {filename}</h2>
    <button className="button-left" onClick={handleViewInvoice2}>Back to Home</button>
</div>
        
            <form onSubmit={handleSubmit}>
                {/* Render input fields dynamically based on invoice data */}
                {Object.keys(invoiceData).map((key) => (
                    <NestedField
                        key={key}
                        fieldKey={key}
                        fieldValue={invoiceData[key]}
                        handleChange={handleNestedChange}
                    />
                ))}
                <button type="submit">Save</button>
            </form>
        </div>
    );
};

export default EditInvoice;
