const { auth } = require("express-oauth2-jwt-bearer");

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUTH0_AUDIENCE; // <--- Potential issue here

if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) {
  console.log("AUTH0_DOMAIN from env:", AUTH0_DOMAIN); // See what these print
  console.log(
    "AUTH0_AUDIENCE from env (using AUTH0_CLIENT_ID):",
    AUTH0_AUDIENCE
  ); // See what these print
  throw "Make sure to set AUTH0_DOMAIN and AUTH0_AUDIENCE in authMiddleware.js. Check .env setup and variable names.";
}

const checkJwt = auth({
  audience: AUTH0_AUDIENCE,
  issuerBaseURL: `https://${AUTH0_DOMAIN}/`, // Note the https:// and trailing /
  tokenSigningAlg: "RS256",
});

module.exports = checkJwt;
