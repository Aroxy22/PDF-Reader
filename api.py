from flask import Flask, jsonify, request, send_file, make_response
from flask_cors import CORS
import fitz
from openai import OpenAI
import json
from pymongo import MongoClient
import os
import datetime
import pandas as pd
from io import BytesIO

app = Flask(__name__)
CORS(app)  # Enable CORS

# Retrieve the API key from environment variable for better security
api_key = os.getenv("OPENAI_API_KEY")

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['invoiceDB']  # Replace 'invoiceDB' with your database name
collection = db['invoices']  # Collection to store invoices


def read_text_from_pdf(pdf_path):
    try:
        text = ""
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        print(f"Error in reading pdf: {e}")
        return None


def chat_with_AI(api_key, text):
    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            messages=[
                {"role": "user", "content": text},
                {"role": "user", "content": "Please extract the following details from the invoice text:"},
                {"role": "user", "content": "1. Invoice date (format: YYYY-MM-DD)"},
                {"role": "user", "content": "2. Invoice number"},
                {"role": "user", "content": "3. Purchase order number"},
                {"role": "user", "content": "4. Purchase date (format: YYYY-MM-DD)"},
                {"role": "user", "content": "5. Customer address"},
                {"role": "user", "content": "6. PAN"},
                {"role": "user", "content": "7. GST number"},
                {"role": "user", "content": "8. List of items"},
                {"role": "user", "content": "9. Total amount including GST"},
                {"role": "user", "content": "10. Seller details"},
                {"role": "user", "content": "11. Seller address details"},
                {"role": "user", "content": "12. Customer name"},
                {"role": "user",
                 "content": "Output the results as a single JSON object with the following structure, ensuring no backslashes are present:"},
                {"role": "user", "content": """
                        {
                          "Details": {
                            "invoice_details": {
                              "invoice_number": "string",
                              "invoices_date": "YYYY-MM-DD",
                              "order_number": "string",
                              "purchase_date": "YYYY-MM-DD",
                              "customer_address": "string",
                              "pan": "string",
                              "gst_number": "string",
                              "seller":"string",
                              "seller_address":"string",
                              "customer_name":"string",
                            },
                            "purchase_details": {
                              "items": [
                                {
                                  "name": "Item1",
                                  "quantity": 2,
                                  "unit_price": 100,
                                  "total_price": 200
                                }
                                "total_amount_with_gst": 230.50
                              ],

                            }
                          }
                        }
                            """},
                {"role": "user", "content": "Ensure all attributes are included even if they have a value of 0."},
                {"role": "user",
                 "content": "If the invoice spans multiple pages or there are multiple invoices in one PDF but share the same address and ID, merge them into a single invoice."},
                {"role": "user",
                 "content": "For all price and quantity values, ensure they are in number format (not string format). For example, 'quantity': 2 and 'unit_price': 100.00."},
                {"role": "user",
                 "content": "Replace any special characters or symbols such as '\\u20b9' with 'Rs.' throughout the document."},
                {"role": "user", "content": "Provide only the JSON output in the specified format."},
                {"role": "user", "content": "If any required fields are missing or empty, set their values to 'N/A'."},
                {"role": "user",
                 "content": "Sum the 'total_price' of all items to verify it matches the 'total_amount_with_gst'."}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in generating response from AI: {e}")
        return None


@app.route('/process_invoice', methods=['POST'])
def process_invoice():
    if 'files' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files selected for uploading"}), 400

    responses = {}
    for file in files:
        if file.filename == '':
            continue

        # Save the file to a temporary location
        file_path = os.path.join("/tmp", file.filename)
        file.save(file_path)

        # Read text from the PDF
        pdf_text = read_text_from_pdf(file_path)

        # Process the text with OpenAI API
        if pdf_text:
            json_response = chat_with_AI(api_key, pdf_text)
            if json_response:
                parsed_data = json.loads(json_response)
                parsed_data['filename'] = file.filename  # Add filename to parsed data
                parsed_data['processed_at'] = datetime.datetime.now().strftime(
                    "%d-%m-%Y %H:%M:%S")  # Add created_at timestamp

                # Check if filename already exists in the database
                existing_invoice = collection.find_one({'filename': file.filename})
                if existing_invoice:
                    parsed_data['duplicate'] = True
                    responses[file.filename] = parsed_data
                else:
                    parsed_data['duplicate'] = False
                    collection.insert_one(parsed_data)
                    responses[file.filename] = parsed_data
            else:
                responses[file.filename] = {"error": "Failed to generate response from AI"}
        else:
            responses[file.filename] = {"error": "Failed to read text from the PDF"}

    # Convert responses to JSON, handling ObjectId conversion
    return json.dumps(responses, default=str)


@app.route('/invoices', methods=['GET'])
def get_invoices():
    invoices = list(collection.find({}, {'_id': 0, 'filename': 1,
                                         'processed_at': 1}))  # Retrieve filenames and created_at timestamps
    return jsonify(invoices)


@app.route('/invoice/<filename>', methods=['GET'])
def get_invoice_details(filename):
    try:
        invoice_data = collection.find_one({'filename': filename}, {'_id': 0})
        if invoice_data:
            return jsonify(invoice_data)
        else:
            return jsonify({"error": f"Invoice {filename} not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/view_invoice/<filename>', methods=['GET'])
def view_invoice(filename):
    try:
        file_path = os.path.join("/tmp", filename)
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/update_invoice', methods=['POST'])
def update_invoice():
    try:
        data = request.json
        filename = data.get('filename')
        if not filename:
            return jsonify({"error": "Filename is required"}), 400

        # Find the invoice and update it
        result = collection.update_one({'filename': filename}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"error": "Invoice not found"}), 404

        return jsonify({"message": "Invoice updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/export_invoices', methods=['GET'])
def export_invoices():
    try:
        invoices = list(collection.find({}, {'_id': 0}))  # Retrieve all invoice details

        # Convert invoices to DataFrame
        df = pd.json_normalize(invoices)

        # Define a mapping from the original column names to the desired names
        column_mapping = {
            'Details.invoice_details.invoice_number': 'Invoice Number',
            'Details.invoice_details.invoices_date': 'Invoice Date',
            'Details.invoice_details.order_number': 'Order Number',
            'Details.invoice_details.purchase_date': 'Purchase Date',
            'Details.invoice_details.customer_address': 'Customer Address',
            'Details.invoice_details.pan': 'PAN',
            'Details.invoice_details.gst_number': 'GST Number',
            'Details.invoice_details.seller': 'Seller',
            'Details.invoice_details.seller_address': 'Seller Address',
            'Details.invoice_details.customer_name': 'Customer Name',
            'Details.purchase_details.items': 'Items',
            'Details.purchase_details.total_amount_with_gst': 'Total Amount with GST',
            'filename': 'Filename',
            'processed_at': 'Processed At'
        }

        # Rename the columns in the DataFrame
        df.rename(columns=column_mapping, inplace=True)

        # Format the Items column to be more readable
        def format_items(items):
            formatted_items = []
            for item in items:
                formatted_items.append(f"Name: {item['name']}, Quantity: {item['quantity']}, Unit Price: {item['unit_price']}, Total Price: {item['total_price']}")
            return '\n'.join(formatted_items)

        df['Items'] = df['Items'].apply(lambda x: format_items(x) if isinstance(x, list) else x)

        # Create a BytesIO buffer to hold the Excel file
        output = BytesIO()

        # Write the DataFrame to the buffer with xlsxwriter engine
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Invoices')
            worksheet = writer.sheets['Invoices']

            # Adjust the column width based on the max length of the data in each column
            for i, col in enumerate(df.columns):
                max_length = max(df[col].astype(str).map(len).max(), len(col))
                worksheet.set_column(i, i, max_length)

        # Seek to the beginning of the stream
        output.seek(0)

        # Create response object
        response = make_response(output.read())
        response.headers["Content-Disposition"] = "attachment; filename=invoices.xlsx"
        response.headers["Content-Type"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
