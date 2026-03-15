const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000
const cors = require('cors')
const mongoose = require('mongoose')
const userRoute = require('./routes/user_route')
const authenticationRoute = require('./routes/authentification_route')
const reminderRoute = require('./routes/reminder_routes');
const billRoute = require('./routes/bill_route')
const startReminderJob = require('./cron/remindercron.js');


const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL
if (!mongoUri) {
    console.error('No MongoDB connection string found in environment (MONGODB_URI or DATABASE_URL)')
    process.exit(1)
}

mongoose.connect(mongoUri)
const db = mongoose.connection
db.on('error', (err) => { console.log('Error connecting to MongoDB', err) })
db.on('open', () => { console.log('Connected to MongoDB') })

startReminderJob(); // Lance le cron à l'init

app.use(express.json())
app.use(cors())
app.use('/users', userRoute)
app.use('/auth', authenticationRoute)
app.use('/bills', billRoute)
app.use('/reminder', reminderRoute);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});