$env: GOOGLE_APPLICATION_CREDENTIALS =
  "C:UsersmigueOneDriveDocumentosMiguel\6to SemestreTecnologias WebProyecto finalCorreokamel-6e19d-firebase-adminsdk-lsmfn-504abeb89f";

const express = require("express");
const path = require("path");
const bodyParse = require("body-parser");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(bodyParse.urlencoded({ extend: false })); //Soporte para decodificar las url
app.use(bodyParse.json()); //Soporte para codificar json

var admin = require("firebase-admin");
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
var firebase = require("firebase");

firebase.initializeApp(firebaseConfig);

var serviceAccount = require("./kamel-6e19d-firebase-adminsdk-lsmfn-504abeb89f.json");
const { userInfo } = require("os");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kamel-6e19d.firebaseio.com",
});

var db = admin.database();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.get("/", (req, res) => res.render("pages/index"));

//para los correo de contacto
//https://kinder-mountie-14642.herokuapp.com/registro
app.post("/registro", (req, res) => {
  const { user, email, pass } = req.body;

  var ref = db.ref("usuario").push();

  ref.set({
    user: user,
    email: email,
    pass: pass,
  });
  // Retrieve new posts as they are added to our database
  res.json({ user, email, pass });
});

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
  // Retrieve new posts as they are added to our database
  res.send({ consola, descrip, img, nombre, precio });
});

app.post("/producto", (req, res) => {
  const {nombre,precio} =  req.body;
  var ref = db.ref("carrito").push();

  ref.set({
    precio: precio,
    name: nombre,
  });
  // Retrieve new posts as they are added to our database
  console.log(nombre,precio);
  res.send({ nombre, precio });
});

app.get("/user/:email", (req, res) => {
  const email = req.params.email;
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

app.get("/salir", (req, res) => {
  firebase
    .auth()
    .signOut()
    .then((respuesta) => {
      res.send({ message: "Has salido de la sesion" });
    });
});


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

/* */

/* app.get("/obtenercarrito", (req, res) => {
  var ref = db.ref("carrito");
  ref.on("value", function(snapshot) {
    console.log(snapshot.val());
    res.send(snapshot.val())
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });


}); */

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
