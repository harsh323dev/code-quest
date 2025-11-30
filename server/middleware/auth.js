import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    // 1. Check if the Authorization header exists
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // If no header, stop here. Don't try to split undefined!
      return res.status(401).json({ message: "Authentication required" });
    }

    // 2. Extract the token (Bearer <token>)
    const token = authHeader.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    // 3. Verify the token
    let decodeData = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodeData?.id; 

    next();
  } catch (error) {
    console.log(error);
    // 4. Handle expired or invalid tokens gracefully
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};

export default auth;