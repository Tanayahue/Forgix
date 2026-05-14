import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import websiteRouter from "./routes/website.routes.js"
import billingRouter from "./routes/billing.routes.js"
const app = express()
const port = process.env.PORT || 5000
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"

app.use(express.json({ limit: "12mb" }))
app.use(cookieParser())
app.use(cors({
    origin: clientUrl,
    credentials:true
}))


app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/website",websiteRouter)
app.use("/api/billing",billingRouter)

app.listen(port,()=>{
   console.log(`Server running on port ${port}`)
    connectDb()
}) 
