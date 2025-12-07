import React, { useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import { transferPoints } from "../../lib/api";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar"; 
import Navbar from "../../components/Navbar";
     


const PointsWallet = () => {
  const { user } = useAuth();
  const [receiverEmail, setReceiverEmail] = useState("");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await transferPoints({ receiverEmail, amount });
      toast.success(res.data.message);
      // Optional: Refresh user data to show new balance
      window.location.reload(); 
    } catch (error: any) {
      const msg = error.response?.data?.message || "Transfer failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar handleslidein={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex pt-[53px]">
        <Sidebar isopen={isSidebarOpen} />
        
        <main className="flex-1 md:ml-48 lg:ml-64 p-6">
          <h1 className="text-3xl font-bold mb-6">My Rewards</h1>

          {/* BALANCE CARD */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 rounded-lg shadow-lg mb-8 max-w-md">
            <h2 className="text-lg font-semibold opacity-90">Current Balance</h2>
            <div className="text-5xl font-bold mt-2">{user?.points || 0} <span className="text-2xl">pts</span></div>
            <p className="mt-4 text-sm bg-white/20 inline-block px-3 py-1 rounded">
              {user?.points > 100 ? "🏆 Gold Badge" : user?.points > 50 ? "🥈 Silver Badge" : "🥉 Bronze Badge"}
            </p>
          </div>

          {/* TRANSFER FORM */}
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
            <h3 className="text-xl font-bold mb-4">Transfer Points</h3>
            <p className="text-sm text-gray-500 mb-4">
              Send points to your friends. You must have at least 10 points to unlock this feature.
            </p>

            <form onSubmit={handleTransfer}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Email</label>
                <input
                  type="email"
                  required
                  placeholder="friend@example.com"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ef8236] text-white py-2 rounded hover:bg-orange-600 transition disabled:bg-gray-400 font-medium"
              >
                {loading ? "Transferring..." : "Send Points"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PointsWallet;