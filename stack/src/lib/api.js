import axiosInstance from "./axiosinstance";

// --- USER / FRIENDSHIPS ---
export const getAllUsers = async () => {
  return await axiosInstance.get("/user/getalluser");
};

export const addFriend = async (friendId) => {
  return await axiosInstance.patch(`/user/friend/${friendId}`);
};

// --- AUTH & SECURITY ---
export const forgotPassword = async (identifier) => {
  // identifier can be email OR phone
  return await axiosInstance.post("/user/forgot-password", { identifier });
};

export const verifyLoginOtp = async (data) => {
  // data = { email, otp }
  return await axiosInstance.post("/user/login/verify", data);
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

// --- SUBSCRIPTIONS ---
export const buySubscription = async (planType) => {
  return await axiosInstance.post("/payment/subscribe", { planType });
};

// --- REWARDS ---
export const transferPoints = async (data) => {
  return await axiosInstance.post("/user/transfer-points", data);
};