
# Project Title

A web application that facilitates the upload of invoice PDFs, processes them using OpenAI’s GPT-3.5 model for fine-tuned data extraction, and stores the extracted data in a MongoDB NoSQL database. Built with React for a responsive user interface, this application supports PDF editing and provides functionality for exporting data to Excel format, ensuring seamless data manipulation and retrieval.



## Features

- User-Interface with dashboard and responsive design
- Processes Customer Invoices in the form of PDFs
- Extracts specific data according to the user
- Gives an option to edit the details of Invoices
- Converts the data into CSV format



## Tech Stack

Frontend: React, Vite, Axios, Bootstrap, CSS
Backend: Flask, Python 3, OpenAI GPT-3.5 Turbo, RESTful API
Python Libraries: Flask-CORS, PyMuPDF (fitz), OpenAI, PyMongo, Pandas, JSON, IO
Database: MongoDB
Styling: CSS


## Requirements

- Python 3.7+
- Flask
- Flask-CORS
- PyMuPDF (fitz)
- OpenAI
- PyMongo
- Pandas
- xlsxwriter
- React
- Vite
- Axios

## Installation

1. Clone this repository:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Set up the backend environment:
    - Install the required Python packages:
      ```bash
      pip install -r requirements.txt
      ```

3. Set up the frontend environment:
    - Navigate to the frontend folder:
     
    - Install the required Node.js packages:
      ```bash
      npm install
      ```

4. Update environment variables:
    - Set up your OpenAI API key in a `.env` file or environment variable:
      ```
      OPENAI_API_KEY=your_openai_api_key
      ```

5. Run the backend server:
    ```bash
    python api.py
    ```

6. Run the frontend development server:
    ```bash
    npm run dev
    ```

## Usage

1. Open the application in your web browser.
2. Use the file upload interface to select and upload an invoice PDF.
3. The application will process the PDF and extract key details.
4. Edit the PDF content if necessary using the provided tools.
5. Export the extracted data to an Excel file through the export functionality.
6. View and manage your invoices using the provided interfaces.

## How It Works

1. Users upload invoice PDFs through the web interface.
2. The backend extracts text from the PDF using PyMuPDF.
3. Extracted text is processed by OpenAI’s GPT-3.5 Turbo to retrieve specific invoice details.
4. The extracted data is stored in a MongoDB database.
5. Users can view, edit, and export invoice data as needed.

## Files



### Frontend

- `FileUpload.jsx`: Handles file upload and displays the list of processed invoices.
- `EditInvoice.jsx`: Allows editing of invoice details.
- `InvoiceDetails.jsx`: Displays detailed information about a specific invoice.
- `NestedField.jsx`: Manages nested fields within an invoice.
- `NestedValuesRenderer.jsx`: Renders nested values from the invoice data.

### Backend

- `app.py`: Main Flask application file. Contains service logic, including GPT-3.5 interaction and PDF processing.

## Notes

- Ensure you have the necessary permissions to read and write files in the specified locations.
- The performance of data extraction may vary based on the quality of the invoice PDFs.
- Large invoices or multiple files may take longer to process.

## Developers

- Ashmitha Mohan (https://github.com/aryanmehra)
- Aryan Mehra (https://github.com/AshmithaMohan)

