import express, { Request, Response } from "express";

const { PORT, HOST } = process.env;

const server = express()

const app = express();
app.use(express.json());

app.get('/ping', (req, res) => {
    res.end(`container name: ${HOST}, the port: ${PORT}`);
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
})