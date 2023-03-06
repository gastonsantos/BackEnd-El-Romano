const express = require('express');
const router = express.Router();
const conexion = require('./config/conexion.js').getDb; // para q conexion se haga una funcion
var randomstring = require('randomstring');
const  {Libros}  = require('./models/libros');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');

global.fetch = require('node-fetch');


//**************MONGODB***************************
router.get('/productos', (req, res) => {
    const db = conexion();
    
    db.collection('libros').find().toArray()
    //Libros.findOne({id: 1})
    .then(librosDB => {
        res.send(librosDB);
        //console.log(librosDB);
    })
    .catch(error => {
        res.send({ mensaje: 'Error interno, intente de nuevo', error });
        console.log("errror");
    });
}); 

router.get('/productos/:id', (req, res) => {
    let ids = req.params.id;
    ide = parseInt(ids);
    const db = conexion();
    
    db.collection('libros').findOne({id: ide})
    
    .then(librosDB => {
        res.send(librosDB);
        //console.log(librosDB);
    })
    .catch(error => {
        res.send({ mensaje: 'Error interno, intente de nuevo', error });
        console.log("errror");
    });
}); 

router.post('/compra/', (req, res)=>{

    const{idUser, idProd, cantidad, precio}= req.body;
    const numeroOrden = randomstring.generate(20); 
    const db = conexion();
    var myobj = { numeroOrden: numeroOrden, idUser: idUser, idProd: idProd, cantidad: cantidad, precio: precio };
    //db.collection('compra').insertOne({numeroOrden: numeroOrden, idUser: idUser, idProd: idProd, cantidad: cantidad, precio: precio})
        db.collection('compra').insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
          });
  
    
   
});





//*********SQL************** 


// asignamos todas las rutas
/*
//Una consulta que trae todos los Productos
router.get('/productos', (req, res)=>{
 conexion.query(
    'SELECT p.nombre, p.descripcion , p.precio, p.descuento, p.stock, c.nombre as categoria, p.calificacion, p.imagen, p.autor, p.id from Producto p join  Categoria c on c.id = p.categoria'
    , (error, result)=>{
       if(error){
           throw error;
       }else{
        
           res.send(result);
       }
   })
});
*/
//Una consulta trae el producto por ID
/*
router.get('/productos/:id', (req, res)=>{

   
    let ids = req.params.id;
    id = parseInt(ids);
    
    conexion.query(
       'SELECT p.nombre, p.descripcion, p.precio, p.descuento, p.stock, c.nombre as categoria, p.calificacion, p.imagen, p.autor, p.id from Producto p join  Categoria c on c.id = p.categoria WHERE p.id = ?', [id], 
       (error, result)=>{
          if(error){
              throw error;
          }else{ 
           
              res.send(result);
          }
      }
  )
});
*/



//Trae todas Las Categorias
router.get('/categorias', (req, res)=>{
    conexion.query(
       'SELECT * from Categoria'
       , (error, result)=>{
          if(error){
              throw error;
          }else{
           
              res.send(result);
          }
      })
   });

//Trae todas Las peliculas de un genero
router.get('/categorias/:id', (req, res)=>{
    let ids = req.params.id;
    //id = parseInt(ids);
    conexion.query(
       "SELECT p.nombre, p.descripcion, p.precio, p.descuento, p.stock, c.nombre as categoria, p.calificacion, p.imagen, p.autor, p.id from Producto p join Categoria c on c.id = p.categoria WHERE c.nombre = ?", [ids], 
        (error, result)=>{
          if(error){
              throw error;
          }else{
           
              res.send(result);
          }
      })
   }); 



   //Agrega Usuario

