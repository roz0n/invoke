const jwt = require("jsonwebtoken");
const config = require("../../config");

function jwtMiddleware(req, res, next) {
  const token = req.method === "POST" ? req.body.token : req.query.token;

  verifyJwt(token)
    .then(decodedToken => {
      req.user = decodedToken.data;
      next();
    })
    .catch(error => {
      res
        .status(400)
        .send({ message: "Invalid authentication token provided" });
    });
}

function verifyJwt(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwtSecret, (error, decodedToken) => {
      if (error || !decodedToken) return reject(error);

      resolve(decodedToken);
    });
  });
}

module.exports = {
  jwtMiddleware,
  verifyJwt
};