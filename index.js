const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jcjym.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// client.connect((err) => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   console.log("hitting");
//   client.close();
// });

async function run() {
  try {
    await client.connect();
    const database = client.db("travelMaster");
    const serviceCollection = database.collection("services");
    const bookingCollection = database.collection("booking");

    //get api
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    // //Post api
    app.post("/booking", async (req, res) => {
      const newBooking = req.body;
      const result = await bookingCollection.insertOne(newBooking);

      //   res.send("hit the post");
      console.log("got user", req.body);
      console.log("added user", result);
      res.send(result);
    });

    app.get("/myOrders/:email", async (req, res) => {
      console.log(req.params);
      const result = await bookingCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
      console.log(result);
    });

    // //Update api

    app.put("/bookingStatus/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "confirmed",
        },
      };
      const result = await bookingCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
      console.log("updated", id);
      // res.send("updated");
    });

    // // delete api
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);

      console.log(result);
      res.send(result);
    });

    //get api for manage all booking
    app.get("/allBookings", async (req, res) => {
      const cursor = bookingCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    //add new service
    app.post("/addService", async (req, res) => {
      const newUser = req.body;
      const result = await serviceCollection.insertOne(newUser);
      //   res.send("hit the post");
      console.log("got user", req.body);
      console.log("added user", result);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
