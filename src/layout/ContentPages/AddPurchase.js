import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useSection } from "../../hooks/context/SectionProvider";
import API from "../../api/axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";

const AddPurchase = () => {
  const {user, isAuthenticated} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {selectedSection} = useSection()

  
  const initialFormData = {
    supplier_name: "",
    mobile_number: "",
    purchase_number: `PUR-${Date.now()}`,
    purchase_date: new Date().toLocaleDateString("en-GB")
    .split("/")
    .reverse()
    .join("-"),
    categories: selectedSection,
    products: [],
    total_price: 0,
    paid: 0,
    location: user.location,
    created_by: user.username || "Admin",
  };

  const initialProductData = {
    name: "",
    description: "",
    qty: "",
    price: "",
    tax: "",
    sub_total: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [newProduct, setNewProduct] = useState(initialProductData);
  const [editIndex, setEditIndex] = useState(null);

  // AutoComplete
  const [inventory, setInventory] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    const fetchInventory = async() => {
      try{
        const response = await API.get(`/list/${user.location}`);
        setInventory(response.data.inventory)
      } catch(error){
        console.log("Error fetching inventory:", error)
      }
    }
    fetchInventory();
  }, [user.location]);

  const handleSelectItem = (selectedItem) => {
    setNewProduct({
      name: selectedItem.product_name, // Populate the product name
      description: selectedItem.description || "", // Description
      price: selectedItem.selling_price || "", // Selling price
      qty: 1, // Default quantity
      sub_total: selectedItem.selling_price || "", // Sub-total (optional)
    });
    setFilteredItems([]); // Clear suggestions after selection
  };
  

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));

    // Filter items based on user input
    if(value.trim() !== ""){
      const matches = inventory.filter((product) =>
      product.product_name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(matches);
    }else{
      setFilteredItems([]);
    }
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
      updatedProducts.reduce((sum, product) => sum + product.sub_total, 0)
    );
  
    setFormData({
      ...formData,
      products: updatedProducts,
      total_price: updatedTotalPrice,
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
      total_price: updatedTotalPrice,
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

    const { supplier_name, mobile_number, purchase_number, purchase_date, categories } = formData;

    if (!supplier_name || !mobile_number || !purchase_number || !purchase_date || !categories) {
      return alert("All fields are required!");
    }

    if (formData.products.length === 0) {
      return alert("Please add at least one product!");
    }
    console.log("Submitting Purchase Data:", formData);
    
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

    const endpoint = "/add-purchase";

    const method = "post"

    try{
      const response = await API[method](endpoint, formData);

      // Close the loading SweetAlert2 and show success message
      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.data.message || "Product saved successfully",
      });
     setFormData(initialFormData);
    } catch (error){
      console.error("Error adding purchase: ", error);
      const errorMessage = error.response?.data?.message || "An error occurred while adding the purchase"
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
            <h4>Add Purchase</h4>
            <h6>Add/Update Purchase</h6>
          </div>
        </div>

        {/* Form Section */}
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Purchase Details</h5>
            <form>
              <div className="row">
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Supplier Name</label>
                    <input
                      type="text"
                      name="supplier_name"
                      className="form-control"
                      value={formData.supplier_name}
                      onChange={handleFormChange}
                      placeholder="Enter Supplier Name"
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobile_number"
                      className="form-control"
                      value={formData.mobile_number}
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
                    <input
                    type="text"
                      name="categories"
                      className="form-control"
                      value={formData.categories}
                      onChange={handleFormChange}
                      required
                      disabled
                    >
                    </input>
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Purchase Number</label>
                    <input
                      type="text"
                      name="purchase_number"
                      className="form-control"
                      value={formData.purchase_number}
                      onChange={handleFormChange}
                      placeholder="Enter Purchase Number"
                      
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Purchase Date</label>
                    <input
                      type="date"
                      name="purchase_date"
                      value={formData.purchase_date}
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
                    {/* AutoComplete dropdown */}
                    {filteredItems.length > 0 && (
  <ul className="dropdown-menu show" style={{ position: "absolute", zIndex: 1000 }}>
    {filteredItems.map((product) => (
      <li
        key={product.id}
        className="dropdown-item"
        onClick={() => handleSelectItem(product)}
        style={{ cursor: "pointer" }}
      >
        <strong>{product.product_name}</strong>
        <br />
        <small>
          {product.description} | {product.categories} | ₹{product.selling_price}
        </small>
      </li>
    ))}
  </ul>
)}


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

                {/* {Tax Section} */}
                <div className="col-lg-3 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Tax (%)</label>
                    <input
                      type="number"
                      name="tax"
                      value={newProduct.tax}
                      onChange={handleProductChange}
                      className="form-control"
                      placeholder="Enter Tax Percentage"
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
                      <strong>{formData.total_price}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="5" className="text-end">
                      <strong>Paid:</strong>
                    </td>
                    <td colSpan="2">
                    <style>
    {`
      .no-scroll::-webkit-inner-spin-button,
      .no-scroll::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .no-scroll {
        -moz-appearance: textfield; /* For Firefox */
      }
      .no-scroll::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
        display: none; /* Hides outer spin button */
      }
      .no-scroll::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
        display: none; /* Hides inner spin button */
      }
    `}
  </style>
                      <strong><input
                      type="number"
                      name="paid"
                      value={formData.paid}
                      onChange={handleFormChange}
                      className="form-control no-scroll"
                      placeholder="Enter Price"
                      required
                    /></strong>
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
        </div>
      </div>
    </div>
  );
};

export default AddPurchase;
