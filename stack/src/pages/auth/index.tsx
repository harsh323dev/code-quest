import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";

const LoginPage = () => {
  const router = useRouter();
  const { Login } = useAuth(); // AuthContext handles the login logic & success toast
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      await Login(form); 
      // ❌ REMOVED: toast.success("Login successful!"); 
      // Rationale: AuthContext already shows this toast. Removing it here prevents the double popup.
      
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      // Optional: AuthContext might handle errors too, but keeping this is safe
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
                Log in to your account
              </CardTitle>
              <CardDescription>
                Enter your email and password to access Stack Overflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  onChange={handleChange}
                  value={form.email}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  onChange={handleChange}
                  value={form.password}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                disabled={loading}
              >
                {loading ? "Loading..." : "Log in"}
              </Button>
              
              <div className="text-center text-sm">
                <button 
                  type="button" 
                  onClick={() => router.push("/auth/ForgotPassword")}
                  className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
                  disabled={loading}
                >
                  Forgot your password?
                </button>
              </div>

              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;