router.post('/registrer/', (req, res)=>{

    const{id, nombre, userName, apellido, email, contraseña, domicilio, rol, activo}= req.body;

    if(!poseeLasPropiedadesRequeridas(req.body)){
        console.log('Todos los campos tienen que estar llenos');
        res.json(false);
         return false;

    } 
    if(!esEmailValido(req.body.email)){
        console.log('El Mail es Invalido');
        res.json(false);
        return false;
    }
    if(!esContrasenaValida(req.body.contraseña)){
        console.log('La contraseña debe contener mínimo 6 caracteres, al menos una letra y un número');  
         res.json(false);
        return false; 
        }
       
        let query1 = `SELECT Count(id)  as cuenta FROM  Usuario WHERE email = '${req.body.email}'`;
        conexion.query(query1, (err, result1)=>{
            if(err){
                throw err; 
            }else{
                console.log(result1);
                let valor = JSON.parse(JSON.stringify(result1));
                valor = valor[0].cuenta; 

            if(valor > 0 ){
                console.log('EL MAIL ya existe');
               
                res.json(false); 
                return false;   
                }
                    let query = `INSERT INTO Usuario(id, nombre, userName, apellido,email, contraseña, direccion, rol, activo) VALUES ('${id}','${nombre}', '${userName}','${apellido}','${email}' ,'${contraseña}', '${domicilio}', 'user', false)`;
                    conexion.query(query, (error, result)=>{
                        if(error){
                            throw error;
                        }else{
                              console.log("Usuario Agregado");
                              
                              res.json(true);  
                              return true;
                        }
                    })

                      
            }
        })
   
});

//get Usuario
router.post('/login', (req, res)=>{ 
    const{email, contraseña}= req.body;
    if(!poseeLasPropiedadesRequeridasDeSeion(req.body)){
        console.log('Todos los campos tienen que estar llenos');
        res.json(false);
         return false;

    } 

  let query = `SELECT userName FROM  Usuario WHERE email = '${email}' and contraseña = '${contraseña}'  `;
    conexion.query(query, (error, result)=>{
          if(error){
              throw error;
          }else{  
                console.log(result)
              
              res.send(result);
          }
     }
  )
});
//Login Con cognito
router.post('/loginCognito', (req,res)=>{
    const{email, contraseña}= req.body;
    let ema = email;
    let contra = contraseña;
    
    const poolData = {    
        UserPoolId : "sa-east-1_8qs3NyVR7", // Your user pool id here    
        ClientId : "2jqv5aeml0o0dnen5g5929qs4s" // Your client id here
        }; 
    const pool_region = 'sa-east-1';
    
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);


    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username : email,
        //Username : 'gastons525@gmail.com',
        //Password : 'Dni33022376#'
        Password : contraseña
    }); 

    var userData = {
        Username : email,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {

        //aca TRae Los atributos de Cognito
            var params = {
                AccessToken:  result.getAccessToken().getJwtToken()
            };
            
            AWS.config.update({region: 'sa-east-1'});
            var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    
            cognitoidentityserviceprovider.getUser(params, function(err, data) {
            if (err) {
            console.log(err, err.stack);
            } // an error occurred
            else{
                
            console.log(data.UserAttributes[1].Value);
            console.log(data.UserAttributes[0].Value)
            // 

            
            res.status(200).send({token: jwt.sign( result.getAccessToken().getJwtToken(), 'secretkey'), atributos: data.UserAttributes });
            } // successful response
             })
            //console.log(result.getAccessToken().getJwtToken());
            //console.log('id token + ' + result.getAccessToken().getJwtToken());
            //console.log('refresh token + ' + result.getRefreshToken().getToken());

    
            //res.send(result.getAccessToken().getJwtToken());

        },
        onFailure: function(err) {
            console.log(err);
        },

    }); 
    
})
/*
router.post('/obtenerAtributos', (req, res)=>{
//Esto lo pongo por las Dudas///
    const poolData = {    
        UserPoolId : "sa-east-1_8qs3NyVR7", // Your user pool id here    
        ClientId : "2jqv5aeml0o0dnen5g5929qs4s" // Your client id here
        }; 
    const pool_region = 'sa-east-1';
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
   /* var userData = {
        Username : 'gastons525@gmail.com',
        Pool : userPool
    };
    /*


    const{token}= req.body;
    var params = {
        AccessToken:  token
    };
    
    AWS.config.update({region: 'sa-east-1'});
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    
    cognitoidentityserviceprovider.getUser(params, function(err, data) {
     if (err) {
        console.log(err, err.stack);
     } // an error occurred
     else{
        console.log(data);
        res.status(200).send({atributios: data});
     } // successful response
     })



})
*/
router.post('/registroCognito', (req, res) => {
    const{id, nombre, userName, apellido, email, contraseña, domicilio, rol, activo}= req.body;
    const poolData = {    
        UserPoolId : "sa-east-1_8qs3NyVR7", // Your user pool id here    
        ClientId : "2jqv5aeml0o0dnen5g5929qs4s" // Your client id here
        }; 
    const pool_region = 'sa-east-1';
    
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    console.log("JSON:" + JSON.stringify(req.body));
 
    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:req.body.email}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"preferred_username",Value:req.body.userName}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value: req.body.nombre+" "+ req.body.apellido }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"address",Value:req.body.domicilio}));
    /*attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"preferred_username",Value:"jay"}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"gender",Value:"male"}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"birthdate",Value:"1991-06-21"}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"address",Value:"CMB"}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"phone_number",Value:"+5412614324321"}));
    */

    userPool.signUp(req.body.email, req.body.contraseña, attributeList, null, function(err, result){
        if (err) {
            console.log(err);
            res.json(err);
            return;
        }
        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
        res.json({
            bienvenido: `${cognitoUser.getUsername()}`
        })
    });
   
});


