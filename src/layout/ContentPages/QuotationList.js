import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/context/AuthContext";
import API from "../../api/axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import DataTable from "react-data-table-component";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./TableContents/DropDown.css"
import { useSection } from "../../hooks/context/SectionProvider";
// import "./PurchaseList.css"; // Import your CSS for styling

const QuotationList = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState("");
  const [quotations, setQuotations]=useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {selectedSection} = useSection();
  const {user, isAuthenticated} = useAuth();

  const fetchQuotationList = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get(`/quotation-list/${user.location}/${selectedSection}`);
      setQuotations(response.data.quotation || []);
      setFilteredQuotations(response.data.quotation || []);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching quotations.");
    } finally {
      setLoading(false);
    }
  },[user?.location, selectedSection])
  

  useEffect(() => {
    if(isAuthenticated){
      fetchQuotationList();
    }else{
      navigate("/login");
    }
  }, [isAuthenticated, navigate, fetchQuotationList])

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase(); // Corrected `toLowerCase`
    setSearchText(value);
  
    const filtered = quotations.filter((item) =>
      Object.values(item).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );
    setFilteredQuotations(filtered);
  };
  
  const handleView = (quotationId) => {
    const url = `/${user.location}/pdf-generator?id=${quotationId}&type=quotation`;
    window.open(url, "_blank")
  }

  // Export to PDF
    const handleExportToPDF = () => {
      const doc = new jsPDF();
      const tableColumn = ["Customer", "Date", "Quotation", "Mobile Number", "Total", "Created By"];
      const tableRows = filteredQuotations.map((item) => [
        item.customer_name,
        item.quotation_date,
        item.quotation_number,
        item.mobile_number,
        item.total,
        item.created_by,
      ]);
  
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
      });
      doc.save("Quotations-list.pdf");
    };

    const handleExportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredQuotations);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Quotation List");
        XLSX.writeFile(workbook, "Quotation-list.xlsx");
      };

      const columns = [
        {name: "Customer", selector: (row) => row.customer_name, sortable: true},
        {
          name: "Date",
          selector: (row) =>
            new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date(row.quotation_date)),
          sortable: true,
        },
        {
          name: "Quotation",
          selector: (row) => row.quotation_number,
          width: "200px"
        },
        {name: "Mobile Number", selector: (row) => row.mobile_number},
        { name: "Total", selector: (row) => row.total },
        { name: "Created By", selector: (row) => row.created_by },
        {
          name: "Actions",
          cell: (row) => (
            <div className="dropdown">
              <i
                className="bi bi-three-dots-vertical"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ cursor: "pointer" }}
              ></i>
              <ul className="dropdown-menu dropdown-menu-end" id="dropdown-menu">
                <li >
                  <button className="dropdown-item" onClick={() => handleView(row.id)}>
                    <i className="bi bi-eye-fill mx-2"></i> View
                  </button>
                </li>
                <li>
                  <span className="dropdown-item">
                    <i className="bi bi-pencil-fill mx-2"></i> Update
                  </span>
                </li>
                <li>
                  <span className="dropdown-item">
                    <i className="bi bi-download mx-2"></i> Download PDF
                  </span>
                </li>
                <li>
                  <span className="dropdown-item">
                    <i className="bi bi-trash-fill mx-2"></i> Delete
                  </span>
                </li>
              </ul>
            </div>
          ),
        },
      ]
      

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between mb-2">
      <h4 className="fw-bold text-secondary">Quotation List</h4>
        <button
          className="btn btn-primary text-white"
          onClick={() => navigate(`/${user.location}/${selectedSection}/add-quotation`)}
        >
          <i className="bi bi-plus"></i> Add New Quotation
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-danger">{error}</div>
          ) :(
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
              data={filteredQuotations}
              pagination
              selectableRows
              highlightOnHover
              persistTableHead
              customStyles={{
                rows: {
                  style: {
                    fontSize: "16px",
                    overflow: "visible",
                  },
                },
              }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationList;
