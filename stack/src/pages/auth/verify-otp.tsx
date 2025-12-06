import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext"; // ✅ ADD THIS
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosinstance";

const VerifyOTP = () => {
  const router = useRouter();
  const { email } = router.query;
  const { setUser } = useAuth(); // ✅ GET setUser FROM CONTEXT
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Email is missing. Please login again.");
      router.push("/auth");
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 4) {
      toast.error("Please enter the 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/user/login/verify", { 
        email, 
        otp 
      });

      const { data, token } = res.data;
      const userWithToken = { ...data, token };
      
      // ✅ UPDATE BOTH localStorage AND Context
      localStorage.setItem("user", JSON.stringify(userWithToken));
      setUser(userWithToken); // ✅ THIS WAS MISSING!
      
      toast.success("OTP Verified! Login Successful");
      
      setTimeout(() => {
        router.push("/");
      }, 500);
      
    } catch (error: any) {
      console.error("OTP verification error:", error);
      const msg = error.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 lg:mb-8">
          <Link href="/" className="flex items-center justify-center mb-4">
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-orange-500 rounded mr-2 flex items-center justify-center">
              <div className="w-4 h-4 lg:w-6 lg:h-6 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-orange-500 rounded-sm"></div>
              </div>
            </div>
            <span className="text-lg lg:text-xl font-bold text-gray-800">
              stack<span className="font-normal">overflow</span>
            </span>
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-xl lg:text-2xl">
                Security Verification
              </CardTitle>
              <CardDescription>
                Chrome browser detected - Enter OTP sent to:<br />
                <span className="font-semibold text-gray-700">{email}</span>
              </CardDescription>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                <p className="text-sm text-blue-800 font-medium">
                  🔒 Check your backend console for the 4-digit OTP
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  (In production, this would be sent via email)
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-semibold">
                  4-Digit Security Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="0000"
                  maxLength={4}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  value={otp}
                  disabled={loading}
                  className="text-center text-3xl tracking-[1em] font-mono font-bold"
                  autoFocus
                  required
                />
                <p className="text-xs text-gray-500 text-center">
                  Enter the code displayed in your terminal
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm font-medium"
                disabled={loading || otp.length !== 4}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>

              <div className="text-center space-y-2 pt-2">
                <p className="text-xs text-gray-600">
                  💡 <strong>Pro Tip:</strong> Use Edge or Firefox to skip OTP
                </p>
              </div>

              <div className="text-center text-sm pt-3 border-t">
                <Link href="/auth" className="text-blue-600 hover:underline font-medium">
                  ← Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
