const SecurityLog = require("../models/SecurityLog");

/**
 * Intrusion Detection System Middleware
 * Detects common malicious patterns like SQLi, XSS, Path Traversal, and suspicious parameters.
 */
const idsMiddleware = async (req, res, next) => {
  try {
    const rawUrl = req.originalUrl || "";
    const bodyStr = JSON.stringify(req.body || {});
    const combinedInput = `${rawUrl} ${bodyStr}`;

    const sqliPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b|' OR '1'='1|--)/i;
    const xssPatterns = /(<script\b[^>]*>|javascript:|onerror\s*=|onload\s*=)/i;
    const pathTraversalPatterns = /(\.\.\/|\.\.\\)/;

    let threatDetected = false;
    let threatType = "";

    if (sqliPatterns.test(combinedInput)) {
      threatDetected = true;
      threatType = "SQL_INJECTION_ATTEMPT";
    } else if (xssPatterns.test(combinedInput)) {
      threatDetected = true;
      threatType = "XSS_ATTEMPT";
    } else if (pathTraversalPatterns.test(combinedInput)) {
      threatDetected = true;
      threatType = "PATH_TRAVERSAL_ATTEMPT";
    }

    if (threatDetected) {
      console.warn(`[IDS ALERT] Suspicious activity detected: ${threatType} from IP ${req.ip}`);
      await SecurityLog.create({
        eventType: threatType,
        severity: "HIGH",
        sourceIp: req.ip || "127.0.0.1",
        targetUser: req.user?.email || "Anonymous",
        description: `Potential attack pattern detected in request to ${req.originalUrl}`,
        payload: { query: req.query, body: req.body },
      });
    }
  } catch (err) {
    // Non-blocking logger
    console.error("[IDS LOGGING ERROR]", err.message);
  }

  next();
};

module.exports = idsMiddleware;
