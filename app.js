const express = require('express')
const cors = require('cors')
const config = require('./config/app')

const app = express()
app.use(cors())

app.get('/', (req, res) => res.send('Working'))

const server = app.listen(config.port, () => {
    console.log(`Listening at ${server.address().address}:${server.address().port}`)
})
