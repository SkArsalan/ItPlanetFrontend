import './App.css';
import { BrowserRouter, createBrowserRouter, Navigate, Route, RouterProvider, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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
import PdfGenerator from './pdf/PdfGenerator';

function App() {
  
  const router = createBrowserRouter([
    {
      path: "/login", element: <Login/>
    },
    {
      path: "/register", element: <Register/>
    },
    {
      path: "/:location/", element:<ProtectedRoute><Layout/></ProtectedRoute>,
      children: [
        { index: true, element: <Navigate to="sales-list" /> },
        {path: "invoice-generator", element: <InvoiceGenerator/>},
        {path: ":category/add-product", element: <AddProduct/>},
        {path: ":category/product-list", element: <ProductList/>},
        {path: ":category/add-purchase", element:<AddPurchase/>},
        {path: ":category/purchase-list", element:<PurchaseList/>},
        {path: ":category/add-quotation", element:<AddQuotation/>},
        {path: ":category/quotation-list", element:<QuotationList/>},
        {path: "sales-list", element: <SalesList/>},
        {path: "pdf-generator", element: <PdfGenerator/>},
        {path: "*", element: <PageNotFound/>}
      ]
    }
  ])

  const queryClient = new QueryClient()
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}/>
      <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      
    </AuthProvider>
  );
}

export default App;
