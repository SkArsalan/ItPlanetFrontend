import React, { useState } from "react";

const AddPurchase = () => {
  const [supplierName, setSupplierName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    qty: "",
    price: "",
    discount: "",
    tax: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.qty || !newProduct.price) {
      alert("Please fill all required fields (Name, Quantity, Price)!");
      return;
    }

    // Calculate derived fields
    const taxAmount = ((newProduct.price * newProduct.tax) / 100).toFixed(2);
    const unitCost = (newProduct.price - newProduct.discount + parseFloat(taxAmount)).toFixed(2);
    const totalCost = (newProduct.qty * unitCost).toFixed(2);

    const productToAdd = {
      ...newProduct,
      taxAmount,
      unitCost,
      totalCost,
    };

    setProducts([...products, productToAdd]);

    // Reset new product input fields
    setNewProduct({
      name: "",
      qty: "",
      price: "",
      discount: "",
      tax: "",
    });
  };

  const deleteProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const handleSubmit = () => {
    if (!supplierName || !purchaseDate) {
      alert("Please select Supplier Name and Purchase Date!");
      return;
    }

    if (products.length === 0) {
      alert("Please add at least one product!");
      return;
    }

    const purchaseData = {
      supplierName,
      purchaseDate,
      products,
    };

    console.log("Purchase Data:", purchaseData);
    alert("Purchase submitted successfully!");
    // Reset fields
    setSupplierName("");
    setPurchaseDate("");
    setProducts([]);
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

        <div className="card">
          <div className="card-body">
            {/* Supplier and Purchase Date */}
            <div className="row">
              <div className="col-lg-6 col-sm-6 col-12">
                <div className="form-group">
                  <label>Supplier Name</label>
                  <select
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="form-control"
                  >
                    <option value="">Select Supplier</option>
                    <option value="Supplier 1">Supplier 1</option>
                    <option value="Supplier 2">Supplier 2</option>
                    <option value="Supplier 3">Supplier 3</option>
                  </select>
                </div>
              </div>

              <div className="col-lg-6 col-sm-6 col-12">
                <div className="form-group">
                  <label>Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            {/* Add Product Form */}
            <div className="row">
              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter Product Name"
                  />
                </div>
              </div>

              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="qty"
                    value={newProduct.qty}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter Quantity"
                  />
                </div>
              </div>

              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter Price"
                  />
                </div>
              </div>

              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                  <label>Discount ($)</label>
                  <input
                    type="number"
                    name="discount"
                    value={newProduct.discount}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter Discount"
                  />
                </div>
              </div>

              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                  <label>Tax (%)</label>
                  <input
                    type="number"
                    name="tax"
                    value={newProduct.tax}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter Tax Percentage"
                  />
                </div>
              </div>

              <div className="col-lg-3 col-sm-6 col-12">
                <button onClick={addProduct} className="btn btn-primary mt-4">
                  Add Product
                </button>
              </div>
            </div>

            {/* Product Table */}
            <div className="table-responsive mt-4">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>QTY</th>
                    <th>Price ($)</th>
                    <th>Discount ($)</th>
                    <th>Tax %</th>
                    <th>Tax Amount ($)</th>
                    <th>Unit Cost ($)</th>
                    <th>Total Cost ($)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index}>
                      <td>{product.name}</td>
                      <td>{product.qty}</td>
                      <td>{product.price}</td>
                      <td>{product.discount}</td>
                      <td>{product.tax}</td>
                      <td>{product.taxAmount}</td>
                      <td>{product.unitCost}</td>
                      <td>{product.totalCost}</td>
                      <td>
                        <button
                          onClick={() => deleteProduct(index)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No products added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="row mt-4">
              <div className="col-lg-12">
                <button onClick={handleSubmit} className="btn btn-primary me-2" type="submit">
                  Submit
                </button>
                <button className="btn btn-cancel">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPurchase;
