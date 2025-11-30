// src/components/FindFriends.tsx
import React, { useEffect, useState } from "react";
import { getAllUsers, addFriend } from "../lib/api";
import { useAuth } from "../lib/AuthContext"; // Adjusted path based on screenshot
import { toast } from "react-toastify";

// Define the shape of a User for TypeScript
interface User {
  _id: string;
  name: string;
  email: string;
}

const FindFriends = () => {
  const { user } = useAuth(); 
  const [users, setUsers] = useState<User[]>([]); // Typed state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      // Ensure we have data and filter out the current user
      if (res.data?.data) {
        const otherUsers = res.data.data.filter((u: User) => u._id !== user?._id);
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
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to add friend";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="friend-sidebar" style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Find Friends</h3>
      <p style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
        (You need friends to unlock posting!)
      </p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {users.map((u) => (
          <li key={u._id} style={{ marginBottom: "10px", display:"flex", justifyContent:"space-between", alignItems: "center" }}>
            <span>{u.name}</span>
            <button 
              disabled={loading}
              onClick={() => handleAddFriend(u._id)}
              style={{ fontSize: "12px", padding: "4px 8px", cursor: "pointer" }}
            >
              Add +
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FindFriends;