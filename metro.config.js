/* eslint-disable @typescript-eslint/no-require-imports */
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const connect = require("connect");
const http = require("http");
const https = require("https");
const { URL } = require("url");

require("dotenv").config();

/** Must match `src/config/runtime.ts` (`DEV_WEB_API_PROXY_PREFIX`). */
const API_PROXY_PREFIX = "/__vajra_api";

const proxyTargetBase = (
  process.env.EXPO_DEV_API_PROXY_TARGET ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  ""
)
  .trim()
  .replace(/\/+$/, "");

const config = getDefaultConfig(__dirname);
const merged = withNativeWind(config, { input: "./global.css" });

if (proxyTargetBase && /^https?:\/\//i.test(proxyTargetBase)) {
  const existingEnhance = merged.server?.enhanceMiddleware;

  merged.server = {
    ...merged.server,
    enhanceMiddleware: (middleware, server) => {
      const metroStack = existingEnhance
        ? existingEnhance(middleware, server)
        : middleware;

      return connect()
        .use((req, res, next) => {
          const url = req.url ?? "";
          if (!url.startsWith(API_PROXY_PREFIX)) {
            return next();
          }

          const rest = url.slice(API_PROXY_PREFIX.length);
          const pathWithQuery =
            (rest.startsWith("/") ? rest : `/${rest}`) || "/";

          let targetUrl;
          try {
            targetUrl = new URL(pathWithQuery, `${proxyTargetBase}/`);
          } catch {
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.end("Invalid API proxy path");
            return;
          }

          const isHttps = targetUrl.protocol === "https:";
          const lib = isHttps ? https : http;
          const defaultPort = isHttps ? 443 : 80;
          const port = Number(targetUrl.port) || defaultPort;

          const opts = {
            hostname: targetUrl.hostname,
            port,
            path: targetUrl.pathname + targetUrl.search,
            method: req.method,
            headers: {
              ...req.headers,
              host: targetUrl.host,
            },
          };

          const proxyReq = lib.request(opts, (proxyRes) => {
            res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
            proxyRes.pipe(res);
          });

          proxyReq.on("error", (err) => {
            if (!res.headersSent) {
              res.statusCode = 502;
              res.setHeader("Content-Type", "text/plain; charset=utf-8");
              res.end(
                `API proxy cannot reach ${proxyTargetBase}: ${err.message}`,
              );
            }
          });

          req.pipe(proxyReq);
        })
        .use(metroStack);
    },
  };
}

module.exports = merged;
