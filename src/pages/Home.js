import { useNavigate, Link } from 'react-router-dom';
import './Login.css';


function Home() {
    const navigate = useNavigate()
    const handleNavigate = () => {
        navigate('/login')
    }
  return (
    <div className="vh-100">
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
              <button
                  onClick={handleNavigate}
                  className="btn btn-primary btn-lg"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                >
                  Login
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
