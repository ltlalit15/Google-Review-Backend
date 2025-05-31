import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from "body-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import session from "express-session";

// Import your route file
import routes from "./app.js";

// Load environment variables
dotenv.config();

// Required to use __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Safe temp dir path for file uploads (cross-platform)
// const tempDir = path.join(__dirname, "tmp");

// ✅ Create Express app
const app = express();
const PORT = 5000

// ✅ CORS setup
app.use(cors({
  origin: "*", // Or restrict to specific domain
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Parse JSON and large payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ File upload middleware with safe temp folder
app.use(fileUpload({
  useTempFiles: true,
  // tempFileDir: tempDir
}));

// ✅ Static file directories
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'upload')));

// ✅ Session middleware
app.use(session({
  secret: 'your_secret_key', // 🔒 Replace with strong secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 86400000 } // 1 day
}));

// ✅ Logging and body parser
app.use(bodyParser.json());
app.use(morgan("dev"));

// ✅ Your routes
app.use("/", routes);

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
