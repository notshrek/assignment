import swaggerJsdoc from "swagger-jsdoc";

const options = {
  failOnErrors: true,
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Assignment",
      version: "1.0.0",
    },
  },
  apis: ["./routes.ts"],
};

// generate and export OpenAPI specification
export default swaggerJsdoc(options);
