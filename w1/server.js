const express = require("express"); 
const app = express(); 
const PORT = 3000; 

app.get("/todo", (req, res) => { res.sendFile(__dirname + "/public/data/todo.json"); }); 

app.get("/index", (req, res) => { res.sendFile(__dirname + "/public/pages/index.html"); }); 

app.get("/read-todo", (req, res) => { res.sendFile(__dirname + "/public/pages/read-todo.html"); });

app.use((req, res) => {
  res.redirect(301, '/index');
});

app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); });