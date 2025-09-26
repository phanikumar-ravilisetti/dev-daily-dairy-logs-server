const jwt = require("jsonwebtoken");

const authMiddleware = (request, response, next) => {
  const token = request.header("Authorization")?.split(" ")[1];

  if (!token) {
    return response.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded.id; 
    next();
  } catch (error) {
    response.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
