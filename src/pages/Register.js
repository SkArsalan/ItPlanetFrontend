import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import API from '../api/axios';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);


function Register() {
    const navigate = useNavigate();

    // State variables for form fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [location, setLocation] = useState('');

    async function handleRegister() {
      if (!fullName || !email || !password || !confirmPassword || !location) {
          alert('All fields are required');
          return;
      }
  
      if (password !== confirmPassword) {
          alert('Passwords do not match');
          return;
      }

      // Show loading popup while the registration request is in progress
      MySwal.fire({
        title: <p>Registering...</p>,
        html: <p>Please wait while we register your account.</p>,
        allowOutsideClick: false,
        didOpen: () => {
          MySwal.showLoading();
        },
      });

  
      try{
        const response = await API.post('/register', {
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
        location,
        })
        // Show success popup after registration is successful
        MySwal.fire({
            icon: 'success',
            title: <p>Registration Successful</p>,
            html: <p>You can now log in with your credentials!</p>,
            timer: 3000,
            showConfirmButton: false,
          });
      navigate('/login', { replace: true });
      }catch (error) {
       // Show error popup if registration fails
       MySwal.fire({
        icon: 'error',
        title: <p>Registration Failed</p>,
        html: <p>{error.response?.data?.message || 'Something went wrong. Please try again.'}</p>,
      });
      }
  }
  

    return (
        <form className="vh-100">
            <div className="container-fluid h-custom">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-md-9 col-lg-6 col-xl-5">
                        <img 
                            src="logo999.jpeg" 
                            className="img-fluid"
                            alt="Sample image"
                        />
                    </div>
                    <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                        <form>
                            <div className="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
                                <p className="lead fw-normal mb-3 me-3">
                                    <h1>Register</h1>
                                </p>
                            </div>

                            {/* Full Name Input */}
                            <div className="form-outline mb-4">
                                <label className="form-label" htmlFor="formFullName">Full Name</label>
                                <input 
                                    type="text" 
                                    id="formFullName" 
                                    className="form-control form-control-lg"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Email Input */}
                            <div className="form-outline mb-4">
                                <label className="form-label" htmlFor="form3Example3">Email address</label>
                                <input 
                                    type="email" 
                                    id="form3Example3" 
                                    className="form-control form-control-lg"
                                    placeholder="Enter a valid email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="form-outline mb-4">
                                <label className="form-label" htmlFor="form3Example4">Password</label>
                                <input 
                                    type="password" 
                                    id="form3Example4" 
                                    className="form-control form-control-lg"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Confirm Password Input */}
                            <div className="form-outline mb-4">
                                <label className="form-label" htmlFor="form3Example5">Confirm Password</label>
                                <input 
                                    type="password" 
                                    id="form3Example5" 
                                    className="form-control form-control-lg"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Location Dropdown */}
                            <div className="form-outline mb-3">
                                <label className="form-label">Select Location</label><br />
                                <select 
                                    className="form-select"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required 
                                    aria-label="Default select example"
                                >
                                    <option value="" selected disabled>Open this select menu</option>
                                    <option value="Nanded">Nanded</option>
                                    <option value="Latur">Latur</option>
                                </select>
                            </div>

                            <div className="text-center text-lg-start mt-4 pt-2">
                                <button 
                                    type="button" 
                                    className="btn btn-primary btn-lg"
                                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                                    onClick={handleRegister}
                                >
                                    Register
                                </button>
                                <p className="small fw-bold mt-2 pt-1 mb-0">
                                    Already have an account? <Link to="/login" className="link-danger">Login</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default Register;
