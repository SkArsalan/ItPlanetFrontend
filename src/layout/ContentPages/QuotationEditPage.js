import { useAuth } from "../../hooks/context/AuthContext";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSection } from "../../hooks/context/SectionProvider";
import { useEffect, useState } from "react";
import API from "../../api/axios";

function QuotationEditPage() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSection } = useSection();
  const [searchParams] = useSearchParams(); // Extract the purchase ID from the URL
  const id = searchParams.get("id");

  const initialFormData = {
    customer_name: "",
    mobile_number: "",
    quotation_number: '',
    quotation_date: new Date().toLocaleDateString("en-GB")
      .split("/")
      .reverse()
      .join("-"),
    categories: selectedSection,
    products: [],
    total_price: 0,
    location: user.location,
    created_by: user.username || "Admin",
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
  const [inventory, setInventory] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Fetch purchase details on component mount
  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      try {
        const response = await API.get(`/quotation-details/${id}`);
        console.log(response)
        const { customer_name, mobile_number, quotation_number, date, products, total, created_by } = response.data;

        // Update form data with fetched details
        setFormData({
          customer_name,
          mobile_number,
          quotation_number,
          quotation_date: date,
          products: products.map((product) => ({
            name: product.product_name,
            description: product.description,
            qty: product.quantity,
            price: product.price,
            sub_total: product.subtotal,
          })),
          total_price: total,
          
          created_by,
          categories: selectedSection,
          location: user.location,
        });
      } catch (error) {
        console.error("Error fetching purchase details:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchPurchaseDetails();
  }, [id, user.location, selectedSection]);

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await API.get(`/list/${user.location}`);
        setInventory(response.data.inventory);
      } catch (error) {
        console.log("Error fetching inventory:", error);
      }
    };
    fetchInventory();
  }, [user.location]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });

    // AutoComplete logic
    if (name === "name") {
      const filtered = inventory.filter((item) =>
        item.product_name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const handleSelectItem = (product) => {
    setNewProduct({
      ...newProduct,
      name: product.product_name,
      description: product.description,
      price: product.selling_price,
    });
    setFilteredItems([]);
  };

  const addOrUpdateProduct = (e) => {
    e.preventDefault();
    const sub_total = newProduct.qty * newProduct.price;

    if (editIndex !== null) {
      // Update existing product
      const updatedProducts = [...formData.products];
      updatedProducts[editIndex] = { ...newProduct, sub_total };
      setFormData({
        ...formData,
        products: updatedProducts,
        total_price: updatedProducts.reduce((sum, product) => sum + product.sub_total, 0),
      });
      setEditIndex(null);
    } else {
      // Add new product
      setFormData({
        ...formData,
        products: [...formData.products, { ...newProduct, sub_total }],
        total_price: formData.total_price + sub_total,
      });
    }
    setNewProduct(initialProductData);
  };

  const editProduct = (index) => {
    setNewProduct(formData.products[index]);
    setEditIndex(index);
  };

  const deleteProduct = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      products: updatedProducts,
      total_price: updatedProducts.reduce((sum, product) => sum + product.sub_total, 0),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (e.g., API call)
    console.log("Form Data Submitted:", formData);
    navigate("/success-page"); // Redirect to a success page
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>Edit Quotation</h4>
            <h6>Update Quotation Details</h6>
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
                      name="customer_name"
                      className="form-control"
                      value={formData.customer_name}
                      onChange={handleFormChange}
                      placeholder="Enter customer Name"
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
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Quotation Number</label>
                    <input
                      type="text"
                      name="quotation_number"
                      className="form-control"
                      value={formData.quotation_number}
                      onChange={handleFormChange}
                      placeholder="Enter Purchase Number"
                      disabled
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Quotation Date</label>
                    <input
                      type="date"
                      name="quotation_date"
                      value={formData.quotation_date}
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
}

export default QuotationEditPage;