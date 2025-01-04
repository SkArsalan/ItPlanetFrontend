import React, { useRef, useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import API from "../api/axios";
import { useAuth } from "../hooks/context/AuthContext";

const PdfGenerator = ({ productIds = [], externalData = {}, heading }) => {
    const {user} = useAuth()
    const pdfRef = useRef();
    const [productDetails, setProductDetails] = useState([]);

  // Fetch product details from backend if productIds are provided
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (productIds.length > 0) {
        try {
          const responses = await Promise.all(
            productIds.map((id) => API.get(`/api/products/${id}`))
          );
          setProductDetails(responses.map((res) => res.data));
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      } else {
        setProductDetails([]);
      }
    };

    fetchProductDetails();
  }, [productIds]);


  const calculateTotal = () => {
    if (productDetails.length > 0) {
      return productDetails.reduce(
        (sum, product) => sum + product.price * (product.quantity || 1),
        0
      );
    } else if (externalData.products && externalData.products.length > 0) {
      return externalData.products.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
    }
    return 0;
  };

  const printPdf = async () => {
    try {
      // Ensure the canvas is generated from the element
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
  
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${externalData.CustomerName || "document"}_invoice.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div>
      {/* PDF Content */}
      <div ref={pdfRef} className="pdf-preview p-4 border" style={{ background: "white" }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1>IT Planet, {user.location}</h1>
            <p>
              {user.location === "Nanded"
                ? "Near Water Tank, Workshop Corner, Nanded, Maharashtra-431605"
                : "Mirtra Nagar Corner, Main Road, Ch. Shivaji Chowk, Latur-413512"}
              <br /> <b>Mobile:</b> 7385154843,{" "}
              {user.location === "Nanded" ? "8421145259" : "7774837006"}
              <br /> <b>Email:</b> itplanet4843@gmail.com
            </p>
          </div>
          <img src="logo999.jpeg" alt="Company Logo" style={{ height: "120px" }} />
        </div>
        <hr />
        <h1 className="text-center">
          <u>{heading}</u>
        </h1>

        {/* Dynamic Data (External or Product Details) */}
        <div className="container mb-3">
          <div className="row row-cols-2 g-3">
            <div className="col">
              <strong>Client:</strong>{" "}
              {externalData.CustomerName || "N/A"}
            </div>
            <div className="col">
              <strong>Date:</strong>{" "}
              {externalData.reportDate || new Date().toLocaleDateString()}
            </div>
            <div className="col">
              <strong>Mobile Number:</strong>{" "}
              {externalData.mobileNumber || "N/A"}
            </div>
            <div className="col">
              <strong>Report Number:</strong>{" "}
              {externalData.quotationNumber || "N/A"}
            </div>
          </div>
        </div>

        {/* Product Table */}
        <table className="table">
          <thead className="table-dark">
            <tr>
              <th>Item Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {productDetails.length > 0 ? (
              productDetails.map((product, index) => (
                <tr key={index}>
                  <td>
                    {product.name}{" "}
                  </td>
                  <td>{product.description}</td>
                  <td>{product.quantity || 1}</td>
                  <td>{product.price}</td>
                  <td>
                    {(product.price * (product.quantity || 1)).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : externalData.products ? (
              externalData.products.map((item, index) => (
                <tr key={index}>
                  <td>
                    {item.name}{" "}
                  </td>
                  <td>{item.description}</td>
                  <td>{item.qty}</td>
                  <td>{item.price}</td>
                  <td>
                    {(item.price * item.qty)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No products available.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Total Calculation */}
        <h4>
          Total: Rs. {calculateTotal().toFixed(2)}
        </h4>
        <p className="text-muted">
          Owner's Signature: <u>{user.username}</u>
        </p>
        <hr />
      </div>

      {/* Print Button */}
      <div className="mt-4">
        <button
        onClick={printPdf}
        className="btn btn-primary">
          Print PDF
        </button>
      </div>
    </div>
  );
};

export default PdfGenerator;
