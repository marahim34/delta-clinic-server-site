const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// mongodb://localhost:27017

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ivhgvma.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const appointmentOptionCollection = client.db('deltaClinic').collection('appointmentOptions');
        const bookingCollection = client.db('deltaClinic').collection('booking');

        // use Aggregate to query multiple collection and then merge data
        app.get('/appointmentOptions', async (req, res) => {
            const date = req.query.date;
            const query = {};
            const cursor = appointmentOptionCollection.find(query);
            const options = await cursor.toArray();
            const bookingQuery = { appointmentDate: date };
            const alreadyBooked = await bookingCollection.find(bookingQuery).toArray();
            options.map(option => {
                const optionBooked = alreadyBooked.filter(book => book.treatment === option.name)
                const bookedSlots = optionBooked.map(book => book.slot);
                console.log(bookedSlots);
            })
            res.send(options)
        });

        /**
         * API Naming Convention
         * bookings
         * app.get('/bookings/:id)
         * app.post(/bookings)
         * app.patch(/bookings/:id)
         * app.delete(bookings/:id)
         * **/

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result)

        })

    }
    finally {

    }
}

run().catch(error => console.error(error))


app.get('/', (req, res) => {
    res.send('delta-clinic server is running')
});

app.listen(port, () => {
    console.log(`delta-clinic server is running on port: ${port}`);
});

