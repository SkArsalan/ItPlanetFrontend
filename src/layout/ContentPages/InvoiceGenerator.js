import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../hooks/context/AuthContext";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal); 

const InvoiceGenerator = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const {user} = useAuth()
 
  const initialInvoice = {
    customer_name: "",
    invoiceDate: "",
    invoiceNumber: "",
    MobileNumber: "",
    items: [],
    total: 0,
    paid: 0, // Highlighted Addition
    createdBy: user.username || "Admin",
    location: user.location
    
  }
  const [invoice, setInvoice] = useState(initialInvoice);

  const initialItem ={ item_id:0,item_name: "",description: "", qty: 0, selling_price: 0, subtotal: 0 }

  const [item, setItem] = useState(initialItem);
  const [editIndex, setEditIndex] = useState(null);
  const invoiceRef = useRef(null);

   // Set current date and generate invoice number
   useEffect(() => {
    const today = new Date();
    const formattedDate = today
      .toLocaleDateString("en-GB")
      .split("/")
      .reverse()
      .join("-"); // Convert to YYYY-MM-DD

    const generatedInvoiceNumber = `INV-${Date.now()}`; // Unique invoice number based on timestamp

    setInvoice((prev) => ({
      ...prev,
      invoiceDate: formattedDate,
      invoiceNumber: generatedInvoiceNumber,
    }));
  }, []);


useEffect(() => {
  const fetchItemDetails = async () => {
    try {
      if (location.state && location.state.receiptData) {
        const receiptId = location.state.receiptData.id; // Assuming receiptData includes an ID
        const response = await API.get(`/item/${receiptId}`);
        
        const receiptItem = response.data; // Adjust based on API response structure
        const newItem = {
          item_id: receiptId,
          item_name: receiptItem.product_name,
          description: receiptItem.description,
          // qty: receiptItem.quantity,
          qty: 1,
          selling_price: receiptItem.selling_price,
          subtotal: 1 * receiptItem.selling_price,
        };

        // Check if the item already exists in the invoice to avoid duplicates
        setInvoice((prev) => {
          const itemExists = prev.items.some(
            (item) => item.item_name === newItem.item_name
          );

          if (itemExists) {
            return prev; // Do nothing if the item already exists
          }

          return {
            ...prev,
            items: [...prev.items, newItem],
            total: prev.total + newItem.subtotal,
          };
        });
      }
    } catch (error) {
      console.error("Error fetching receipt data:", error);
      // Optionally, add user feedback like a toast or error message
    }
  };

  fetchItemDetails();
}, [location.state]);


const [inventory, setInventory] = useState([]); // To store inventory items
const [filteredItems, setFilteredItems] = useState([]); // Filtered items for autocomplete
// fetch Inventory from APi

