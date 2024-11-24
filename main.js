const { program } = require("commander");
const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger_output.json"); // Підключення згенерованої документації

const app = express();

app.use(express.json());
app.use(bodyParser.raw({ type: "text/plain" }));

// Підключення Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const multer = require("multer");
const upload = multer();

program
  .requiredOption("-h, --host <host>", "server host")
  .requiredOption("-p, --port <port>", "server port")
  .requiredOption("-c, --cache <path>", "cache directory path");

program.parse(process.argv);

const { host, port, cache } = program.opts();

let notes = {};

app.get("/", (req, res) => {
  res.send("Yepi");
});

app.get("/notes/:note", (req, res) => {
  const note = req.params.note;
  if (notes[note]) {
    res.send(notes[note]);
  } else {
    res.status(404).send("Not found");
  }
});

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

app.delete("/notes/:note", (req, res) => {
  const note = req.params.note;
  if (notes[note]) {
    delete notes[note];
    res.send("Note deleted");
  } else {
    res.status(404).send("Not found");
  }
});

app.get("/notes", (req, res) => {
  const notesList = Object.keys(notes).map((note) => ({
    name: note,
    text: notes[note],
  }));
  res.json(notesList);
});

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

app.listen(3030, () => {
  console.log("Server running at http://localhost:3030");
});
