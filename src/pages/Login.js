import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { useState } from 'react';
import { useAuth } from '../hooks/context/AuthContext';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Initialize SweetAlert2 with React content
const MySwal = withReactContent(Swal);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    // Show SweetAlert2 loading popup
    MySwal.fire({
      title: <p>Logging in...</p>,
      html: <p>Please wait while we authenticate your credentials.</p>,
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading();
      },
    });

    const result = await login({email, password, location});
    if (result.success) {
      const { user } = result.message;
      
      // Show success popup after login is successful
      MySwal.fire({
        icon: 'success',
        title: <p>Login Successful</p>,
        html: <p>Welcome to IT Planet, {user.username || 'User'}!</p>,
        timer: 2000,
        showConfirmButton: false,
      });
    
      navigate(`/${user.location}`);
    } else{
       // Show error popup if login fails
       MySwal.fire({
        icon: 'error',
        title: <p>Login Failed</p>,
        html: <p>{result.message || 'Invalid credentials. Please try again.'}</p>,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="vh-100">
      <div className="container-fluid h-custom">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-md-9 col-lg-6 col-xl-5">
            <img
              src="logo999.jpeg"
              className="img-fluid"
              alt="Sample"
            />
          </div>
          <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
            <h1 className="mb-3">Welcome to, IT Planet</h1>
            <div>
              <div className="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
                <p className="lead fw-normal mb-3 me-3">Sign in</p>
              </div>
              <div className="form-outline mb-4">
                <label className="form-label" htmlFor="form3Example3">
                  Email address
                </label>
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
              <div className="form-outline mb-3">
                <label className="form-label" htmlFor="form3Example4">
                  Password
                </label>
                <input
                  type="password"
                  id="form3Example4"
                  className="form-control form-control-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                />
              </div>
              <div className="form-outline mb-3">
                <label className="form-label">Select Location</label>
                <br />
                <select
                  className="form-select"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  aria-label="Default select example"
                >
                  <option value="" selected disabled>
                    Open this select menu
                  </option>
                  <option value="Nanded">Nanded</option>
                  <option value="Latur">Latur</option>
                </select>
              </div>
             
              <div className="text-center text-lg-start mt-4 pt-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                >
                  Login
                </button>
                <p className="small fw-bold mt-2 pt-1 mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="link-danger">
                    Register
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Login;
