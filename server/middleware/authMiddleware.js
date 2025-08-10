const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Token aus Header holen
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Kein Token vorhanden" });
    }

    // Token verifizieren
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Authentifizierung fehlgeschlagen" });
  }
};
