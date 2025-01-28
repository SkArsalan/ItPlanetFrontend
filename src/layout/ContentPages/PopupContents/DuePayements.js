import { useEffect } from "react";
import { useState } from "react";
import API from "../../../api/axios";

function DuePayements({ onClose, id }) {

  const [currentPay, setCurrentPay] = useState(0)
  const [dues, setDues] = useState(0);
  const [remainingDue, setRemainingDue] = useState(dues)

  const fetchDueDetails = async() => {
    try{
      const response = await API.get(`/due-payments/${id}`);
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

  async function handleSubmit() {
      
    try {
      const response = await API.put(`/update-due-payments/${id}`, {
        paid: Number(currentPay),
        due: remainingDue,
      });
      console.log(response.data.message || "Payments updated successfully");
    } catch (error) {
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
          <h5 className="modal-title">Due Payments</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <h5 className="mb-2">Due Amount To Pay: <span><b>{dues}</b></span></h5>
            
            <div className="col mb-2">
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
              <label className="form-label">Currently Paying: </label>
              <input
                type="number"
                className="form-control no-scroll"
                name="currentpay"
                value={currentPay}
                onChange={handleChange} // Assuming handleChange is defined
              />
            </div>
            <h5>Remaining Pay: <span><b>{remainingDue}</b></span></h5>
            <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
          </form>
        </div>
        
      </div>
    </div>
  </div>
</>

  );
}

export default DuePayements;
