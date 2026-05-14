import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createOrder, verifyPayment } from "../controllers/billing.controllers.js";

const billingRouter = express.Router();

billingRouter.post("/", isAuth, createOrder);
billingRouter.post("/verify", isAuth, verifyPayment);

export default billingRouter;
