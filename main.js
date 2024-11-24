const { program } = require("commander");
const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

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

app.get("/", (req, res) => {
  console.log("Done!");
  res.send("Yepi");
});

let notes = {};

app.get("/notes/:note", (req, res) => {
  const note = req.params.note;
  if (notes[note]) {
    res.send(notes[note]);
  } else {
    res.status(404).send("Not found");
  }
});

//app.use(express.text());
//app.use(bodyParser.raw());

app.use(bodyParser.raw({ type: "text/plain" }));

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

app.get("/UploadForm.html", (req, res) => {
  res.sendFile(path.join(__dirname, "UploadForm.html"));
});

const server = http.createServer(app);

server.listen(3030, "0.0.0.0", () => {
  console.log(`Server running: http://${host}:${port}`);
});
