import './App.css';
import { BrowserRouter, createBrowserRouter, Navigate, Route, RouterProvider, Routes } from "react-router-dom";
import PageNotFound from './pages/PageNotFound';
import Register from './pages/Register';
import Login from './pages/Login';
import Layout from './pages/Layout';
import InvoiceGenerator from './layout/ContentPages/InvoiceGenerator';
import AddProduct from './layout/ContentPages/AddProduct';
import ProductList from './layout/ContentPages/ProductList';
import AddPurchase from './layout/ContentPages/AddPurchase';
import AddQuotation from './layout/ContentPages/AddQuotation';
import QuotationList from './layout/ContentPages/QuotationList';
import SalesList from './layout/ContentPages/SalesList';
import PurchaseList from './layout/ContentPages/PurchaseList';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hooks/context/AuthContext';

function App() {
  const router = createBrowserRouter([
    {
      path: "/login", element: <Login/>
    },
    {
      path: "/register", element: <Register/>
    },
    {
      path: "/", element:<ProtectedRoute><Layout/></ProtectedRoute>,
      children: [
        {path: "invoice-generator", element: <InvoiceGenerator/>},
        {path: "add-product", element: <AddProduct/>},
        {path: "product-list", element: <ProductList/>},
        {path: "add-purchase", element:<AddPurchase/>},
        {path: "purchase-list", element:<PurchaseList/>},
        {path: "add-quotation", element:<AddQuotation/>},
        {path: "quotation-list", element:<QuotationList/>},
        {path: "sales-list", element: <SalesList/>}
      ]
    }
  ])
  return (
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  );
}

export default App;
