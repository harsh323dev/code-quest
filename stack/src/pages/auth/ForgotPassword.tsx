import React, { useState } from "react";
import { forgotPassword } from "../../lib/api"; 
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";

const ForgotPassword = () => {
  // ✅ Changed state variable to 'identifier' to represent Email OR Phone
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API call now sends 'identifier' which matches the backend logic
      const res = await forgotPassword(identifier);
      
      const msg = res.data?.message || "Check your email/phone";
      toast.success(msg);
      
      if (res.data?.tempPassword) {
        console.log("TEMP PASSWORD:", res.data.tempPassword);
        alert(`DEV MODE: Your new password is: ${res.data.tempPassword}`);
      }
      
      setTimeout(() => router.push('/auth'), 5000);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to reset";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md border border-gray-200">
        
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Reset Password</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your Email or Phone Number. We will generate a temporary password for you.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email or Phone Number
            </label>
            <input
              type="text" // ✅ Changed to text to allow phone numbers
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. user@email.com OR 9876543210"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400 font-medium"
          >
            {loading ? "Processing..." : "Generate Password"}
          </button>
        </form>
        
        <div className="mt-4 text-center">
             <Link href="/auth" className="text-blue-600 text-sm hover:underline font-medium">
                Back to Login
             </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;