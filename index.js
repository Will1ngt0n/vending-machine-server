const express = require('express');
const app = express();
const cors = require('cors');
const requestsHandler = require('./requests-handler')

let corsOptions = { origin: false }
app.use( (req, res, next) => {
    const allowedOrigins = [
        'http://127.0.0.1:19000',
        'http://127.0.0.1:19001',
        'http://127.0.0.1:19002',
        'http://127.0.0.1:19003',
        'http://127.0.0.1:19004',
        'http://127.0.0.1:19005',
        'http://127.0.0.1:19006',
        'http://127.0.0.1:19007',
        'http://127.0.0.1:19008',
        'http://127.0.0.1:19009',
        'http://127.0.0.1:19010',
        'http://127.0.0.1:19011',
        'http://127.0.0.1:19012',
        'http://localhost:19006'
    ]
    console.log(allowedOrigins)
    const origin = req.headers.origin;
    console.log('origin: ', origin);
    corsOptions = { origin: false }
    if(allowedOrigins.includes(origin)) {
        console.log('origin: ', origin);
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Origin', origin)
        corsOptions = { origin: true }
    }

    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    return next();
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
console.log(corsOptions);
app.use('/requests', cors( corsOptions ), requestsHandler);

app.listen(process.env.PORT || 3006, () => {
    console.log('server running at port 3006...');
})