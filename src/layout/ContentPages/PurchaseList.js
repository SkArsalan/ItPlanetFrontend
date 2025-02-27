import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Searchbar from "./TableContents/Searchbar";
import { useSection } from "../../hooks/context/SectionProvider";
import { useAuth } from "../../hooks/context/AuthContext";
import API from "../../api/axios";
import DuePayements from "./PopupContents/DuePayements";
import DataTable from "react-data-table-component";
import "bootstrap-icons/font/bootstrap-icons.css";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";
// import "./PurchaseList.css"; // Import your CSS for styling

const PurchaseList = () => {
  const navigate = useNavigate()
  const {selectedSection} = useSection();
  const {user, isAuthenticated} = useAuth();

  const [searchText, setSearchText] =useState("")
  const [purchaseData, setPurchaseData] = useState([]);
  const [filteredPurchase, setFilteredPurchase] = useState([])
  const[loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 
  const [showDueModal, setShowDueModal] = useState(false);
  const [id, setId] = useState()

  const [expandedRows, setExpandedRows] = useState([])

  const fetchPurchaseList = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get(`/purchase-list`);
      console.log(response)
      setPurchaseData(response.data.purchase);
      setFilteredPurchase(response.data.purchase);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching quotations.");
    } finally {
      setLoading(false);
    }
  },[])

  useEffect(() => {
      if(isAuthenticated){
        fetchPurchaseList();
      }else{
        navigate("/login");
      }
    }, [isAuthenticated, navigate, fetchPurchaseList])

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = purchaseData.filter((item) =>
      Object.values(item).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );
    setFilteredPurchase(filtered);
  }

  const handleView = (purchaseId) => {
    const url = `/${user.location}/pdf-generator?id=${purchaseId}&type=purchase`;
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

  const handleDelete = async (id) => {
    try {
      // Show the confirmation dialog
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You want to Delete the Purchase.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete",
      });
  
      if (result.isConfirmed) {
        // Call the delete API endpoint
        const response = await API.delete(`/delete-purchase/${id}`);
        console.log(response.data.message); // Optionally log the success message
  
        // Optionally, you can show a success notification
        Swal.fire("Deleted!", "The purchase has been deleted.", "success");
      }
      // Remove the deleted item from the salesData and filteredSales arrays
      const updatedPurchaseData = purchaseData.filter(item => item.id !== id);
      setPurchaseData(updatedPurchaseData); // Update the salesData state
  
      // Optionally, if you want to keep the search filter active, update filteredSales
      const updatedFilteredPurchase = filteredPurchase.filter(item => item.id !== id);
      setFilteredPurchase(updatedFilteredPurchase); // Update the filteredSales state
    } catch (error) {
      console.error("Error deleting purchase:", error);
      // Optionally, show an error notification to the user
      Swal.fire("Error!", "There was a problem deleting the purchase.", "error");
    }
  };

  const handleExportToExcel = () => {
  
      const columnOrder = [
        'purchase_number',
        'supplier_name',
        'purchase_date',
      'mobile_number',
      'total',
      'paid',
      'due',
      'payment_status',
      'location',
      ];
      // Rearrange the filteredSales data based on the desired column order
    const rearrangedData = filteredPurchase.map(item => {
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

    const handleExportToPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Supplier Name", "Date", "Purchase", "Payment Status", "Total", "Paid", "Due", "Created By"];
        const tableRows = filteredPurchase.map((item) => [
          item.supplier_name,
          item.purchase_date,
          item.purchase_number,
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
        doc.save("purchase-list.pdf");
      };

  const columns =[
    {name: "Supplier Name", selector: (row) => row.supplier_name, sortable: true,width: "200px"},
    {
      name: "Date",
      selector: (row) =>
        new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(row.purchase_date)),
      sortable: true,
      width: "120px"
    },
    {
      name: "Purchase",
      selector: (row) => row.purchase_number,
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
              onClick={() => navigate(`/${user.location}/${selectedSection}/edit-info?id=${row.id}`)}
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

  const handleRowClick = row => {
    const isRowExpanded = expandedRows.includes(row.id)
    if(isRowExpanded){
      setExpandedRows(expandedRows.filter(id=> id !== row.id))
    } else{
      setExpandedRows([...expandedRows, row.id])
    }
  };

  const expandedRowComponent = row => (
    
    <table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">First</th>
      <th scope="col">Last</th>
      <th scope="col">Handle</th>
    </tr>
  </thead>
  <tbody class="table-group-divider">
    <tr>
      <th scope="row">1</th>
      <td>Mark</td>
      <td>Otto</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Jacob</td>
      <td>Thornton</td>
      <td>@fat</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td colspan="2">Larry the Bird</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</table>
    // <tr>
    //   <td colSpan={columns.length}>
        
    //   {row.details='Data'}
    //   </td>
    // </tr>
  )

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between mb-2">
        <h4 className="fw-bold text-secondary">Purchase List</h4>
        <button
          className="btn btn-primary text-white"
          onClick={() => navigate(`/${user.location}/${selectedSection}/add-purchase`)}
        >
          <i className="bi bi-plus"></i> Add New Purchase
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
                data={filteredPurchase}
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
                expandableRows
                expandableRowsComponent={({ data }) => expandedRowComponent(data)} // Use the custom expanded row component
                onRowClicked={handleRowClick} // Add row click handler to toggle expansion
              />
            </>
          )}
        </div>
      </div>
      {showDueModal && (
        <DuePayements
          onClose={handleCloseDueModal}
          id={id} // Pass the row details if needed
          type = "purchase"
        />
      )}
    </div>
  );
};

export default PurchaseList;
