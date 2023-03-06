const  mysql = require('mysql');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const express = require('express');
var cors = require('cors')
const app = express();
app.use(cors()) // Use this



let _db;
const puertoDB = '27017';
const nombreDB = 'Libreria';

const mongoConnect = callback=>{
    MongoClient.connect(
        `mongodb://localhost:${puertoDB}/${nombreDB}`
    ).then(cliente =>{
        console.log('Conectado!');
        _db=cliente.db();
    })
    .catch(err =>{
        console.log(err);
        throw err;
    });
}

const getDb=() =>{
    if(_db){
        return _db;
    }
    throw 'No se Encontro Base de datos'
};
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

 /*
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Dni33022376',
    database: 'Libreria',
    //port: 3306
 });
 connection.connect(function(error){
    if(error){
       throw error;
    }else{
       console.log('Conexion correcta.');
    }
 });
    
 
module.exports = connection;

*/

/*
const puertoDB = '27017';
const nombreDB = 'Libreria';

const connection = () => {
    mongoose.connect(`mongodb://localhost:${puertoDB}/${nombreDB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Conexion exitosa con la base de datos.')
    })
    .catch(error => {
        console.log('Error en la conexion con la base de datos, ERROR: ', error);
        throw new Error('Error en la conexion con la base de datos, ERROR: ', error);
    })
} 

module.exports = {connection};
*/