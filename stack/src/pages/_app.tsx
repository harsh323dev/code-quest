import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '../lib/AuthContext';
import '../styles/globals.css';
import '../lib/i18n'; // Ensure i18n is initialized here

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      
      {/* ✅ SINGLE TOAST CONTAINER */}
      {/* This handles all popups globally. Do not put this in other files. */}
      <ToastContainer 
        position="top-center" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> 
    </AuthProvider>
  );
}