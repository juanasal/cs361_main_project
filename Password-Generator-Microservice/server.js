const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = 3003;
// const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?/";

function getRandomInt(max) {
  return crypto.randomInt(0, max);
}

function buildCharPool(options) {
  let pool = "";

  if (options.includeLowercase) pool += LOWER;
  if (options.includeUppercase) pool += UPPER;
  if (options.includeNumbers) pool += NUMBERS;
  if (options.includeSymbols) pool += SYMBOLS;

  return pool;
}

function generatePassword(length, pool) {
  let password = "";

  for (let i = 0; i < length; i++) {
    const idx = getRandomInt(pool.length);
    password += pool[idx];
  }

  return password;
}

app.post("/generate-password", (req, res) => {
  const {
    length = 12,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = false,
  } = req.body;

  if (typeof length !== "number" || length < 4 || length > 25) {
    return res.status(400).json({
      error: "Length must be a number between 4 and 25",
    });
  }

  const options = {
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
  };

  const pool = buildCharPool(options);

  if (!pool.length) {
    return res.status(400).json({
      error: "At least one character type must be enabled",
    });
  }

  const password = generatePassword(length, pool);

  res.json({
    password,
    length,
    options,
  });
});

// Health check route
app.get("/", (req, res) => {
  res.json({ status: "Password microservice is running" });
});

// ONLY START SERVER IF NOT IN TEST MODE
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Password microservice running on port ${PORT}`);
  });
}

// Export for Jest / Supertest
module.exports = app;
