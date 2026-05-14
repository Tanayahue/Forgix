import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const minimumFreeCredits = 500;

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Normalize older free accounts so current sessions receive the new baseline.
    if (user.plan === "free" && user.credits < minimumFreeCredits) {
      user.credits = minimumFreeCredits;
      await user.save();
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default isAuth;
