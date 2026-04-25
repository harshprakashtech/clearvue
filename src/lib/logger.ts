import path from "path";
import winston from "winston";
import { logContext } from "@/lib/asyncLocalStorage";

/**
 * --- Logger Configuration ---
 *
 * This logger is configured to log with IST timestamp and custom format for logging.
 */

// Custom format for IST timestamp
const istTimestamp = () => {
  const now = new Date();
  const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const year = istTime.getUTCFullYear();
  const month = String(istTime.getUTCMonth() + 1).padStart(2, "0");
  const date = String(istTime.getUTCDate()).padStart(2, "0");
  const hours = String(istTime.getUTCHours()).padStart(2, "0");
  const minutes = String(istTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(istTime.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
};

// Custom format function
const customFormat = winston.format.printf(
  ({
    level,
    message,
    timestamp,
    userId,
    ip,
    stack,
    ...meta
  }: Record<string, any>) => {
    const context = logContext.getStore();
    const user = userId || context?.userId || "ANONYMOUS";
    const ipAddr = ip || context?.ip || "UNKNOWN";
    const metaStr = Object.keys(meta).length
      ? ` | ${JSON.stringify(meta)}`
      : "";
    const stackStr = stack ? `\nStack: ${stack}` : "";

    return `[${timestamp}] [${level.toUpperCase()}] [User: ${user}] [IP: ${ipAddr}] ${message}${metaStr}${stackStr}`;
  },
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: istTimestamp }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat,
  ),
  defaultMeta: {},
  transports: [
    // Console transport (all levels)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: istTimestamp }),
        winston.format.errors({ stack: true }),
        customFormat,
        winston.format.colorize({ all: true }),
      ),
    }),

    // Info logs (only 'info' level)
    new winston.transports.File({
      filename: path.join(logsDir, "info.log"),
      level: "info",
      maxsize: 20971520, // 20MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format((info) => (info.level === "info" ? info : false))(),
        winston.format.timestamp({ format: istTimestamp }),
        winston.format.errors({ stack: true }),
        customFormat,
      ),
    }),

    // Warnings (only 'warn' level)
    new winston.transports.File({
      filename: path.join(logsDir, "warn.log"),
      level: "warn",
      maxsize: 20971520,
      maxFiles: 5,
      format: winston.format.combine(
        winston.format((info) => (info.level === "warn" ? info : false))(),
        winston.format.timestamp({ format: istTimestamp }),
        winston.format.errors({ stack: true }),
        customFormat,
      ),
    }),

    // Errors (error level and above, which is just error)
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 20971520,
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp({ format: istTimestamp }),
        winston.format.errors({ stack: true }),
        customFormat,
      ),
    }),

    // Exceptions (for caught/uncaught exceptions)
    new winston.transports.File({
      filename: path.join(logsDir, "exception.log"),
      level: "error",
      maxsize: 20971520,
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp({ format: istTimestamp }),
        winston.format.errors({ stack: true }),
        customFormat,
      ),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exception.log"),
      maxsize: 20971520,
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp({ format: istTimestamp }),
        winston.format.errors({ stack: true }),
        customFormat,
      ),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejection.log"),
      maxsize: 20971520,
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp({ format: istTimestamp }),
        winston.format.errors({ stack: true }),
        customFormat,
      ),
    }),
  ],
});

// Handle process-level errors in production
if (process.env.NODE_ENV === "production") {
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", {
      stack: error.stack,
      message: error.message,
    });
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection", {
      reason: String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });
}
