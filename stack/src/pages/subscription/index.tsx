import React, { useState } from "react";
import { buySubscription } from "../../lib/api"; // Ensure this is exported in api.js
import { useAuth } from "../../lib/AuthContext";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar"; 
import Navbar from "C://Users//admin//Desktop//Work//My Projects//stackoverflow-clone-main//stack//src//components//Navbar";     


const SubscriptionPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSubscribe = async (plan: string) => {
    if (!user) {
      toast.error("Please login to subscribe");
      return;
    }

    setLoading(true);
    try {
      const res = await buySubscription(plan);
      toast.success(res.data.message);
      // Optional: Force reload user data here to update UI immediately
    } catch (error: any) {
      const msg = error.response?.data?.message || "Payment Failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    { name: "Free", price: "₹0", limit: "1 question/day", color: "bg-gray-100" },
    { name: "Bronze", price: "₹100/mo", limit: "5 questions/day", color: "bg-orange-100" },
    { name: "Silver", price: "₹300/mo", limit: "10 questions/day", color: "bg-gray-200" },
    { name: "Gold", price: "₹1000/mo", limit: "Unlimited questions", color: "bg-yellow-100" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar handleslidein={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex pt-[53px]">
        <Sidebar isopen={isSidebarOpen} />
        
        <main className="flex-1 md:ml-48 lg:ml-64 p-6">
          <h1 className="text-3xl font-bold text-center mb-2">Subscription Plans</h1>
          <p className="text-center text-gray-600 mb-8">
            Upgrade your account to ask more questions! <br/>
            <span className="text-xs text-red-500">(Payment Gateway Open: 10 AM - 11 AM IST Only)</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`border rounded-lg p-6 flex flex-col items-center ${plan.color} shadow-sm hover:shadow-md transition`}>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-gray-800 mb-4">{plan.price}</div>
                <p className="text-gray-600 mb-6">{plan.limit}</p>
                
                {user?.subscriptionPlan === plan.name ? (
                   <button disabled className="bg-gray-400 text-white px-6 py-2 rounded-full cursor-not-allowed">
                     Current Plan
                   </button>
                ) : (
                  <button 
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={loading || plan.name === "Free"}
                    className={`px-6 py-2 rounded-full font-medium transition ${
                      plan.name === "Free" 
                        ? "bg-gray-300 text-gray-600" 
                        : "bg-[#ef8236] text-white hover:bg-orange-600"
                    }`}
                  >
                    {loading ? "Processing..." : plan.name === "Free" ? "Default" : "Upgrade"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SubscriptionPage;