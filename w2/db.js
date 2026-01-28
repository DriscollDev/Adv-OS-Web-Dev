const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config();

run().catch(console.dir);
