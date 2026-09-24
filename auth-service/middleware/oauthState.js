const crypto = require("crypto");

const STATE_COOKIE = "oauth_state";

const stateCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  signed: true,
  path: "/",
  maxAge: 10 * 60 * 1000,
};

const generateOAuthState = (req, res, next) => {
  const state = crypto.randomBytes(32).toString("hex");

  res.cookie(STATE_COOKIE, state, stateCookieOptions);
  req.oauthState = state;

  next();
};

const validateOAuthState = (req, res, next) => {
  const receivedState = req.query.state;
  const expectedState = req.signedCookies?.[STATE_COOKIE];

  res.clearCookie(STATE_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  if (
    typeof receivedState !== "string" ||
    typeof expectedState !== "string"
  ) {
    return res.status(403).json({
      message: "Invalid OAuth state",
    });
  }

  const receivedBuffer = Buffer.from(receivedState);
  const expectedBuffer = Buffer.from(expectedState);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return res.status(403).json({
      message: "Invalid OAuth state",
    });
  }

  next();
};

module.exports = {
  generateOAuthState,
  validateOAuthState,
};