import React from 'react';

const transformLabel = (label) => {
    const formattedLabel = label.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    switch (formattedLabel) {
        case 'Gst Number':
            return 'GST';
        case 'Pan':
            return 'PAN';
        case 'Total Amount With Gst':
            return 'Total Amount with GST';
        default:
            return formattedLabel;
    }
};

const NestedField = ({ fieldKey, fieldValue, handleChange, parentKey = '' }) => {
    const fullKey = parentKey ? `${parentKey}.${fieldKey}` : fieldKey;
    const displayKey = transformLabel(fieldKey);

    if (fieldKey === 'items' && Array.isArray(fieldValue)) {
        return (
            <div className="nested-section">
                <div className="section-header">{displayKey}</div>
                <div className="section-content">
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fieldValue.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="text"
                                            name={`${fullKey}[${index}].name`}
                                            value={item.name}
                                            onChange={handleChange}
                                            className="nested-value"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name={`${fullKey}[${index}].quantity`}
                                            value={item.quantity}
                                            onChange={handleChange}
                                            className="nested-value"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name={`${fullKey}[${index}].unit_price`}
                                            value={item.unit_price}
                                            onChange={handleChange}
                                            className="nested-value"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name={`${fullKey}[${index}].total_price`}
                                            value={item.total_price}
                                            onChange={handleChange}
                                            className="nested-value"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (fieldKey === 'invoice_details' && typeof fieldValue === 'object' && fieldValue !== null) {
        const leftColumnKeys = ['gst_number','invoice_number', 'invoices_date', 'pan','seller'];
        const rightColumnKeys = ['customer_address', 'purchase_date', 'order_number','seller_address','customer_name'];

        return (
            <div className="nested-section">
                <div className="section-header">{displayKey}</div>
                <div className="section-content invoice-details-container">
                    <div className="left-column">
                        {leftColumnKeys.map((nestedKey) => (
                            <div className="nested-field" key={nestedKey}>
                                <label className="nested-label">{transformLabel(nestedKey)}:</label>
                                <input
                                    type="text"
                                    name={`${fullKey}.${nestedKey}`}
                                    value={fieldValue[nestedKey] || ''}
                                    onChange={handleChange}
                                    className="nested-value"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="right-column">
                        {rightColumnKeys.map((nestedKey) => (
                            <div className="nested-field" key={nestedKey}>
                                <label className="nested-label">{transformLabel(nestedKey)}:</label>
                                <input
                                    type="text"
                                    name={`${fullKey}.${nestedKey}`}
                                    value={fieldValue[nestedKey] || ''}
                                    onChange={handleChange}
                                    className="nested-value"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (fieldKey === 'total_amount_with_gst') {
        return (
            <div className="nested-section" >
                <div className="section-content">
                    <table className="total-amount-table">
                        <tbody>
                            <tr>
                                <td className="nested-label-of-edit-totalgst">{displayKey}:</td>
                                <td className="nested-value" >
                                    <input style={{ fontWeight: 'bolder' }}
                                        type="text"
                                        name={fullKey}
                                        value={fieldValue}
                                        onChange={handleChange}
                                        className="nested-value"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (fieldKey === 'duplicate') {
        // Don't display this field separately, as it will be displayed in the items table
        return null;
    }

    if (typeof fieldValue === 'object' && fieldValue !== null) {
        return (
            <div className="nested-section">
                <div className="section-header">{displayKey}</div>
                <div className="section-content">
                    {Object.keys(fieldValue).map((nestedKey) => (
                        <NestedField
                            key={nestedKey}
                            fieldKey={nestedKey}
                            fieldValue={fieldValue[nestedKey]}
                            handleChange={handleChange}
                            parentKey={fullKey}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="nested-field">
            <label className="nested-label">{displayKey}:</label>
            <input
                type="text"
                name={fullKey}
                value={fieldValue}
                onChange={handleChange}
                className="nested-value"
            />
        </div>
    );
};

export default NestedField;
