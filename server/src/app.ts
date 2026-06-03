import cors from "cors";
import express from "express";
import { default as helmet } from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { createSwapRouter } from "./modules/swap/swap.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const durationMs = Date.now() - start;
      const payload = {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
      };

      if (res.statusCode >= 500) {
        logger.error(payload, "HTTP request completed");
        return;
      }

      if (res.statusCode >= 400) {
        logger.warn(payload, "HTTP request completed");
        return;
      }

      logger.info(payload, "HTTP request completed");
    });

    next();
  });

  app.use(helmet());
  app.use(cors({ origin: env.WEB_ORIGIN, methods: ["GET", "POST"] }));
  app.use(express.json({ limit: "100kb" }));

  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests, please retry shortly",
        },
      },
    }),
  );

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/swap", createSwapRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
