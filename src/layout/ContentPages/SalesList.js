import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";

const SalesList = () => {
  const navigate = useNavigate()
  return (
    <div className=" container mt-5 page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title">
          <div className="d-flex justify-content-between mb-2"> <h4 className="fw-bold text-secondary">Sales LIST</h4>
      
      {/* Add New Puchase */}
      <button 
      className="btn btn-primary text-white"
      onClick={() => navigate('/invoice-generator')}
      >
              <i className="bi bi-plus"></i> Add New Sales
            </button></div> 
            
          </div>
        </div>

        {/* Card Section */}
        <div className="card">
          <div className="card-body">
            {/* Filter and Search Section */}
            <div className="table-top">
            <div className="d-flex justify-content-between align-items-center mb-3">
            {/* Search and Filter */}
            <div className="search-bar d-flex align-items-center">
              <button className="btn btn-primary">
              <i className="bi bi-funnel"></i>
              </button>
              <input
                type="text"
                className="form-control ms-2"
                placeholder="Search..."
                style={{ width: "200px" }}
              />
            </div>
            <div className="wordset">
                
            <i className="bi bi-file-earmark-pdf-fill fs-3 text-danger"></i>
            <i className="bi bi-file-earmark-spreadsheet fs-3 text-success"></i>
            <i className="bi bi-printer fs-3"></i>
              </div>
          </div>
              
            </div>

<form className="mb-3">
  <div className="row">
    <div className="col">
    
                <div className="form-group">
                  
                  <input
                    type="date"
                    // value={purchaseDate}
                    // onChange={(e) => setPurchaseDate(e.target.value)}
                    className="form-control"
                    
                  />
                </div>
              
    </div>
    <div className="col">
      <input type="text" className="form-control" placeholder="Enter Reference"/>
    </div>
    <div className="col">
      <select className="form-control">
        <option selected>Choose...</option>
        <option>...</option>
      </select>
    </div>
    <div className="col">
      <select className="form-control">
        <option selected>Choose...</option>
        <option>...</option>
      </select>
    </div>
    <div className="col">
      <select className="form-control">
        <option value="">Choose...</option>
        <option>...</option>
      </select>
    </div>
    <div className="col-auto">
      <button type="submit" className="btn btn-primary mb-2"><i className="bi bi-search"></i></button>
    </div>
  </div>
</form>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>
                      <label className="checkboxs">
                        <input type="checkbox" id="select-all" />
                        <span className="checkmarks"></span>
                      </label>
                    </th>
                    {["Customer", "Date", "Invoice", "Status","Payment", "Total", "Paid", "Due", "Created By", "Actions"].map(
                      (heading, index) => (
                        <th key={index}>{heading}</th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {/* Replace the below rows with dynamic data */}
                  {[...Array(10)].map((_, index) => (
                    <tr key={index}>
                      <td>
                        <label className="checkboxs">
                          <input type="checkbox" />
                          <span className="checkmarks"></span>
                        </label>
                      </td>
                      <td className="text-bolds">Name {index + 1}</td>
                      <td>19 Nov 2022</td>
                      <td>PT00{index + 1}</td>
                      <td>
                        <span className="badges bg-lightgreen">Pending</span>
                      </td>
                      <td><span className="badges bg-lightgreen">Due</span></td>
                      <td>250</td>
                      <td>250</td>
                      <td>0</td>
                      <td>Admin</td>
                      <td>
        <div className="dropdown ms-auto">
          {/* Dropdown toggle button */}
          <i 
            className="fas fa-ellipsis-vertical dropdown-toggle" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
            style={{ cursor: 'pointer' }} // Make the cursor a pointer
          ></i>

          {/* Dropdown menu */}
          <ul className="dropdown-menu">
          <li>
            <span className="dropdown-item">
              <i className="bi bi-eye-fill mx-2"></i> View
              </span>
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
      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesList;
