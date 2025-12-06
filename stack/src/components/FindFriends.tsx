import React, { useEffect, useState } from "react";
import { getAllUsers, addFriend } from "../lib/api"; // Adjust path if needed
import { useAuth } from "../lib/AuthContext"; // Adjust path if needed
import { toast } from "react-toastify";

// Define User Interface
interface User {
  _id: string;
  name: string;
  email: string;
  friends?: string[];
}

const FindFriends = () => {
  const { user } = useAuth(); 
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      if (res.data?.data) {
        // Filter out yourself AND users who are already friends
        const otherUsers = res.data.data.filter((u: User) => 
            u._id !== user?._id && 
            !user?.friends?.includes(u._id)
        );
        setUsers(otherUsers);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    setLoading(true);
    try {
      await addFriend(friendId);
      toast.success("Friend added! You can now post more.");
      
      // Remove the added friend from the list immediately
      setUsers(prev => prev.filter(u => u._id !== friendId));
      
      // Optional: Reload page to update friend count limits in real-time
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to add friend";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-6">
      <h3 className="text-lg font-bold mb-2 text-gray-900">Find Friends</h3>
      <p className="text-xs text-gray-500 mb-4">
        (You need friends to unlock posting!)
      </p>
      
      {users.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No new users found.</p>
      ) : (
        <ul className="space-y-3">
          {users.map((u) => (
            <li key={u._id} className="flex justify-between items-center pb-2 border-b border-gray-50 last:border-0">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">{u.name}</span>
                <span className="text-xs text-gray-400">{u.email.split('@')[0]}...</span>
              </div>
              
              <button 
                disabled={loading}
                onClick={() => handleAddFriend(u._id)}
                className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-full font-semibold transition-colors"
              >
                {loading ? "..." : "Add +"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FindFriends;