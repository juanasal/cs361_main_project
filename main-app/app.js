const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const db = require("./database");

const app = express();
const PORT = 3000;
const VALID_LANGUAGES = ["English", "Español", "Français"];

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "change-this-secret",
    resave: false,
    saveUninitialized: false
  })
);

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  next();
}

app.get("/", (req, res) => {
  res.redirect("/welcome");
});

app.get("/welcome", (req, res) => {
  res.render("welcome");
});

app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

app.post("/register", async (req, res) => {
  const username = req.body.username?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;
  const language = req.body.language;

  if (!username || !email || !password || !language) {
    return res.render("register", { error: "All fields are required." });
  }

  if (!VALID_LANGUAGES.includes(language)) {
    return res.render("register", { error: "Please choose a valid language." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const userId = db.createUser(username, email, passwordHash, language);

    req.session.userId = userId;
    req.session.username = username;

    res.redirect("/home");
  } catch (error) {
    res.render("register", { error: "That username or email is already taken." });
  }
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
  const identifier = req.body.identifier?.trim();
  const password = req.body.password;

  if (!identifier || !password) {
    return res.render("login", { error: "Username or email and password are required." });
  }

  const user = db.findUserByUsernameOrEmail(identifier);

  if (!user) {
    return res.render("login", { error: "Invalid username or password." });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return res.render("login", { error: "Invalid username or password." });
  }

  req.session.userId = user.id;
  req.session.username = user.username;

  res.redirect("/home");
});

app.get("/home", requireLogin, (req, res) => {
  res.render("home", {
    username: req.session.username,
    stats: db.getUserDashboardStats(req.session.userId)
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/welcome");
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
