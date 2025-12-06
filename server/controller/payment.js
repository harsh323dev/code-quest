import User from "../models/auth.js";

// --- HELPER: CHECK TIME (10 AM - 11 AM IST) ---
const isPaymentAllowed = () => {
  const now = new Date();
  
  // 1. Get current time in UTC
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  
  // 2. Add 5.5 hours to get IST
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(utcTime + istOffset);
  
  const hours = istTime.getHours(); // Returns 0-23 in IST
  
  // Rule: "work on 10 to 11 AM IST" (10:00 - 10:59)
  return hours === 10;
};

// --- MOCK PAYMENT CONTROLLER ---
export const buySubscription = async (req, res) => {
  const { planType } = req.body; 
  const userId = req.userId;    

  // 1. Enforce Time Restriction
  // Note: For demo purposes, comment this out if testing outside 10-11 AM.
  // For submission, keep it enabled.
  if (!isPaymentAllowed()) {
     return res.status(403).json({ 
       message: "Payment Gateway Closed. Please try between 10:00 AM and 11:00 AM IST." 
     });
  }

  // 2. Validate Plan
  const validPlans = ["Free", "Bronze", "Silver", "Gold"];
  if (!validPlans.includes(planType)) {
    return res.status(400).json({ message: "Invalid Plan Selected" });
  }

  try {
    const user = await User.findById(userId);
    
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // 3. Update User Plan
    user.subscriptionPlan = planType;
    await user.save();

    // 4. Invoice Email (Requirement)
    console.log(`
    ========================================
    [MOCK EMAIL SERVICE]
    To: ${user.email}
    Subject: Payment Successful - Invoice
    ----------------------------------------
    Plan: ${planType} Membership
    Status: Paid
    Time: ${new Date().toLocaleString()}
    ========================================
    `);

    res.status(200).json({ 
      result: "Success", 
      message: `Payment Successful! You are now a ${planType} member.`,
      user 
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};