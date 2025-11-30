// src/lib/api.js
import axiosInstance from "./axiosinstance";

// --- USER / FRIENDSHIPS ---
export const getAllUsers = async () => {
  return await axiosInstance.get("/user/getalluser");
};

export const addFriend = async (friendId) => {
  return await axiosInstance.patch(`/user/friend/${friendId}`);
};

// --- POSTS / FEED ---
export const fetchFeed = async () => {
  return await axiosInstance.get("/posts/feed");
};

export const createPost = async (postData) => {
  return await axiosInstance.post("/posts/create", postData);
};

export const likePost = async (postId) => {
  return await axiosInstance.patch(`/posts/${postId}/like`);
};

export const sharePost = async (postId) => {
  return await axiosInstance.patch(`/posts/${postId}/share`);
};

export const commentOnPost = async (postId, content) => {
  return await axiosInstance.post(`/posts/${postId}/comment`, { content });
};

export const buySubscription = async (planType) => {
  // planType: "Free", "Bronze", "Silver", "Gold"
  return await axiosInstance.post("/payment/subscribe", { planType });
};

export const transferPoints = async (data) => {
  // data = { receiverEmail, amount }
  return await axiosInstance.post("/user/transfer-points", data);
};

export const forgotPassword = async (email) => {
  return await axiosInstance.post("/user/forgot-password", { email });
};