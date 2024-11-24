const { program } = require("commander");
const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

const multer = require("multer");
const upload = multer();

program
  .requiredOption("-h, --host <host>", "server host")
  .requiredOption("-p, --port <port>", "server port")
  .requiredOption("-c, --cache <path>", "cache directory path");

program.parse(process.argv);

const { host, port, cache } = program.opts();

app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Notes API",
      version: "1.0.0",
      description: "API for managing notes",
    },
  },
  apis: [__filename], // Link to the file with annotations
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Check if the server is running
 *     responses:
 *       200:
 *         description: Returns a confirmation message
 */
app.get("/", (req, res) => {
  res.send("Yepi");
});

/**
 * @swagger
 * /notes/{note}:
 *   get:
 *     summary: Retrieve a specific note
 *     parameters:
 *       - in: path
 *         name: note
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the note
 *     responses:
 *       200:
 *         description: Returns the note text
 *       404:
 *         description: Note not found
 */
app.get("/notes/:note", (req, res) => {
  const note = req.params.note;
  if (notes[note]) {
    res.send(notes[note]);
  } else {
    res.status(404).send("Not found");
  }
});

app.use(bodyParser.raw({ type: "text/plain" }));

/**
 * @swagger
 * /notes/{note}:
 *   put:
 *     summary: Update an existing note
 *     parameters:
 *       - in: path
 *         name: note
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the note
 *     requestBody:
 *       required: true
 *       content:
 *         text/plain:
 *           schema:
 *             type: string
 *             example: Updated note text
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       404:
 *         description: Note not found
 */
app.put("/notes/:note", (req, res) => {
  const note = req.params.note;
  const text = req.body.toString();
  if (notes[note]) {
    notes[note] = text;
    res.send("Note updated");
  } else {
    res.status(404).send("Not found");
  }
});

/**
 * @swagger
 * /notes/{note}:
 *   delete:
 *     summary: Delete a note
 *     parameters:
 *       - in: path
 *         name: note
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the note
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       404:
 *         description: Note not found
 */
app.delete("/notes/:note", (req, res) => {
  const note = req.params.note;
  if (notes[note]) {
    delete notes[note];
    res.send("Note deleted");
  } else {
    res.status(404).send("Not found");
  }
});

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Retrieve a list of all notes
 *     responses:
 *       200:
 *         description: Returns a list of notes
 */
app.get("/notes", (req, res) => {
  const notesList = Object.keys(notes).map((note) => ({
    name: note,
    text: notes[note],
  }));
  res.json(notesList);
});

/**
 * @swagger
 * /write:
 *   post:
 *     summary: Create a new note
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               note_name:
 *                 type: string
 *               note:
 *                 type: string
 *             required:
 *               - note_name
 *               - note
 *     responses:
 *       201:
 *         description: Note created successfully
 *       400:
 *         description: Note already exists
 */
app.post("/write", upload.none(), (req, res) => {
  const note = req.body.note_name;
  const text = req.body.note;
  if (notes[note]) {
    res.status(400).send("Note already exists");
  } else {
    notes[note] = text;
    res.status(201).send("Note created");
  }
});

const server = http.createServer(app);

server.listen(3030, "0.0.0.0", () => {
  console.log(`Server running: http://${host}:${port}`);
});
