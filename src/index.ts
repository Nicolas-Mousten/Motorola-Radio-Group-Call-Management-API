import express from 'express';
import cors from 'cors';
import floorRouter from './routes/floor.js';


const app = express();
app.use(cors());
app.use(express.json());

app.use("/groups", floorRouter);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});