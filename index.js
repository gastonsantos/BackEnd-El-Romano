const cors = require('cors');
const bodyParser = require('body-parser');
//const jwt = require('jsonwebtoken');
const express = require('express');

const mongoose = require('mongoose');
const mongodb = require('mongodb');
const { mongoConnect } = require('./config/conexion.js');
const MongoClient = mongodb.MongoClient;

//Conexion a BD
const connectionBD = require('./config/conexion.js').mongoConnect;


const app = express();
const port = process.env.PORT || 3000;
//const port = 3000
app.use(cors());
app.use(bodyParser.json());



mongoConnect(()=>{
    app.listen(3000);
})
app.listen(port, () => {

    console.log(`Example app listening on port ${port}`)
})


//Rutas de Productos
app.use('/api', require('./router'));



