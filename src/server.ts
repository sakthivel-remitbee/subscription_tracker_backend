require('dotenv').config();
import express  from "express";
import sequelize from "./config/db";
import logger from "./config/logger";
import router from "./routes/auth.route";
import userRouter from "./routes/user.route";
import cors from 'cors';
import subscriptionRoutes from "./routes/subscription.route";
import heart from "./controllers/heart.controller";


const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth',router);
app.use('/user',userRouter);
app.get('/message',heart);
app.use("/subscription", subscriptionRoutes);


sequelize.authenticate()
.then(()=>{ logger.info(`Db conncected`);})
.catch((err)=>{logger.error(err.message())})


app.listen(process.env.PORT, () => {
  logger.info(`Server running on port ${process.env.PORT} `);
});