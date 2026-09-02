/**
 * OpenAPI / Swagger API Documentation specification object generator
 */
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Blockchain-Based Secure File Sharing System API",
    version: "1.0.0",
    description:
      "Enterprise REST API documentation for AES-256 file encryption, SHA-256 integrity verification, IPFS storage, Ethereum EVM smart contract registry, RBAC authentication, IDS security monitoring, and AI security recommendations.",
  },
  servers: [
    {
      url: "http://localhost:5000/api",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

module.exports = swaggerSpec;
