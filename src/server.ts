require('dotenv').config();
import express  from "express";
import sequelize from "./config/db";
import logger from "./config/logger";
import router from "./routes/auth.route";
import cors from 'cors';

const app = express();
app.use(express.json())
app.use('/auth',router);
app.use(cors())

sequelize.authenticate()
.then(()=>{ logger.info(`Db conncected`);})
.catch((err)=>{logger.error(err.message())})

app.listen(process.env.PORT, () => {
  logger.info(`Server running on port ${process.env.PORT} `);
});