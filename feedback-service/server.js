const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Feedback microservice is running.");
});

// Submit feedback route
app.post("/submit-feedback", (req, res) => {
  const { userId, feedbackMessage } = req.body;

  if (!feedbackMessage || feedbackMessage.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "Feedback message is required."
    });
  }

  const feedbackEntry = {
    userId: userId || "anonymous",
    feedbackMessage: feedbackMessage,
    submittedAt: new Date().toISOString()
  };

  const feedbackText =
    `User: ${feedbackEntry.userId}\n` +
    `Feedback: ${feedbackEntry.feedbackMessage}\n` +
    `Submitted At: ${feedbackEntry.submittedAt}\n` +
    `-----------------------------\n`;

  fs.appendFile("feedback.txt", feedbackText, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Feedback could not be saved."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Thanks for your feedback, this will help us improve this site!",
      feedback: feedbackEntry
    });
  });
});

app.listen(PORT, () => {
  console.log(`Feedback microservice running on http://localhost:${PORT}`);
});
