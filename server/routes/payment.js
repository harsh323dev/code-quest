import express from "express";
import { buySubscription } from "../controller/payment.js"; 
// Note: Depending on which version of the payment controller you used (Mock or Real), 
// ensure the function name matches. If you used the Mock version, it is 'buySubscription'.
import auth from "../middleware/auth.js";

const router = express.Router();

// The frontend will call this when user clicks "Pay"
router.post("/subscribe", auth, buySubscription);

export default router;