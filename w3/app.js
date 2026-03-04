const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');


// Load environment variables from .env file
// This must be called before any other imports that use environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const uri = process.env.MONGODB_URI || "";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB and keep connection alive
async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.get("/todo", async (req, res) => {
  try {
    const db = client.db("todo_app");
    const todos = await db.collection("todos").find({}).toArray();
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
}); 

app.get("/index", (req, res) => { res.sendFile(__dirname + "/public/pages/index.html"); }); 

app.get("/read-todo", (req, res) => { res.sendFile(__dirname + "/public/pages/read-todo.html"); });

app.use((req, res) => {
  res.redirect(301, '/index');
});

// Connect to MongoDB, then start the server
connectDB().then(() => {
  app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); });
}).catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});


