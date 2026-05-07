const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const db = require("./database");

const app = express();
const PORT = 3000;

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
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render("register", { error: "Username and password are required." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const statement = db.prepare(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)"
    );

    statement.run(username, passwordHash);

    res.redirect("/login");
  } catch (error) {
    res.render("register", { error: "That username is already taken." });
  }
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);

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
  res.render("home", { username: req.session.username });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/welcome");
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
