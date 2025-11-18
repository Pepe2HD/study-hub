const express = require('express');
const cors = require('cors'); // Importa o cors
const app = express();
const routes = require('./routes');

app.use(cors({
  origin: [
    "https://studys-hub.netlify.app",
    "http://localhost:3000"         
  ],
  credentials: true // se você usa cookies ou autenticação
}));

app.use(express.json());
app.use(routes);

app.listen(3000, () => {
    console.log("Server em funcionamento.");
});