//recibo compra 
router.post('/orden', (req, res)=>{
    const{orden, total}= req.body;
    let query = `INSERT INTO compra(numeroOrden,total) values('${orden}','${total}')`;
    conexion.query(query, (error, restul)=>{
        if(error){
            throw error;
        }else{
            console.log("Compra Ingresada")
            res.json({status: 'Compra Ingresada'});
        }
    }) 
});
//Confirmo Compra

//SQL COMPRA//************** */
/*
router.post('/compra/', (req, res)=>{

    const{idUser, idProd, cantidad, precio}= req.body;
    const numeroOrden = randomstring.generate(20); 
    let query = `INSERT INTO ProdComprados(numeroOrden, id_usuario, id_prod,cantidad, precio) values('${numeroOrden}', '${idUser}','${idProd}','${cantidad}','${precio}')`;
    conexion.query(query, (error, result)=>{
        if(error){
            throw error;
        }else{
            console.log("Compra Confirmada")
            res.json({status: 'Compra Confirmada'});
        }
    }) 
});

//**********///////////////SQL */



//Validaciones
//que no tenga ninguno campo vacio en el registro
 const poseeLasPropiedadesRequeridas = propiedades =>{
    const propiedadesRequeridas = ['id', 'nombre', 'userName', 'apellido', 'email', 'contraseña', 'domicilio'];
    let existenTodasLasPropiedadesRequeridas = true;

    propiedadesRequeridas.forEach(propiedad => {
        if(!propiedades[propiedad])
            existenTodasLasPropiedadesRequeridas = false;
    });

    return existenTodasLasPropiedadesRequeridas;

}
//que no tenga ningun campo vacio de Sesion
const poseeLasPropiedadesRequeridasDeSeion= propiedades =>{
    const propiedadesRequeridas = ['email', 'contraseña'];
    let existenTodasLasPropiedadesRequeridas = true;

    propiedadesRequeridas.forEach(propiedad => {
        if(!propiedades[propiedad])
            existenTodasLasPropiedadesRequeridas = false;
    });

    return existenTodasLasPropiedadesRequeridas;
}

//que tenga el formato de mail
const esEmailValido = email => {
    return email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
}
//que tenga al menos una letra, un numero y al menos 6 caracteres

const esContrasenaValida = contrasena => {
    return contrasena.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/);
}
//que el id sea valido

const esIdValido = id => {
    return id.match(/^[0-9a-fA-F]{24}$/);
}







module.exports = router;