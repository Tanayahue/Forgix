import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { generatedemo, getCurrentUser } from "../controllers/user.controllers.js";

const userRouter = express.Router();

userRouter.get("/gen", generatedemo);
userRouter.get("/me", isAuth, getCurrentUser);

export default userRouter;
