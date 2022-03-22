const express = require('express')
const router = express.Router();
const axios = require("axios").default;
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
var admin = require("firebase-admin");

var serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://vending-machine-8a200-default-rtdb.firebaseio.com"
});

router.post('/:uid', async(req, res) => {
    console.log(req.body);
    let user = undefined // user identifier from firebase
    try {
        user = await getAuth().getUser(req.params.uid)
        
    } catch (error) {
        res.status(400).send(error)
    }

    // This is where the actual code for verification with dates will go. I already installed moment in the project.
    // Use getFirestore to communicate to the database.

    let thingspeakResult = undefined;
    
    try {
        thingspeakResult = await axios.get('https://api.thingspeak.com/apps/thinghttp/send_request?api_key=1DK7AVFL27SMVMIX')
        if(thingspeakResult) {
            res.status(200).send({ success: true, message: 'message was successfully sent' });
        } else {

        }
    } catch (error) {
        console.log('status: ', error['status'] );
        res.status(500).send(error);
    }
    })

router.get('/', (req, res) => {
    res.send({ body: 'hella' })
})

module.exports = router;