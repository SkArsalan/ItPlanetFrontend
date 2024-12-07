import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import API from "../../api/axios";


const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  
  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const response = await API.get("/list"); // Call the GET /list endpoint
      setProducts(response.data.inventory); // Set products in state
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  useEffect(() => {
    fetchProducts(); // Fetch products when component mounts
  }, []);

  // Handle delete product
  const handleDelete = async (productId) => {
    try {
      await API.delete(`/delete/${productId}`); // Call the DELETE /delete/:id endpoint
      setProducts(products.filter(product => product.id !== productId)); // Update state after deletion
    } catch (error) {
      console.error("Error deleting product", error);
    }
  };

  // Handle update product
  const handleUpdate = async (product) => {
    console.log(product)
    navigate('/add-product', {state: {product}})
  };

  const handleReceipt = (product) => {
    // Navigate to the Invoice Generator with default values (quantity set to 1)
    const productData = {
      id: product.id,
      name: product.product_name,
      description: product.description, // Assuming 'description' is a property of product
      quantity: 1, // Default quantity
      price: product.price,
    };
    navigate('/invoice-generator', { state: { receiptData: productData } });
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between mb-2">
        <h4 className="fw-bold text-secondary">Product List</h4>
        <button
          className="btn btn-primary text-white"
          onClick={() => navigate('/add-product')}
        >
          <i className="bi bi-plus"></i> Add New Product
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
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

          <form className="mb-3">
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <input type="date" className="form-control" />
                </div>
              </div>
              <div className="col">
                <input type="text" className="form-control" placeholder="Enter Reference" />
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
                  <option selected>Choose...</option>
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
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>location</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Unit</th>
                  <th>Qty</th>
                  <th>Created By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <label className="checkboxs">
                        <input type="checkbox" />
                        <span className="checkmarks"></span>
                      </label>
                    </td>
                    <td>
                      
                      {product.product_name}
                    </td>
                    <td>{product.sku}</td>
                    <td>{product.location}</td>
                    <td>{product.categories}</td>
                    <td>{product.brand}</td>
                    <td>{product.price}</td>
                    <td>{product.unit}</td>
                    <td>{product.quantity}</td>
                    <td>{product.createdBy}</td>
                    <td>
                    <button className="btn btn-link text-primary" onClick={() => handleReceipt(product)}>
                    <i className="bi bi-receipt"></i>
                      </button>
                      <button className="btn btn-link text-primary" onClick={() => handleUpdate(product)}>
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button className="btn btn-link text-danger" onClick={() => handleDelete(product.id)}>
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <label>Show per page:</label>
              <select className="form-select form-select-sm d-inline-block w-auto ms-2">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <button className="page-link">Previous</button>
                </li>
                <li className="page-item active">
                  <button className="page-link">1</button>
                </li>
                <li className="page-item">
                  <button className="page-link">2</button>
                </li>
                <li className="page-item">
                  <button className="page-link">3</button>
                </li>
                <li className="page-item">
                  <button className="page-link">Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
