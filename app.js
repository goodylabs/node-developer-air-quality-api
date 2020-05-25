const express = require('express')
const cors = require('cors')

const database = require('./config/database')
const config = require('./config/app')

const app = express()
app.use(cors())
database.connect()

app.get('/', (req, res) => res.send('Working'))

const server = app.listen(config.port, () => {
    console.log(`Listening at ${server.address().address}:${server.address().port}`)
})
