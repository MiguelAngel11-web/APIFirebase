//Variable para credeciales de google
$env: GOOGLE_APPLICATION_CREDENTIALS =
  "C:UsersmigueOneDriveDocumentosMiguel\6to SemestreTecnologias WebProyecto finalCorreokamel-6e19d-firebase-adminsdk-lsmfn-504abeb89f";
//Empiezan las variables para modulos necesarios
const express = require("express");
const path = require("path");
const bodyParse = require("body-parser");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const app = express();

//Lo que siempre se debe colocar para una conexio exitosa
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(bodyParse.urlencoded({ extend: false })); //Soporte para decodificar las url
app.use(bodyParse.json()); //Soporte para codificar json

var admin = require("firebase-admin");//Para entrar a nuestra base de datos como admin

//Varaible para la configuracion hacia la conexion de nuestra base de datos
const firebaseConfig = {
  apiKey: "AIzaSyACuw8o9wJT_yX1sMlAhqJbQYqwG5JBNnI",
  authDomain: "kamel-6e19d.firebaseapp.com",
  databaseURL: "https://kamel-6e19d.firebaseio.com",
  projectId: "kamel-6e19d",
  storageBucket: "kamel-6e19d.appspot.com",
  messagingSenderId: "687303594591",
  appId: "1:687303594591:web:bc30fd188a8cf29d66c1ea",
  measurementId: "G-F24KR2WGM1",
};
//Configuración para referinos a nuestra base de datos
var firebase = require("firebase");

firebase.initializeApp(firebaseConfig);

var serviceAccount = require("./kamel-6e19d-firebase-adminsdk-lsmfn-504abeb89f.json");
const { userInfo } = require("os");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kamel-6e19d.firebaseio.com",
});

var db = admin.database();
//Aqui termina la configuracion

//Para redireccionamiento al momentode levantar el servidor
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.get("/", (req, res) => res.render("pages/index"));


//Para el registro de los usuarios
app.post("/registro", (req, res) => {
  const { user, email, pass } = req.body;

  var ref = db.ref("usuario").push();

  ref.set({
    user: user,
    email: email,
    pass: pass,
  }); 
  //Guardamos el key que genera el push
  const postId = ref.key;
  console.log(postId)
  // Retrieve new posts as they are added to our database
  res.json(postId);
});
//Para obtener el id del push de nuestros usuarios
app.get("/getID/:email", (req, res) => {
  const email = req.params.email;
  var ref =  db.ref("usuario");
  //LOS DATOS LOS ACODAMOS CONFORME AL EMAIL Y SACAMOS SU KEY SI  EXISTE LA CUENTA
  ref.orderByChild("email").on("child_added", function(snapshot) {
  if(email == snapshot.val().email){
    console.log(snapshot.key)
    res.json(snapshot.key);
  }
});
});

//Dar de alta productos
app.post("/alta", (req, res) => {
  const { consola, descrip, img, nombre, precio } = req.body;

  var ref = db.ref("games").push();

  ref.set({
    consola: consola,
    descrip: descrip,
    precio: precio,
    img: img,
    nombre: nombre,
  });

  // MANDAMOS LOS DATOS QUE SE METERION A LA BASE
  res.send({ consola, descrip, img, nombre, precio });
});

//Dar de baja un producto
app.post("/userexternos",(req,res)=>{
  const { user, email } = req.body;

  var ref = db.ref("usuario").push();

  ref.set({
    user: user,
    email: email
  }); 
 //Guardamos el key que genera el push
  const postId = ref.key;
  console.log(postId)
  // MANDAMOS EL ID O KEY
  res.json(postId);

})



//Para sacar los datos del carrito de un user logueado
app.post("/producto", (req, res) => {
  const {nombre,precio,id} =  req.body;
  var ref = db.ref("usuario/"+id+"/carrito")//ESTO SE HACE PARA HACER REFERNCIA
  //A LA BASE DE DATOS DONDE ESTA EL USUARIO QUE REALIZO ESE CAMBIO EN EL CARRITO
  .push({
    precio: precio,
    name: nombre,
  });
  // MANDAMOS LOS DATOS J
  res.send({ nombre, precio});
});



//Para los favoritos del usuario
app.post("/fav",(req,res)=>{
  
    const {nombre,id} =  req.body;
    //HACEMOS REFERENCIA A LA BASE DE DATOS DE NUESTRO USER LOGUEADO
    var ref = db.ref("usuario/"+id+"/favoritos")
    .push({
      name: nombre,
    });
  
    res.json(nombre);
});

//Sacar informacion del usuario logueado
app.get("/user/:email", (req, res) => {
  const email = req.params.email;
  //SACAMOS EL USER CON AUTH DEL EMAIL Y PASSWORD
  admin.auth().getUserByEmail(email)
  .then(function(userRecord) {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log('Successfully fetched user data:', userRecord.toJSON());
    res.json(userRecord.toJSON());
  })
  .catch(function(error) {
   console.log('Error fetching user data:', error);
   res.json("Email Available");
  });
});
//Metodo para el signOut
app.get("/salir", (req, res) => {
  firebase
    .auth()
    .signOut()
    .then((respuesta) => {
      res.send({ message: "Has salido de la sesion" });
    });
});

//Sacar informacion del usuario logueado
app.get("/getUser/:email", (req, res) => {
  var user = firebase.auth().currentUser;
  const email = req.params.email;
  if (user) {
    // User is signed in.
    if(user.email == email)
        res.json(user.email)
  } else {
    // No user is signed in.
    res.send("Usuario cerro sesion");
  }
});

//Para que haga login
app.get("/signin/:email/:pass", (req, res) => {
  const password = req.params.pass;
  const email = req.params.email;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((data) => {
      console.log(data);
      res.json(data.operationType);
    })
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
      // ...
    });
});

//Crea en autenthificasion la cuenta
app.get("/crear/:email/:password", (req, res) => {
  const password = req.params.password;
  const email = req.params.email;
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((data) => {
      console.log(data);
    })
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log("Create--->" + errorCode);
      console.log("Create-->" + errorMessage);
      // ...
    });
});


//Para la conexion en localhost
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
