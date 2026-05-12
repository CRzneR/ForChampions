const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Zugriff verweigert. Token erforderlich." });
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "cham_app_secret"
    );
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Ungültiges Token." });
  }
}

module.exports = authenticateToken;
