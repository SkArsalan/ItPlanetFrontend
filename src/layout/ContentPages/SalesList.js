import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import DataTable from "react-data-table-component";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "../../hooks/context/AuthContext";
import API from "../../api/axios";
import "./TableContents/DropDown.css"
import DuePayements from "./PopupContents/DuePayements";
import UpdateInvoice from "./PopupContents/UpdateInvoice";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";

const SalesList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message state
  const { user, isAuthenticated } = useAuth();
  const [showDueModal, setShowDueModal] = useState(false);
  const [updateInvoiceModal, setUpdateInvoiceModal] = useState(false);
  const [id, setId] = useState()

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get(`/invoice-list`);
      setSalesData(response.data.invoice);
      setFilteredSales(response.data.invoice);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSalesData();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Handle search functionality
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = salesData.filter((item) =>
      Object.values(item).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );
    setFilteredSales(filtered);
  };

  const handleView = (invoiceId) => {
    const url = `/${user.location}/pdf-generator?id=${invoiceId}&type=invoice`;
    window.open(url, "_blank")
  }

  const handleDue = (id) => {
    setId(id); // Set the current row to pass details into the modal if needed
    setShowDueModal(true);
  };

  const handleCloseDueModal = () => {
    setShowDueModal(false);
    setId(null); // Clear the selected row after closing the modal
  };

  const handleOpen_UpdateInvoice = (id) => {
    setId(id);
    setUpdateInvoiceModal(true);
  }

  const handleClose_UpdateInvoice = () =>{
    setUpdateInvoiceModal(false);
    setId(null);
  }

  const handleDelete = async (id) => {
    try {
      // Show the confirmation dialog
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You want to Delete the Invoice.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete",
      });
  
      if (result.isConfirmed) {
        // Call the delete API endpoint
        const response = await API.delete(`/delete-invoice/${id}`);
        console.log(response.data.message); // Optionally log the success message
  
        // Optionally, you can show a success notification
        Swal.fire("Deleted!", "The invoice has been deleted.", "success");
      }
      // Remove the deleted item from the salesData and filteredSales arrays
      const updatedSalesData = salesData.filter(item => item.id !== id);
      setSalesData(updatedSalesData); // Update the salesData state
  
      // Optionally, if you want to keep the search filter active, update filteredSales
      const updatedFilteredSales = filteredSales.filter(item => item.id !== id);
      setFilteredSales(updatedFilteredSales); // Update the filteredSales state
    } catch (error) {
      console.error("Error deleting invoice:", error);
      // Optionally, show an error notification to the user
      Swal.fire("Error!", "There was a problem deleting the invoice.", "error");
    }
  };



  // Export to PDF
  const handleExportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Customer", "Date", "Invoice", "Payment Status", "Total", "Paid", "Due", "Created By"];
    const tableRows = filteredSales.map((item) => [
      item.client_name,
      item.invoice_date,
      item.invoice_number,
      item.payment_status,
      item.total,
      item.paid,
      item.due,
      item.created_by,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    });
    doc.save("sales-list.pdf");
  };

  // Export to Excel
  const handleExportToExcel = () => {

    const columnOrder = [
      'invoice_number',
      'client_name',
      'invoice_date',
    'mobile_number',
    'total',
    'paid',
    'due',
    'payment_status',
    'location',
    ];
    // Rearrange the filteredSales data based on the desired column order
  const rearrangedData = filteredSales.map(item => {
    // Create a new object with the properties in the desired order
    const rearrangedItem = {};
    columnOrder.forEach(column => {
      rearrangedItem[column] = item[column];
    });
    return rearrangedItem;
  });
    const worksheet = XLSX.utils.json_to_sheet(rearrangedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales List");
    XLSX.writeFile(workbook, "sales-list.xlsx");
  };

  // Define table columns
  const columns = [
    { name: "Customer", selector: (row) => row.client_name, sortable: true,width: "200px" },
    {
      name: "Date",
      selector: (row) =>
        new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(row.invoice_date)),
      sortable: true,
      width: "120px"
    },    
    {
      name: "Invoice",
      selector: (row) => row.invoice_number,
      width: "200px",
    },
    
    { name: "Payment Status",
      selector: (row) => row.payment_status,
      cell: (row) => {
        const paymentStatus = row.payment_status;

        let color = 'black';
        if(paymentStatus === 'Paid') color = 'green';
        else if (paymentStatus === 'Pending') color = 'red';

        return <span style={{color}}>{paymentStatus}</span>
      },
      sortable: true,
      },
    { name: "Total", selector: (row) => row.total },
    { name: "Paid", selector: (row) => row.paid },
    { name: "Due", selector: (row) => row.due },
    { name: "Created By", selector: (row) => row.created_by },
    {
      name: "Actions",
      cell: (row) => (
        <div className="dropdown" style={{ position: "relative" }}>
          <i
            className="bi bi-three-dots-vertical"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ cursor: "pointer" }}
          ></i>
          <ul className="dropdown-menu dropdown-menu-end" id="dropdown-menu">
            <li>
            <button className="dropdown-item" onClick={() => handleView(row.id)}>
                    <i className="bi bi-eye-fill mx-2"></i> View
                  </button>
            </li>
            <li>
            <button
                className="dropdown-item"
                onClick={() => handleDue(row.id)}
              >
                <i className="bi bi-credit-card-fill mx-2"></i> Due Payments
              </button>
            </li>
            <li>
              <button 
              className="dropdown-item"
              onClick={() => handleOpen_UpdateInvoice(row.id)}
              >
                <i className="bi bi-pencil-fill mx-2"></i> Update
              </button>
            </li>
            <li>
              <button className="dropdown-item" onClick={() => handleDelete(row.id)}>
                <i className="bi bi-trash-fill mx-2"></i> Delete
              </button>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between mb-2">
        <h4 className="fw-bold text-secondary">Sales List</h4>
        <button
          className="btn btn-primary text-white"
          onClick={() => navigate(`/${user.location}/invoice-generator`)}
        >
          <i className="bi bi-plus"></i> Add New Sales
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div>Loading...</div>
          )  : (
            <>
              <div className="d-flex justify-content-between mb-3">
                <input
                  type="text"
                  placeholder="Search..."
                  className="form-control w-25"
                  value={searchText}
                  onChange={handleSearch}
                />
                <div>
                  <button
                    className="btn btn-success mx-2"
                    onClick={handleExportToExcel}
                  >
                    Export to Excel
                  </button>
                  <button className="btn btn-danger" onClick={handleExportToPDF}>
                    Export to PDF
                  </button>
                </div>
              </div>
              
              <DataTable className="dataTable-container"
                columns={columns}
                data={filteredSales}
                pagination
                selectableRows
                highlightOnHover
                persistTableHead
                customStyles={{
                  rows: {
                    style: {
                      fontSize: "16px",
                    },
                  },
                }}
              />
            </>
          )}
        </div>
      </div>
      {showDueModal && (
        <DuePayements
          onClose={handleCloseDueModal}
          id={id} // Pass the row details if needed
        />
      )}

      {
        updateInvoiceModal && (
          <UpdateInvoice
          onClose={handleClose_UpdateInvoice}
          id={id}
          />
        )}
    </div>
  );
};

export default SalesList;