useEffect(() => {
  const fetchInventory = async() => {
    try{
      const response = await API.get(`/list/${user.location}`);
      setInventory(response.data.inventory)
    } catch(error){
      console.log("Error fetching inventory:", error);
    }
  }
  fetchInventory();
}, [user.location]);


  // Add or Update Item
  const saveItem = () => {
    if (item.item_name && item.description && item.qty > 0 && item.selling_price > 0) {
      const newItem = { ...item, subtotal: item.qty * item.selling_price };
  
      if (editIndex !== null) {
        const updatedItems = [...invoice.items];  // Make a copy of the current items
        const oldSubtotal = updatedItems[editIndex].subtotal;
  
        // Update the item at the specific edit index
        updatedItems[editIndex] = newItem;
  
        // Update the total price by subtracting the old subtotal and adding the new one
        setInvoice((prev) => ({
          ...prev,
          items: updatedItems,
          total: prev.total - oldSubtotal + newItem.subtotal,
        }));
  
        // Reset editIndex after the update
        setEditIndex(null);
      } else {
        // If not in edit mode, add a new item
        setInvoice((prev) => ({
          ...prev,
          items: [...prev.items, newItem],
          total: prev.total + newItem.subtotal,
        }));
      }
  
      // Reset the item form to initial state after adding/updating
      setItem(initialItem);
    }
  };
  

  const editItem = (index) => {
    setItem(invoice.items[index]);
    setEditIndex(index);
  };

  const deleteItem = (index) => {
    const updatedItems = [...invoice.items];
    const removedItem = updatedItems.splice(index, 1)[0];
    setInvoice((prev) => ({
      ...prev,
      items: updatedItems,
      total: prev.total - removedItem.subtotal,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItem((prev) => ({ ...prev, [name]: value }));

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

  // Handle item selection
  const handleSelectItem = (selectedItem) => {
    setItem({
      item_id: selectedItem.id,
      item_name: selectedItem.product_name,
      description: selectedItem.description,
      selling_price: selectedItem.selling_price,
      qty: 1, // Default quantity
    });
    setFilteredItems([]); // Clear suggestions
  }

  
  const handleClearLocation = () => {
    // Update the state of the current location
    navigate(location.pathname, { state: null });
  };

  // Export PDF Function
  const exportToPDF = async () => {

    try{

      // Validation: Check if required fields are filled
    if (!invoice.customer_name || !invoice.MobileNumber || !invoice.paid) {
      alert('Please fill all required fields before exporting!');
      return; // Stop execution if validation fails
    }

    // Show SweetAlert2 Loading popup
    MySwal.fire({
      title: <p>Exporting Invoice...</p>,
      html: <p>Please wait while we generate the PDF.</p>,
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading();
      },
    }); // Highlighted: Added loading popup before export starts
    // Hide Edit and Delete buttons before exporting
    const buttons = document.querySelectorAll('.no-print');
    buttons.forEach(button => button.style.display = 'none');

    const response = await API.post("/save-invoice", invoice);
    if (response.status === 201) {
    // Use html2canvas to generate image for PDF
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${invoice.customer_name}_invoice.pdf`);
      // Show SweetAlert2 success popup
      MySwal.fire({
        icon: "success",
        title: <p>Invoice Exported Successfully</p>,
        html: <p>The invoice was successfully exported as a PDF.</p>,
        timer: 3000,
        showConfirmButton: false,
      }); // Highlighted: Added success popup after export is complete
    } else {
      MySwal.fire({
        icon: "error",
        title: <p>Export Failed</p>,
        html: <p>Failed to save the invoice. PDF will not be generated.</p>,
      }); // Highlighted: Error alert if the API request fails
    }

    buttons.forEach(button => button.style.display = '');
    
    // Reset invoice state and clear the table
    setInvoice(initialInvoice); // Clear invoice state
    setItem(initialItem);   // Clear item state
    handleClearLocation();
    window.location.reload();
  } catch(error){
    console.error("Error exporting PDF or updating stock:", error);
     // Show SweetAlert2 error popup
    // Show SweetAlert2 error popup
    MySwal.fire({
      icon: "error",
      title: <p>An Error Occurred</p>,
      html: <p>There was an issue exporting the PDF. Please try again.</p>,
    });
  }
  };

  return (
    <div className="container mt-4">
      {/* Invoice Form */}
      <div>
        <h2>Invoice Details</h2>
        <form>
          <div className="mb-3">
            <label className="form-label">Client Name</label>
            <input
              type="text"
              className="form-control"
              name="customer_name"
              value={invoice.customer_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="row">
            <div className="col">
              <label className="form-label">Invoice Date</label>
              <input
                type="date"
                className="form-control"
                name="invoiceDate"
                value={invoice.invoiceDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="col">
              <label className="form-label">Invoice Number</label>
              <input
                type="text"
                className="form-control"
                name="invoiceNumber"
                value={invoice.invoiceNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="mb-3 mt-3">
            <label className="form-label">Mobile Number</label>
            <input
              type="text"
              className="form-control"
              name="MobileNumber"
              value={invoice.MobileNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
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
  <label className="form-label">Paid</label>
  <input
    type="number"
    className="form-control no-scroll"
    name="paid"
    value={invoice.paid}
    onChange={handleInputChange}
    placeholder="Enter the amount paid"
    required
  />
</div>
        </form>
      </div>

      {/* Add Items Section */}
      <h2>Add Items</h2>
      <div className="mb-3">
        <label className="form-label">Item Name</label>
        <input
          type="text"
          className="form-control"
          name="item_name"
          value={item.item_name}
          onChange={handleItemChange}
        />
    {/* Autocomplete dropdown */}
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
      <div className="mb-3">
        <label className="form-label">Description</label>
        <input
          type="text"
          className="form-control"
          name="description"
          value={item.description}
          onChange={handleItemChange}
          
        />
      </div>
      <div className="row mb-3">
        <div className="col">
          <label className="form-label">Quantity</label>
          <input
            type="number"
            className="form-control"
            name="qty"
            value={item.qty}
            onChange={handleItemChange}
          />
        </div>
        <div className="col">
          <label className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            name="selling_price"
            value={item.selling_price}
            onChange={handleItemChange}
            
          />
        </div>
        
      </div>
      
      <button className="btn btn-primary mb-4" onClick={saveItem}>
        {editIndex !== null ? "Update Item" : "Add Item"}
      </button>

      {/* Invoice Preview */}
      <div ref={invoiceRef} className="invoice-preview p-4 border" style={{ background: "white" }}>
      
        <div className="d-flex justify-content-between align-items-center">
        <div>
        <h1>IT Planet, {user.location}</h1>
        <p>{user.location === "Nanded" ? "Neaar water Tank, Workshop corner, Nanded, Maharashtra-431605"
         : "Mirtra Nagar Corner, Main Road, Ch. Shivaji Chowk, Latur-413512"} 
          <br /> <b>Mobile:</b> 7385154843, {user.location === "Nanded" ? "8421145259" : "7774837006"} 
          <br /> <b>Email:</b> itplanet4843@gmail.com</p>
        </div>
          <img src="logo999.jpeg" alt="Company Logo" style={{ height: "120px" }} />
        </div>
        <hr />
        <div className="d-flex justify-content-center align-items-center">
        <h1><u>Invoice</u></h1>
        </div>
        <div className="container  mb-3">
  <div className="row row-cols-2 g-3">
    <div className="col"><strong>Client:</strong> {invoice.customer_name}</div>
    <div className="col"><strong>Date:</strong> {invoice.invoiceDate}</div>
    <div className="col"><strong>Mobile Number:</strong> {invoice.MobileNumber}</div>
    <div className="col"><strong>Invoice Number:</strong> {invoice.invoiceNumber}</div>
  </div>
</div>
    
        <table className="table">
          <thead className="table-dark">
            <tr>
              <th>Item Name with Description</th>
              <th>Quantity</th>
              <th>Selling Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
  {invoice.items.map((item, index) => (
    <tr key={index}>
      <td>
        {item.item_name}{" "}
        <span style={{ fontSize: "0.85em", color: "#666" }}>
          ({item.description})
        </span>
      </td>
      <td>{item.qty}</td>
      <td>{item.selling_price}</td>
      <td>{item.subtotal}</td>
      <td>
        <button
          onClick={() => editItem(index)}
          className="btn btn-sm btn-warning no-print"
        >
          Edit
        </button>
        <button
          onClick={() => deleteItem(index)}
          className="btn btn-sm btn-danger ms-2 no-print"
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
        <div className="mb-3"><h4>Total: Rs. {invoice.total}</h4></div>
        <div className="mb-3"><h4><strong>Paid: Rs. </strong> {invoice.paid}</h4></div>
        <p className="text-muted">Owner's Signature: <u>{user.username}</u></p>
        <hr />
      </div>

      {/* Print and Export Buttons */}
      <div className="mt-4">
        
        <button className="btn btn-success" onClick={exportToPDF}>
          Export as PDF
        </button>
      </div>
    </div>
  );
};

export default InvoiceGenerator;