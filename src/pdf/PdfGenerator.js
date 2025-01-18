import React, { useRef, useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import API from "../api/axios";
import { useAuth } from "../hooks/context/AuthContext";
import { useSearchParams } from "react-router-dom";

const PdfGenerator = ({ productIds = [], externalData = {}, heading }) => {
  console.log(externalData)
    const {user} = useAuth()
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const type = searchParams.get("type");
    const pdfRef = useRef();
    const [details,  setDetails] = useState({})
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
  // Fetch product details from backend if productIds are provided
  useEffect(() => {
    const fetchDetails = async () => {
      try{
        let response;
        if(type === "invoice"){
          response = await API.get(`/invoice-details/${id}`)
        } else if(type === "quotation"){
          response = await API.get(`/quotation-details/${id}`)
        }
        setDetails(response.data)
      } catch(err){
        setError(err.response?.data?.message || "Failed to fetch details.");
      } finally{
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, type]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  const calculateTotal = () => {
     if (externalData.products && externalData.products.length > 0) {
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
      pdf.save(`${details.customer_name || "document"}_${type==="invoice" ? "invoice" : "quotation"}.pdf`);
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
          <img src="/logo999.jpeg" alt="Company Logo" style={{ height: "120px" }} />
        </div>
        <hr />
        <h1 className="text-center">
          <u>{type === "invoice" ? "Invoice" : "Quotation"}</u>
        </h1>

        {/* Dynamic Data (External or Product Details) */}
        <div className="container mb-3">
          <div className="row row-cols-2 g-3">
            <div className="col">
              <strong>Client:</strong>{" "}
              {details.customer_name || externalData.CustomerName || "N/A"}

            </div>
            <div className="col">
              <strong>Date:</strong>{" "}
              { new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date(details.date ))|| externalData.reportDate || new Date().toLocaleDateString()}
            </div>
            <div className="col">
              <strong>Mobile Number:</strong>{" "}
              {details.mobile_number || externalData.mobileNumber || "N/A"}
            </div>
            <div className="col">
              <strong>{type === "invoice" ? "Invoice Number": "Quotation Number"}:</strong>{" "}
              {type === "invoice" ? details.invoice_number : details.quotation_number || externalData.quotationNumber || "N/A"}

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
            {details.products.length > 0 ? (
              details.products.map((product, index) => (
                <tr key={index}>
                  <td>
                    {product.product_name}{" "}
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
          {/* Total: Rs. {calculateTotal().toFixed(2)} */}
          Total: Rs. {details.total}
        </h4>
        {type === "invoice" ? <div className="mb-3"><h4><strong>Paid: Rs. </strong> {details.paid}</h4></div> : <span></span>}
        <p className="text-muted">
          {/* Owner's Signature: <u>{user.username}</u> */}
          Owner's Signature: <u>{details.created_by}</u>
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
