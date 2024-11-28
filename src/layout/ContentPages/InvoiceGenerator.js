import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useLocation } from "react-router-dom";

const InvoiceGenerator = () => {
  const location = useLocation()
  const [invoice, setInvoice] = useState({
    clientName: "",
    invoiceDate: "",
    dueDate: "",
    invoiceNumber: "",
    items: [],
    total: 0,
    accountNumber: "123567744",
    routingNumber: "120000547",
  });

  const initialItem ={ item_name: "",description: "", qty: 1, price: 0, subtotal: 0 }

  const [item, setItem] = useState(initialItem);
  const [editIndex, setEditIndex] = useState(null);
  const invoiceRef = useRef(null);

  useEffect(() => {
    // Only run this effect if location.state.receiptData exists and item isn't already in invoice
    if (location.state && location.state.receiptData) {
      const receiptItem = location.state.receiptData;
      const newItem = {
        item_name: receiptItem.name,
        description: receiptItem.description,
        qty: receiptItem.quantity,
        price: receiptItem.price,
        subtotal: receiptItem.quantity * receiptItem.price,
      };

      // Check if the item already exists in the invoice to avoid duplicates
      setInvoice((prev) => {
        const itemExists = prev.items.some(item => item.item_name === newItem.item_name);

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
  }, [location.state]); 

  // Add or Update Item
  const saveItem = () => {
    if (item.item_name && item.description && item.qty > 0 && item.price > 0) {
      const newItem = { ...item, subtotal: item.qty * item.price };
  
      if (editIndex !== null) {
        const updatedItems = [...invoice.items];
        const oldSubtotal = updatedItems[editIndex].subtotal;
        updatedItems[editIndex] = newItem;
  
        setInvoice((prev) => ({
          ...prev,
          items: updatedItems,
          total: prev.total - oldSubtotal + newItem.subtotal,
        }));
        setEditIndex(null);
      } else {
        setInvoice((prev) => ({
          ...prev,
          items: [...prev.items, newItem],
          total: prev.total + newItem.subtotal,
        }));
      }
  
      // Reset the item form to initial state
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
  };

  // Print Invoice
  const printInvoice = () => {
    window.print();
  };

  // Export PDF Function
  const exportToPDF = async () => {
    // Hide Edit and Delete buttons before exporting
    const buttons = document.querySelectorAll('.no-print');
    buttons.forEach(button => button.style.display = 'none');

    // Use html2canvas to generate image for PDF
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("invoice.pdf");

    // Restore buttons after export
    buttons.forEach(button => button.style.display = '');
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
              name="clientName"
              value={invoice.clientName}
              onChange={handleInputChange}
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
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-control"
                name="dueDate"
                value={invoice.dueDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="mb-3 mt-3">
            <label className="form-label">Mobile Number</label>
            <input
              type="text"
              className="form-control"
              name="invoiceNumber"
              value={invoice.invoiceNumber}
              onChange={handleInputChange}
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
            name="price"
            value={item.price}
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
          <h1>Invoice</h1>
          <img src="logo512.png" alt="Company Logo" style={{ height: "50px" }} />
        </div>
        <p><strong>Client:</strong> {invoice.clientName}</p>
        <p><strong>Date:</strong> {invoice.invoiceDate}</p>
        <p><strong>Due:</strong> {invoice.dueDate}</p>
        <p><strong>Number:</strong> {invoice.invoiceNumber}</p>
        <table className="table">
          <thead>
            <tr>
              <th>Item Name with Description</th>
              <th>Quantity</th>
              <th>Price</th>
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
      <td>{item.price}</td>
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
        <h4>Total: ${invoice.total}</h4>
        <p><strong>Account:</strong> {invoice.accountNumber}</p>
        <p><strong>Routing:</strong> {invoice.routingNumber}</p>
        <p className="text-muted">Owner's Signature: __________________</p>
      </div>

      {/* Print and Export Buttons */}
      <div className="mt-4">
        <button className="btn btn-secondary me-2" onClick={printInvoice}>
          Print
        </button>
        <button className="btn btn-success" onClick={exportToPDF}>
          Export as PDF
        </button>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
