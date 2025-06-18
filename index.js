import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import morgan from "morgan";
import session from "express-session";

// Optional - Only if you are still using express-fileupload (not multer)
import fileUpload from "express-fileupload";

// Optional - Only if you're still using bodyParser (not needed with Express 4.16+)
import bodyParser from "body-parser";

// Import your route file
import routes from "./app.js";

// Load environment variables
dotenv.config();

// Setup __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS
app.use(cors({ origin: "*" }));

// ✅ Body parsers (JSON and URL-encoded) - must be before routes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Optional: Express file upload middleware (only if not using multer)
app.use(fileUpload({ useTempFiles: true }));

// ✅ Optional: body-parser (can be skipped)
app.use(bodyParser.json()); // <-- Only needed if you’re not using express.json()

// ✅ Logging
app.use(morgan("dev"));

// ✅ Session management
app.use(
  session({
    secret: "your_secret_key", // 🔒 Replace with real secret
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 86400000 }, // 1 day
  })
);

// ✅ Static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "upload")));

// ✅ Home route
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Google Review Backend</title>
        <style>
          body {
            background: linear-gradient(to right, #4facfe, #00f2fe);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
          }
          h1 {
            font-size: 3rem;
            text-align: center;
            background-color: #ffffffaa;
            padding: 20px 40px;
            border-radius: 20px;
            color: #333;
            box-shadow: 0 15px 30px rgba(0,0,0,0.2);
          }
        </style>
      </head>
      <body>
        <h1>🚀 Google Review Backend is Working! 🎉</h1>
      </body>
    </html>
  `);
});

// ✅ Register routes (after all parsers)
app.use("/", routes);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
