import { useEffect } from "react";
import { useState } from "react";
import API from "../../../api/axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";
import { useSearchParams } from "react-router-dom";

function UpdateInvoice({ onClose, id }) {
    const [currentPay, setCurrentPay] = useState(0)
  const [dues, setDues] = useState(0);
  const [remainingDue, setRemainingDue] = useState(dues)

  const [details,  setDetails] = useState({})
  
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  const fetchDueDetails = async() => {
    try{
      const response = await API.get(`/update-invoice/${id}`);
      console.log(response)
      setDues(response.data)
    }
    catch (error){
      console.log(error.response?.data?.message || error.message);
    }
  }

  useEffect(() => {
      fetchDueDetails()
      
  },[])

  useEffect(() => {
    const result = handleRemainingPay()
    setRemainingDue(result)
  }, [currentPay, dues])

  function handleChange(e){
    const value = e.target.value;
    setCurrentPay(value)
  }

  const handleRemainingPay = () => {
    
      // Ensure dues is a number (in case the API response wasn't a number)
      const validDues = isNaN(dues) ? 0 : dues;
      const result = Number(validDues) - Number(currentPay);
      return result;
    
  }

  async function handleSubmit(e) {
    const MySwal = withReactContent(Swal);
    e.preventDefault();
  
    try {
      // Show the loading modal first
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
  
      // Perform the API call
      const response = await API.put(`/update-due-payments/${id}`, {
        paid: Number(currentPay),
        due: remainingDue,
      });
  
      // Show success message after the API call succeeds
      MySwal.fire({
        title: "Success!",
        text: response.data.message || "Payments updated successfully",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        // Reload the page after the user clicks "OK"
        window.location.reload();
      });
  
      console.log(response.data.message || "Payments updated successfully");
      
    } catch (error) {
      // Show error message if something goes wrong
      MySwal.fire({
        title: "Error!",
        text: "There was an issue updating the payments.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        // Reload the page after the user clicks "OK"
        window.location.reload();
      });
      
      console.error("Error updating payments:", error);
    }
  }
    return (
        <>
  {/* Backdrop */}
  <div className="modal-backdrop fade show" onClick={onClose}></div>

  {/* Modal */}
  <div className="modal fade show d-block" tabIndex="-1" role="dialog">
    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Update Invoice</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
{/* Dynamic Data (External or Product Details) */}
<div className="container mb-3">
          <div className="row row-cols-2 g-3">
            <div className="col">
              <strong>Client:</strong>{" "}
              {details.customer_name || "N/A"}

            </div>
            
            <div className="col">
              <strong>Mobile Number:</strong>{" "}
              {details.mobile_number || "N/A"}
            </div>
            <div className="col">
              <strong>{type === "invoice" ? "Invoice Number": "Quotation Number"}:</strong>{" "}
              {type === "invoice" ? details.invoice_number : details.quotation_number || "N/A"}

            </div>
          </div>
        </div>
        
        <div className="modal-body">
        <table className="table table-hover">
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
            {details.products ? (
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
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No products available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        
      </div>
    </div>
  </div>

  
</>
    )
}

export default UpdateInvoice
