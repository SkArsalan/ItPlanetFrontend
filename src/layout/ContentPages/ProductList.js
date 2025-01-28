

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import DataTable from "react-data-table-component";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Add this import
import * as XLSX from "xlsx";
import API from "../../api/axios";
import { useAuth } from "../../hooks/context/AuthContext";
import "./TableContents/DropDown.css"
import { useSection } from "../../hooks/context/SectionProvider";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";

const ProductList = () => {
  const navigate = useNavigate();
  const {selectedSection} = useSection();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const { user, isAuthenticated } = useAuth();

  // Memoized fetchProducts function
  const fetchProducts = useCallback(async () => {
    try {
      if (!user?.location) {
        console.error("User location is not set");
        return;
      }

      const response = await API.get(`/list/${user.location}/${selectedSection}`);
      setProducts(response.data.inventory);
      setFilteredProducts(response.data.inventory);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  }, [user?.location, selectedSection]);

  // Fetch products on component mount and when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, fetchProducts, navigate]);


  const handleDelete = async (productId) => {
    try {
      // Show the confirmation dialog
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You want to Delete the Product.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete",
      });
  
      if (result.isConfirmed) {
        // Call the delete API endpoint
        const response = await API.delete(`/delete/${productId}`);
        console.log(response.data.message); // Optionally log the success message
  
        // Optionally, you can show a success notification
        Swal.fire("Deleted!", "The invoice has been deleted.", "success");
      }
      const updatedProducts = products.filter((product) => product.id !== productId);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      // Optionally, show an error notification to the user
      Swal.fire("Error!", "There was a problem deleting the invoice.", "error");
    }
  };

  const handleUpdate = (product) => {
    navigate(`/${user.location}/${selectedSection}/add-product`, { state: { product } });
  };

  const handleReceipt = (product) => {
    const productData = {
      id: product.id,
      name: product.product_name,
      description: product.description,
      quantity: 1,
      selling_price: product.selling_price,
    };
    navigate(`/${user.location}/invoice-generator`, { state: { receiptData: productData } });
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchText(searchValue);

    const filtered = products.filter((product) => {
      return (
        (product.product_name?.toLowerCase().includes(searchValue) || "") ||
        (product.sku?.toLowerCase().includes(searchValue) || "") ||
        (product.location?.toLowerCase().includes(searchValue) || "") ||
        (product.categories?.toLowerCase().includes(searchValue) || "")
      );
    });

    setFilteredProducts(filtered);
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    // Add a heading
  const title = "IT Planet Product Available List";
  doc.setFontSize(18); // Set font size for the title
  doc.text(title, 105, 15, { align: "center" }); // Centered title at the top
    const tableData = filteredProducts.map((product) => [
      product.product_name,
      product.description,
      product.location,
      product.categories,
      product.brand,
      product.selling_price,
      product.quantity,
    ]);
  
    doc.autoTable({
      head: [["Product Name", "description", "Location", "Category", "Brand", "Price", "Quantity"]],
      body: tableData,
      startY: 30,
    });
  
    doc.save("products.pdf");
  };
  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredProducts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products.xlsx");
  };

  const columns = [
    { name: "Product Name", selector: (row) => row.product_name, sortable: true },
    { name: "SKU", selector: (row) => row.sku, sortable: true },
    { name: "Location", selector: (row) => row.location, sortable: true },
    { name: "Category", selector: (row) => row.categories, sortable: true },
    { name: "Brand", selector: (row) => row.brand, sortable: true },
    { name: "Selling Price", selector: (row) => row.selling_price, sortable: true },
    { name: "Quantity", selector: (row) => row.quantity, sortable: true },
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
            <li>
            <button className="dropdown-item" onClick={() => handleReceipt(row)}>
            <i className="bi bi-receipt"></i> Sale
          </button>
            </li>
          
          <li>
          <button className="dropdown-item" onClick={() => handleUpdate(row)}>
            <i className="bi bi-pencil-fill"></i> Update
          </button>
          </li>
          <li>
          <button className="dropdown-item" onClick={() => handleDelete(row.id)}>
            <i className="bi bi-trash-fill"></i> Delete
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
        <h4 className="fw-bold text-secondary">Product List</h4>
        <button className="btn btn-primary text-white" onClick={() => navigate(`/${user.location}/${selectedSection}/add-product`)}>
          <i className="bi bi-plus"></i> Add New Product
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <input
              type="text"
              placeholder="Search..."
              className="form-control w-25"
              value={searchText}
              onChange={handleSearch}
            />
            <div>
              <button className="btn btn-success mx-2" onClick={handleExportToExcel}>
                Export to Excel
              </button>
              <button className="btn btn-danger" onClick={handleExportToPDF}>
                Export to PDF
              </button>
            </div>
          </div>
          <DataTable className="dataTable-container"
            columns={columns}
            data={filteredProducts}
            pagination
            selectableRows
            highlightOnHover
            persistTableHead
            customStyles={{
              rows: {
                style: {
                  fontSize: "16px", // Increase text size
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductList;
