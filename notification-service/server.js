const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Simple in-memory storage.
// This resets whenever the server restarts.
let notifications = [];
let nextNotificationId = 1;

// Helper function to choose a message based on actionType
function getNotificationMessage(actionType, buttonName) {
  if (actionType === "delete_item") {
    return "Are you sure you want to delete this item?";
  }

  if (actionType === "submit_form") {
    return "Are you sure you want to submit this form?";
  }

  if (actionType === "save_progress") {
    return "Do you want to save your progress?";
  }

  if (actionType === "start_quiz") {
    return "Are you sure you want to start the quiz?";
  }

  // Default fallback message
  return `Are you sure you want to continue with: ${buttonName}?`;
}

// Route 1: Create a notification
app.post("/create-notification", (req, res) => {
  const { userId, actionType, buttonName } = req.body;

  // Basic validation
  if (!userId || !actionType || !buttonName) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: userId, actionType, and buttonName are required."
    });
  }

  const notification = {
    notificationId: nextNotificationId,
    userId: userId,
    actionType: actionType,
    buttonName: buttonName,
    message: getNotificationMessage(actionType, buttonName),
    requiresConfirmation: true,
    confirmText: "Confirm",
    cancelText: "Cancel",
    status: "pending"
  };

  notifications.push(notification);
  nextNotificationId++;

  return res.status(200).json({
    success: true,
    notificationId: notification.notificationId,
    userId: notification.userId,
    actionType: notification.actionType,
    buttonName: notification.buttonName,
    message: notification.message,
    requiresConfirmation: notification.requiresConfirmation,
    confirmText: notification.confirmText,
    cancelText: notification.cancelText,
    status: notification.status
  });
});

// Route 2: Confirm or cancel a notification
app.post("/confirm-notification", (req, res) => {
  const { notificationId, confirmed } = req.body;

  // Basic validation
  if (!notificationId || typeof confirmed !== "boolean") {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: notificationId and confirmed are required."
    });
  }

  const notification = notifications.find(
    item => item.notificationId === Number(notificationId)
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      error: "Notification not found."
    });
  }

  if (confirmed === true) {
    notification.status = "confirmed";
  } else {
    notification.status = "canceled";
  }

  return res.status(200).json({
    success: true,
    notificationId: notification.notificationId,
    confirmed: confirmed,
    status: notification.status,
    message: confirmed
      ? "The action was confirmed."
      : "The action was canceled."
  });
});

// Optional route to test that the service is running
app.get("/", (req, res) => {
  res.send("Notification microservice is running.");
});

app.listen(PORT, () => {
  console.log(`Notification microservice running on http://localhost:${PORT}`);
});
