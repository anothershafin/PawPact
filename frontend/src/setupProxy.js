const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * Proxies browser requests from the CRA dev server (port 3000) to the API.
 * Must match backend PORT (see terminal: "PawPact API listening on ...").
 *
 * macOS: AirPlay Receiver often uses port 5000. If the API runs on 5001, set:
 * REACT_APP_PROXY_TARGET=http://localhost:5001
 */
module.exports = function (app) {
  const target =
    process.env.REACT_APP_PROXY_TARGET || "http://localhost:5000";

  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
