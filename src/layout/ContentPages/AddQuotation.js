import React, { useState } from "react";
import PdfGenerator from "../../pdf/PdfGenerator"
import { useAuth } from "../../hooks/context/AuthContext";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../api/axios";

const AddQuotation = () => {
  const {user, isAuthenticated} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const quotationToEdit = location.state?.invoice || null; 
  const initialFormData = {
    CustomerName: "",
    mobileNumber: "",
    quotationNumber: `QUO-${Date.now()}`,
    quotationDate: new Date().toLocaleDateString("en-GB")
    .split("/")
    .reverse()
    .join("-"),
    categories: "",
    products: [],
    totalPrice: 0,
    location: user.location,
    createdBy: user.username || "Admin",
  };

  const initialProductData = {
    name: "",
    description: "",
    qty: "",
    price: "",
    sub_total: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [newProduct, setNewProduct] = useState(initialProductData);
  const [editIndex, setEditIndex] = useState(null);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const validateProduct = (product) => {
    const qty = parseFloat(product.qty);
    const price = parseFloat(product.price);

    if (!product.name.trim()) return "Product name cannot be empty!";
    if (isNaN(qty) || qty <= 0) return "Quantity must be a positive number!";
    if (isNaN(price) || price <= 0) return "Price must be a positive number!";
    return null;
  };

  const addOrUpdateProduct = (e) => {
    e.preventDefault();
    const errorMessage = validateProduct(newProduct);
    if (errorMessage) return alert(errorMessage);
  
    const unitCost = parseFloat(newProduct.price);
    
  
    const updatedProduct = { ...newProduct, unitCost, sub_total: parseFloat((parseFloat(newProduct.qty) * unitCost)) }; // Fixed products.sub_total
  
    let updatedProducts;
    if (editIndex !== null) {
      updatedProducts = formData.products.map((p, index) =>
        index === editIndex ? updatedProduct : p
      );
      setEditIndex(null);
    } else {
      updatedProducts = [...formData.products, updatedProduct];
    }
  
    const updatedTotalPrice = parseFloat(
      updatedProducts.reduce((sum, product) => sum + product.sub_total, 0).toFixed(2)
    );
  
    setFormData({
      ...formData,
      products: updatedProducts,
      totalPrice: updatedTotalPrice,
    });
    setNewProduct(initialProductData);
  };

  const deleteProduct = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    const updatedTotalPrice = updatedProducts.reduce(
      (sum, product) => sum + product.sub_total,
      0
    );

    setFormData({
      ...formData,
      products: updatedProducts,
      totalPrice: updatedTotalPrice,
    });
  };

  const editProduct = (index) => {
    setNewProduct(formData.products[index]);
    setEditIndex(index);
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    if (!isAuthenticated){
      Swal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "User is not authenticated. Please login first"
      });
      return;
    }

    const { CustomerName, mobileNumber, quotationNumber, quotationDate, categories } = formData;

    if (!CustomerName || !mobileNumber || !quotationNumber || !quotationDate || !categories) {
      return alert("All fields are required!");
    }

    if (formData.products.length === 0) {
      return alert("Please add at least one product!");
    }
    console.log("Submitting Quotation Data:", formData);
    
    //Display Loading SweetAlert2
    const MySwal = withReactContent(Swal)
    MySwal.fire({
      title: "Processing...",
      text: "Please wait while we process your request.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    const endpoint = quotationToEdit ? `/update-quotation/${quotationToEdit.id}` // Update endpoint if editing
    : "/add-quotation";

    const method = quotationToEdit ? "put" : "post"

    try{
      const response = await API[method](endpoint, formData);

      // Close the loading SweetAlert2 and show success message
      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.data.message || "Product saved successfully",
      });
      quotationToEdit ? navigate("quotation-list") : setFormData(initialFormData);
    } catch (error){
      console.error("Error adding quotation: ", error);
      const errorMessage = error.response?.data?.message || "An error occurred while adding the quotation"
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage || "An error occurred while saving the product",
      })
    }

  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>Add Quotation</h4>
            <h6>Add/Update Quotation</h6>
          </div>
        </div>

        {/* Form Section */}
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Quotation Details</h5>
            <form>
              <div className="row">
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      name="CustomerName"
                      className="form-control"
                      value={formData.CustomerName}
                      onChange={handleFormChange}
                      placeholder="Enter Customer Name"
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      className="form-control"
                      value={formData.mobileNumber}
                      onChange={handleFormChange}
                      placeholder="Enter Mobile Number"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
              <div className="col-lg-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="categories"
                      className="form-select"
                      value={formData.categories}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Choose Category</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Accessories">Accessories</option>
                      <option value="CCTV">CCTV</option>
                    </select>
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Quotation Number</label>
                    <input
                      type="text"
                      name="quotationNumber"
                      className="form-control"
                      value={formData.quotationNumber}
                      onChange={handleFormChange}
                      placeholder="Enter Quotation Number"
                      
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Quotation Date</label>
                    <input
                      type="date"
                      name="quotationDate"
                      value={formData.quotationDate}
                      onChange={handleFormChange}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <h6>Product Details</h6>
              <div className="row">
                <div className="col-lg-3 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newProduct.name}
                      onChange={handleProductChange}
                      className="form-control"
                      placeholder="Enter Product Name"
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-9 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Product Description</label>
                    <input
                      type="text"
                      name="description"
                      value={newProduct.description}
                      onChange={handleProductChange}
                      className="form-control"
                      placeholder="Enter Product Description"
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-3 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      name="qty"
                      value={newProduct.qty}
                      onChange={handleProductChange}
                      className="form-control"
                      placeholder="Enter Quantity"
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-3 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={newProduct.price}
                      onChange={handleProductChange}
                      className="form-control"
                      placeholder="Enter Price"
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-3 col-sm-6 col-12">
                  <button
                    onClick={addOrUpdateProduct}
                    className="btn btn-primary mt-4"
                  >
                    {editIndex !== null ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Review Table Section */}
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title">Review Products</h5>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.products.map((product, index) => (
                    <tr key={index}>
                      <td>{product.name}</td>
                      <td>{product.description}</td>
                      <td>{product.qty}</td>
                      <td>{product.price}</td>
                      <td>{product.unitCost}</td>
                      <td>{product.sub_total}</td>
                      <td>
                        <button
                          onClick={() => editProduct(index)}
                          className="btn btn-warning btn-sm me-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(index)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formData.products.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No products added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5" className="text-end">
                      <strong>Total Price:</strong>
                    </td>
                    <td colSpan="2">
                      <strong>{formData.totalPrice.toFixed(2)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="row mt-4">
          <div className="col-lg-12">
            <button
              onClick={handleSubmit}
              className="btn btn-primary me-2"
              type="submit"
            >
              Submit
            </button>

            <button className="btn btn-cancel">Cancel</button>
          </div>
          <PdfGenerator externalData={formData} heading="Quotation"/>
        </div>
      </div>
    </div>
  );
};

export default AddQuotation;
