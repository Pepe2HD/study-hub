const express = require('express');
const cors = require('cors'); // Importa o cors
const app = express();
const routes = require('./routes');

app.use(cors({
  origin: [
    "https://study-hubs.netlify.app",
    "https://study-hub-pearl.vercel.app",
    "http://127.0.0.1:5500"         
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true // se você usa cookies ou autenticação
}));

app.use(express.json());
app.use(routes);

app.listen(3000, () => {
    console.log("Server em funcionamento.");
});
