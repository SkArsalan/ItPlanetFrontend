// src/components/AddProduct.js

import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/context/AuthContext"; // Assuming you're using a context for authentication
import API from "../../api/axios"; // Assuming API is an axios instance configured for your backend
import { useLocation, useNavigate } from "react-router-dom";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";
import { useSection } from "../../hooks/context/SectionProvider";


const AddProduct = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {selectedSection} = useSection()

  const productToEdit = location.state?.product || null;
  const initialData = {
    product_name: "",
    description: "",
    quantity: "",
    status: "Not Ready",
    purchase_price: "",
    selling_price: "",
    categories: selectedSection,
    location: user.location,
    date: new Date().toLocaleDateString("en-GB")
    .split("/")
    .reverse()
    .join("-"),
  };
  
  const [formData, setFormData] = useState(initialData);
  const { isAuthenticated } = useAuth();  // Check if user is authenticated and get token if needed

  useEffect(() => {
    if (productToEdit){
      setFormData(productToEdit); // Populate form data if editing
    }
  }, [productToEdit])

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(e) {
    console.log(formData)
    e.preventDefault();

    if (!isAuthenticated) {
      Swal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "User is not authenticated. Please login first.",
      });
      return;
    }
    console.log("Submitting data", formData);

    // Display the loading SweetAlert2
  const MySwal = withReactContent(Swal);
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

    const endpoint = productToEdit ? `/update/${productToEdit.id}` //Update endpoint if editing
     : "/add"; //Add endpoint if creating

     const method = productToEdit ? "put" : "post"

    try {
      const response = await API[method](endpoint, formData);

       // Close the loading SweetAlert2 and show success message
    Swal.fire({
      icon: "success",
      title: "Success",
      text: response.data.message || "Product saved successfully",
    });

      productToEdit ? navigate(`/${user.location}/${selectedSection}/product-list`) : setFormData(initialData); // Reset form
    } catch (error) {
      console.error("Error adding product:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while adding the product";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage || "An error occurred while saving the product",
      });
    }
  }

  function handleCancel() {
    Swal.fire({
      title: "Are you sure?",
      text: "Your changes will not be saved.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        productToEdit ? navigate("/product-list") : setFormData(initialData);
      }
    });
  }
  

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title">
            <h4>{productToEdit ? "Edit Product" : "Add Product"}</h4>
            <h6>{productToEdit ? "Update product details" : "Create new product"}</h6>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-body">
              <div className="row">
                {/* Product Name */}
                <div className="col-lg-3 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      name="product_name"
                      className="form-control"
                      value={formData.product_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="col-lg-3 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Category</label>
                    <input
                    type="text"
                      name="categories"
                      className="form-control"
                      value={formData.categories} // Bind location value to formData
                      onChange={handleChange} // Update formData when input changes
                      required
                      disabled
                    >
                      
                    </input>
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-lg-3 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      className="form-control"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                {/* {Purchase_price} */}
                <div className="col-lg-3 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Purchase Price</label>
                    <input type="number"
                    name="purchase_price"
                    className="form-control"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    required
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="col-lg-3 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Selling Price</label>
                    <input
                      type="number"
                      name="selling_price"
                      className="form-control"
                      value={formData.selling_price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                {/* Purchase Date */}

                <div className="col-lg-3 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Date</label>
                    <input 
                    type="date"
                    name="date"
                    className="form-control"
                    value={formData.date}
                    onChange={handleChange}
                    />
                  </div>
                </div>


                {/* Description */}
                <div className="col-lg-12">
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                {/* Status */}
                <div className="col-lg-3 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="Not Ready">Not Ready</option>
                      <option value="Ready">Ready</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="col-lg-3 col-sm-6 col-12">
  <div className="form-group">
    <label>Location</label>
    <input
          type="text"
          name="location"
          className="form-control"
          value={formData.location} // Bind location value to formData
          onChange={handleChange} // Update formData when input changes
          required
          disabled // Disable if you want to make location non-editable (optional)
        />
  </div>
</div>


                {/* Buttons */}
                <div className="col-lg-12 d-flex justify-content-start mt-3">
                  <button type="submit" className="btn btn-primary me-2 text-white">
                    {productToEdit ? "Update" : "Submit"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
