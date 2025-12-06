import { useState, createContext, useContext } from "react";
import axiosInstance from "./axiosinstance";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);

  const Signup = async ({ name, email, password }) => {
    setloading(true);
    seterror(null);
    try {
      const res = await axiosInstance.post("/user/signup", { name, email, password });
      const { data, token } = res.data;
      const userWithToken = { ...data, token };
      
      localStorage.setItem("user", JSON.stringify(userWithToken));
      setUser(userWithToken);
      
      toast.success("Signup Successful");
      return { success: true };
    } catch (error) {
      const msg = error.response?.data.message || "Signup failed";
      seterror(msg);
      toast.error(msg);
      throw error;
    } finally {
      setloading(false);
    }
  };

  const Login = async ({ email, password }) => {
    setloading(true);
    seterror(null);
    try {
      console.log("🔍 Attempting login to:", "/user/login");
      console.log("📧 Email:", email);
      
      const res = await axiosInstance.post("/user/login", { email, password });
      
      console.log("✅ Login response status:", res.status);
      console.log("📦 Response data:", res.data);

      // Handle OTP Case (Status 202)
      if (res.status === 202) {
        setloading(false);
        console.log("🔒 Chrome detected - OTP required");
        return { requiresOTP: true, email: res.data.email }; 
      }

      // ✅ Standard Success Case
      const { data, token } = res.data;
      const userWithToken = { ...data, token };
      
      localStorage.setItem("user", JSON.stringify(userWithToken));
      setUser(userWithToken);
      
      console.log("✅ User set in context:", userWithToken);
      toast.success("Login Successful");
      return { success: true };

    } catch (error) {
      console.error("❌ Login error:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Request config:", error.config);
      
      const msg = error.response?.data?.message || "Login failed";
      seterror(msg);
      toast.error(msg);
      throw error; 
    } finally {
      setloading(false);
    }
  };

  const Logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        setUser,
        Signup, 
        Login, 
        Logout, 
        loading, 
        error 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
