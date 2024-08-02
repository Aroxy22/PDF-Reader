import React from 'react';

const NestedValuesRenderer = ({ data }) => {
    const renderObject = (obj) => {
        const leftColumnKeys = ['invoice_number', 'gst_number', 'invoices_date', 'pan','seller'];
        const rightColumnKeys = ['order_number', 'customer_address', 'purchase_date','seller_address','customer_name'];

        const leftColumn = [];
        const rightColumn = [];
        const otherFields = [];

        Object.entries(obj).forEach(([key, value]) => {
            // Transform the key to display
            const transformedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

            // Special handling for PAN and GST
            const displayKey = key === 'pan' ? 'PAN' : (key === 'gst_number' ? 'GST' : transformedKey);
            if (key === 'duplicate') {
                // Skip rendering the "duplicate" label and value
                return;
            }

            const renderedField = typeof value === 'object' && value !== null
                ? (key === 'purchase_details' && value.items
                    ? (
                        <div className="nested-section" key={key}>
                            <div className="section-header">{displayKey}</div>
                            <div className="section-content">
                                <table className="purchase-details-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Quantity</th>
                                            <th>Unit Price</th>
                                            <th>Total Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {value.items.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.unit_price}</td>
                                                <td>{item.total_price}</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan="3" className="total-amount-label">Total Amount with GST:</td>
                                            <td className="total-amount-value">{value.total_amount_with_gst}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                    : (
                        <div className="nested-section" key={key}>
                            <div className="section-header">{displayKey}</div>
                            <div className="section-content">
                                {renderObject(value)}
                            </div>
                        </div>
                    ))
                : (
                    <div className="nested-field" key={key}>
                        <span className="nested-label">{displayKey}:</span>
                        <span className="nested-value">{value}</span>
                    </div>
                );

            if (leftColumnKeys.includes(key)) {
                leftColumn.push(renderedField);
            } else if (rightColumnKeys.includes(key)) {
                rightColumn.push(renderedField);
            } else {
                otherFields.push(renderedField);
            }
        });
        

        return (
            <div>
                <div className="invoice-details-container">
                    <div className="left-column">{leftColumn}</div>
                    <div className="right-column">{rightColumn}</div>
                </div>
                {otherFields}
            </div>
        );
    };

    return <div className="nested-values-container">{renderObject(data)}</div>;
};

export default NestedValuesRenderer;
