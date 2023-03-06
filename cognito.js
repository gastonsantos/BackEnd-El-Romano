
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
global.fetch = require('node-fetch');

const poolData = {    
    UserPoolId : "sa-east-1_8qs3NyVR7", // Your user pool id here    
    ClientId : "2jqv5aeml0o0dnen5g5929qs4s"
    }; 
const pool_region = 'sa-east-1';

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

 
function RegisterUser(){
    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value:"Gaston Santos"}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"preferred_username",Value:"jay"}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"gender",Value:"male"}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"birthdate",Value:"1991-06-21"}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"address",Value:"CMB"}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:"gastons525@gmail.com"}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"phone_number",Value:"+5412614324321"}));
    //attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"custom:scope",Value:"admin"}));
    
    userPool.signUp('gastons525@gmail.com', 'Dni33022376#', attributeList, null, 
    function(err, result){
        if (err) {
            console.log(err); 
            return;
        } 
        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
    });
}

function Login() {
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username : 'gastons525@gmail.com',
        Password : 'Dni33022376#',
    });

    var userData = {
        Username : 'gastons525@gmail.com',
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            console.log('access token + ' + result.getAccessToken().getJwtToken());
            console.log('id token + ' + result.getIdToken().getJwtToken());
            console.log('refresh token + ' + result.getRefreshToken().getToken());
            
        },
        onFailure: function(err) {
            console.log(err);
        },

    });
}

exports.Login = Login;
//RegisterUser();
//Login();
