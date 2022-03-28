const express = require('express')
const router = express.Router();
const moment = require('moment');
const axios = require("axios").default;
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
var admin = require("firebase-admin");

var serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://vending-machine-8a200-default-rtdb.firebaseio.com"
});
router.get('/:uid/:time', async(req, res) => {
    let user = undefined
    try {
        user = await getAuth().getUser(req.params.uid)
    } catch (error) {
        if(error.code === 'auth/user-not-found') return res.status(404).send({ success: false, message: error.message, statusText: error.code, status: 404, code: 301 })
        if(error.code === 'auth/invalid-uid') return res.status(404).send({ success: false, message: error.message, statusText: error.code, status: 404, code: 300 })
        return res.status(400).send({ success: false, message: error.message, statusText: error.code, status: 400, code: 303 })
    }
    const data = await getLastScanInfo(req.params.uid)
    if(data.userDayScanned !== 28) return res.status(403).send({ success: true, message: 'The user has accessed the machine in the previous 28 days', code: 411, days: data.userDayScanned })
    console.log('going to second block');
    return res.status(200).send({ success: true, message: 'The user can access the machine', code: 200  })
})
router.post('/:key/:uid/:time', async(req, res) => {
    console.log(req.params);
    const exists = qrExists(req.params.key);
    if(!exists) return res.status(404).send({ success: false, message: 'Requested machine doesn\'t exist', code: 100 });

    // This is where the actual code for verification with dates will go. I already installed moment in the project.
    // Use getFirestore to communicate to the database.

    let thingspeakResult = undefined;
    
    try {
        thingspeakResult = await axios.get('https://api.thingspeak.com/apps/thinghttp/send_request?api_key=' + req.params.key)
        if(thingspeakResult) {
            return res.status(200).send({ success: true, message: 'message was successfully sent', status: 200, code: 201 });
        } else {

        }
    } catch (error) {
        console.log('error: ', error.data);
        if(error.response) {
            const { status, data } = error.response;
            console.log({ data, status });
            if(status === 404) return res.status(500).send({ message: 'Requested URL doesn\'t exist', status: status, code: 401}) 
            if(status === 400 && data === 'Invalid API Key') return res.status(500).send({ message: data, status: status, code: 402}) 
            // const err = { ...error }
            // console.log('err: ', err());
            if(error.status === 404) return res.status(404).send({ ...error, code: 400 })
            return res.status(404).send( error );
            return res.status(404).send({ ...error, code: 400, statusText: 'Not Found' });
        }
        return res.status(500).send({ message: 'Requested server doesn\'t exist', status: 500, code: 403 })

    }
})

const qrExists = (key) => {
    if(key === '1DK7AVFL27SMVMIX') return true;
    return false;
}
const getLastScanInfo = async(uid, time) => {
    let dataObj = {}

    try {
        // const currentUser = firebase.auth().currentUser;
        // console.log(currentUser.uid)

        let snapshot = await getFirestore().collection("scanner").where("userID", "==",uid).orderBy('date', 'desc').limit(1).get()
        // console.log(snapshot)
        // if(snapshot.size !== 0 ) console.log('snapshot exists');
        // if(snapshot.size == 0 ) console.log('snapshot not exists');
        console.log('time: ', moment().format('YYYY-MM-DD'));
        if(snapshot.size !== 0) {
            console.log('in if function');
            snapshot.forEach((docs) => {
                console.log(docs.id);
                console.log(docs.data().date);
                console.log(moment().format("YYYY-MM-DD"));
                let docID = docs.id;
                let userDayDiff = moment(time).diff(moment(docs.data().date), 'days');
                dataObj = { ...docs.data(), 'id': docID, 'userDayScanned': userDayDiff }
                console.log(dataObj)
                
            })
        } else{
            console.log("no record");
            dataObj = { 'userDayScanned': 28 }
            // dataObj['userDayScanned'] = 28
        }
    } catch (error) {
        // alert("There is something wrong while getting the scanner data!!!", error.message);
        console.log(error.message);
    }
    console.log('length: ', dataObj.length);
    console.log(dataObj);
    return dataObj

}
const getScannerTransactionUnsuccess = async(uid) => {
    let dataObj = []

    try {
        // const currentUser = firebase.auth().currentUser;
        // console.log(currentUser.uid)

        let doc = await getFirestore().collection("scanner").where("userID", "==", uid).where("scanned", "==", 0).get()
        console.log(doc)
        if(doc){
            doc.forEach((docs) => {
                console.log(docs.id);
                let docID = docs.id;
                let docYYYMM = docs.data().date.substring(0,7)
                dataObj.push({...docs.data(), ['id']: docID, ['yyyymm']: docYYYMM})
                console.log(dataObj)
            })
        } else{
            console.log("no record");
        }
    } catch (error) {
        alert("There is something wrong while getting the transaction data!!!", error.message);
        console.log(error.message);
    }
    console.log(dataObj.length);
    return dataObj

}

router.get('/', (req, res) => {
    return res.send({ body: 'hella' })
})

module.exports = router;