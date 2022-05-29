const express = require('express')
const router = express.Router();
const moment = require('moment');
const axios = require("axios").default;
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');


router.post('/:machineKey', async(req, res) => {
    // https://api.thingspeak.com/apps/thinghttp/send_request?api_key=TQFFCP1P99PK5GK2
    const key = req.params.machineKey

    const link = 'https://api.thingspeak.com/channels/1676956/feeds.json?api_key=' + key + '&results=2';
    const lastUpdateID = Number(req.query.lastUpdateID)
    let timer = null
    let counter = 0
    let success = false
    
    const checkThingsSpeaKUpdate = async(url, lastUpdateID) => {
        // return res.send({ key, lastUpdateID, timer, url })
        try {
            const result = await axios.get(url)
            counter += 1;

            const feedLastID = result.data.channel.last_entry_id
            const feedField2 = result.data.feeds[1].field2
            // console.log(feedField2);
            // console.log('result: ', result.data.channel.last_entry_id, 'on storage: ', lastUpdateID);
            console.log({ lastUpdateID, feedLastID, feedField2 });
            // console.log('timer: ', timer);
            if(feedLastID > lastUpdateID && feedField2 === null) {
                console.log('match: ', true);
                clearInterval(timer);
                try {
                    await getFirestore().collection('responses').doc(key).set({ allowAccess: true })
                    return res.status(200).send({ message: 'Request was successfully handled '})
                } catch (error) {
                    return res.status(400).send(error)
                }
            }
            if(counter === 20) {
                return res.status(400).send({ message: 'An error occurred'})
            }
            // console.log(result);
        } catch (error) {
            return res.status(400).send(error)
        }
    }
    
    timer = setInterval(() => checkThingsSpeaKUpdate(link, lastUpdateID), 1500)
})


module.exports = router;