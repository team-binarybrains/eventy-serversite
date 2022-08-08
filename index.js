const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const { application } = require("express");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bbikj86.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// IT'S THE JWT
function varifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "Un authorize access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    // console.log("this is decoded", decoded);
    next();
  });
}

// IT'S THE JWT

async function run() {
  try {
    await client.connect();

    await client.connect();
    const allServiceCollection = client
      .db("project-eventy-data-collection")
      .collection("all-service");
    const allReviewCollection = client
      .db("project-eventy-data-collection")
      .collection("all-review");
    const allEventListCollection = client
      .db("project-eventy-data-collection")
      .collection("allEvent-List");
    const allBlogsCollection = client
      .db("project-eventy-data-collection")
      .collection("all-Blogs");
    const allVenue = client
      .db("project-eventy-data-collection")
      .collection("allVenue-List");
    const allBookingServiceCollection = client
      .db("project-eventy-data-collection")
      .collection("all-booking-services");
    const allBookingVenueCollection = client
      .db("project-eventy-data-collection")
      .collection("all-booking-venue");
    const allCateringCollection = client
      .db("project-eventy-data-collection")
      .collection("all-catering");

    app.post("/post-review", async (req, res) => {
      const postReview = await allReviewCollection.insertOne(req.body);
      res.send(postReview);
    });

    // EVENT LISTING START
    app.get("/eventlisting", async (req, res) => {
      const type = req.query.catagory;
      const query = { type: type };
      const result = await allEventListCollection.find(query).toArray();

      res.send(result);
    });

    app.get("/alleventlisting", async (req, res) => {
      const query = {};
      const result = await allEventListCollection.find(query).toArray();
      res.send(result);
    });

    // get individual event
    app.get("/alleventlisting/:id", async (req, res) => {
      const { id } = req.params;
      const event = await allEventListCollection.findOne({ _id: ObjectId(id) });
      res.send(event);
    });

    // EVENT LISTING END
    // BLOGS SECTION START

    app.get("/blogs", async (req, res) => {
      const query = {};
      const result = await allBlogsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/blogsdetail/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await allBlogsCollection.findOne(query);
      res.send(result);
    });

    // get all service api
    app.get("/services-get", async (req, res) => {
      const getAllServices = await allServiceCollection.find({}).toArray();
      res.send(getAllServices);
    });

    // get service filter by id
    app.get("/single-service/:id", async (req, res) => {
      const getSingleServiceById = await allServiceCollection.findOne({
        _id: ObjectId(req.params.id),
      });
      res.send(getSingleServiceById);
    });

    // get event venues
    app.get("/venues", async (req, res) => {
      const venues = await allVenue.find({}).toArray();
      res.send(venues);
    });

    // get single event venue
    app.get("/venue/:id", async (req, res) => {
      const id = req.params;
      const venue = await allVenue.findOne({ _id: ObjectId(id) });
      res.send(venue);
    });
    // get  all EventList data
    app.get("/event-details/:id", async (req, res) => {
      const id = req.params;
      const venue = await allEventListCollection.findOne({ _id: ObjectId(id) });
      res.send(venue);
    });

    // booking venue api
    app.post("/venue-booking", async (req, res) => {
      const bookingVenue = await allBookingVenueCollection.insertOne(req.body);
      res.send(bookingVenue);
    });

    // post booking to database
    app.post("/service-booking", async (req, res) => {
      const result = await allBookingServiceCollection.insertOne(req.body);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Eventy server is running");
});

app.listen(port, () => {
  console.log("Listning to port", port);
});
