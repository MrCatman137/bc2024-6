const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Notes API",
    description: "API for managing notes",
  },
  host: "localhost:3030",
  schemes: ["http"],
};

const outputFile = "./swagger_output.json";
const endpointFiles = ["./main.js"];

swaggerAutogen(outputFile, endpointFiles, doc).then(() => {
  console.log("Swagger documentation generated!");
});
