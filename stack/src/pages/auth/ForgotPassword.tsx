import React, { useState } from "react";
import { forgotPassword } from "../../lib/api"; // Ensure this matches your API path
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      // Determine message based on response format
      const msg = res.data?.message || "Check your email/console for the password";
      toast.success(msg);
      
      // If we got a temp password in the response (Dev mode), log it clearly
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
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your email. We will generate a temporary password for you.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>
        </form>
        <div className="mt-4 text-center">
             <Link href="/auth" className="text-blue-500 text-sm hover:underline">
                Back to Login
             </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;