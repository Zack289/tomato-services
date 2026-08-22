import express from "express";
import dotenv from "dotenv";

const app = express();

dotenv.config();

const PORT = Number(process.env.PORT) || 5006;

app.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`);
  //   connectDB();
});
