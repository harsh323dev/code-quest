import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Edit, Plus, X, Coins, Send, Clock, Monitor, Smartphone } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface EditFormType {
  name: string;
  about: string;
  tags: string[];
}

const UserProfile = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [users, setusers] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  
  const [editForm, setEditForm] = useState<EditFormType>({
    name: "",
    about: "",
    tags: [],
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        const matcheduser = res.data.data.find((u: any) => u._id === id);
        setusers(matcheduser);
        
        if (matcheduser) {
          setEditForm({
            name: matcheduser.name || "",
            about: matcheduser.about || "",
            tags: matcheduser.tags || [],
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    if (id) {
      fetchuser();
    }
  }, [id]);

  const handleSaveProfile = async () => {
    try {
      const res = await axiosInstance.patch(`/user/update/${user?._id}`, { editForm });
      
      if (res.data) {
        setusers({ ...users, ...editForm });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, trimmedTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((tag: string) => tag !== tagToRemove),
    });
  };

  const handleTransferPoints = async () => {
    const amount = parseInt(transferAmount);
    
    if (!searchEmail.trim()) {
      toast.error("Please enter recipient's email");
      return;
    }
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (user?.points < 10) {
      toast.error("You need at least 10 points to transfer!");
      return;
    }

    if (amount > user?.points) {
      toast.error("Insufficient points!");
      return;
    }

    setTransferring(true);
    try {
      const res = await axiosInstance.post("/user/transfer-points", {
        amount,
        receiverEmail: searchEmail,
      });

      toast.success(res.data.message);
      setIsTransferOpen(false);
      setTransferAmount("");
      setSearchEmail("");
      
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Transfer failed");
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Mainlayout>
    );
  }
  
  if (!users) {
    return (
      <Mainlayout>
        <div className="text-center text-gray-500 mt-4">No user found.</div>
      </Mainlayout>
    );
  }

  const currentUserId = user?._id;
  const isOwnProfile = id === currentUserId;
  
  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto p-4">
        {/* User Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8">
          <Avatar className="w-24 h-24 lg:w-32 lg:h-32">
            <AvatarFallback className="text-2xl lg:text-3xl bg-orange-600 text-white">
              {users.name?.split(" ").map((n: any) => n[0]).join("") || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="w-full sm:w-auto">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  {users.name}
                </h1>
                
                {/* ✅ FIXED: Points Display - Larger & More Visible */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg px-4 py-2 shadow-sm">
                  <Coins className="w-6 h-6 text-yellow-600" />
                  <div>
                    <span className="text-2xl font-bold text-yellow-700">
                      {users.points || 0}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">Points</span>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                  {/* Edit Profile Button */}
                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2 border-gray-300 hover:bg-gray-100">
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
                      <DialogHeader>
                        <DialogTitle className="text-gray-900">Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                          <div>
                            <Label htmlFor="name" className="text-gray-900 font-medium">Display Name</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              placeholder="Your display name"
                              className="mt-1 border-gray-300 text-gray-900"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">About</h3>
                          <div>
                            <Label htmlFor="about" className="text-gray-900 font-medium">About Me</Label>
                            <Textarea
                              id="about"
                              value={editForm.about}
                              onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                              placeholder="Tell us about yourself..."
                              className="min-h-32 mt-1 border-gray-300 text-gray-900"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">Skills & Technologies</h3>
                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add a skill"
                              className="border-gray-300 text-gray-900"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddTag();
                                }
                              }}
                            />
                            <Button onClick={handleAddTag} type="button" className="bg-orange-600 text-white hover:bg-orange-700">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {editForm.tags.map((tag: string) => (
                              <Badge key={tag} className="bg-orange-100 text-orange-800 border border-orange-300 flex items-center gap-1">
                                {tag}
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)} 
                                  className="ml-1 hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                          <Button type="button" onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* ✅ FIXED: Transfer Points Dialog - Proper Colors */}
                  <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 bg-yellow-100 border-yellow-500 text-yellow-800 hover:bg-yellow-200"
                        disabled={!user || user.points < 10}
                      >
                        <Send className="w-4 h-4" />
                        Transfer Points
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-900">Transfer Points</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-5 py-4">
                        {/* Balance Card */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Coins className="w-6 h-6 text-yellow-600" />
                            <p className="text-sm font-medium text-gray-700">Your Balance</p>
                          </div>
                          <p className="text-3xl font-bold text-yellow-700">{user?.points || 0} points</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Minimum 10 points required to transfer
                          </p>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                          <Label htmlFor="recipientEmail" className="text-sm font-semibold text-gray-900">
                            Recipient Email
                          </Label>
                          <Input
                            id="recipientEmail"
                            type="email"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="border-gray-300 text-gray-900 bg-white placeholder:text-gray-500"
                          />
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-2">
                          <Label htmlFor="amount" className="text-sm font-semibold text-gray-900">
                            Amount to Transfer
                          </Label>
                          <Input
                            id="amount"
                            type="number"
                            min="1"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="Enter points"
                            className="border-gray-300 text-gray-900 bg-white placeholder:text-gray-500"
                          />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsTransferOpen(false)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-100"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={handleTransferPoints}
                            disabled={transferring}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
                          >
                            {transferring ? "Transferring..." : "Transfer"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Login History Button */}
                  <Button
                    variant="outline"
                    onClick={() => setShowLoginHistory(!showLoginHistory)}
                    className="flex items-center gap-2 border-gray-300 hover:bg-gray-100"
                  >
                    <Clock className="w-4 h-4" />
                    Login History
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Member since {new Date(users.joinedOn).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Login History Section */}
        {isOwnProfile && showLoginHistory && users.loginHistory && users.loginHistory.length > 0 && (
          <Card className="mb-6 border-gray-200">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-gray-900">Login History (Last 10)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {users.loginHistory.slice(-10).reverse().map((login: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      {login.deviceType === "Mobile" ? (
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Monitor className="w-5 h-5 text-gray-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {login.browser} on {login.os}
                        </p>
                        <p className="text-xs text-gray-600">
                          IP: {login.ip} • {login.deviceType}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(login.loginTime).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* About & Tags */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-gray-200">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-gray-900">About</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {users.about || "No information provided yet."}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="border-gray-200">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-gray-900">Top Tags</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                  {users.tags && users.tags.length > 0 ? (
                    users.tags.map((tag: string) => (
                      <Badge key={tag} className="bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No tags added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Mainlayout>
  );
};

export default UserProfile;
