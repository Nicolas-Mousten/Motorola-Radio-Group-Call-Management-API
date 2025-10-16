import express from 'express';
import cors from 'cors';
import floorRouter from './routes/floor.js';


const app = express();
app.use(cors());
app.use(express.json());

app.use("/groups", floorRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));