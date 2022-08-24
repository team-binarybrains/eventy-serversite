const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const { application } = require("express");
var jwt = require("jsonwebtoken");
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

    const userCollection = client
      .db("project-eventy-data-collection")
      .collection("all-users");

    const allFirst4FaqQuestion = client
      .db("project-eventy-data-collection")
      .collection("all-first4-faq-question");

    const allSubServicesCollection = client
      .db("project-eventy-data-collection")
      .collection("all-sub-services");

    const allTicketBookingCollection = client
      .db("project-eventy-data-collection")
      .collection("all-ticket-booking");

    const allCommentCollection = client
      .db("project-eventy-data-collection")
      .collection("all-comment-collection");
      // for employee
    const allEmployee = client
      .db("project-eventy-data-collection")
      .collection("all-employee");


    app.post("/post-review", async (req, res) => {
      const postReview = await allReviewCollection.insertOne(req.body);
      res.send(postReview);
    });

    // get sub services api
    app.get("/get-sub-services/:type", async (req, res) => {
      const { type } = req.params
      const result = await allSubServicesCollection.find({ type }).toArray();
      res.send(result);
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

    // get all sub-service api
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


    app.get('/get-all-booking-info', async (req, res) => {
      const bookingInfoAdmin = await allBookingServiceCollection.find({}).toArray()
      res.send(bookingInfoAdmin)
    })

    // booking infor for user, filter by email
    app.get("/booking-info/:email", varifyJwt, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.params.email;
      if (email == decodedEmail) {
        const query = { user_email: email };
        const myBookings = await allBookingServiceCollection.find(query).toArray();
        res.send(myBookings);
      }
      else {
        res.status(403).send({ message: "Access denied! Forbidden access" });
      }
    })


    // cancle service booking api
    app.delete("/delete-booking/:id", async (req, res) => {
      const deleteSpecificBooking = await allBookingServiceCollection.deleteOne({ _id: req.params.id });
      res.send(deleteSpecificBooking);
    });

    // all user start
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      // console.log(updateDoc);
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "40d",
        }
      );
      res.send({ result, token });
    });
    app.get("/allusers", async (req, res) => {
      const query = {};
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/delete-user/:id", async (req, res) => {
      const deleteSpecificUser = await userCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(deleteSpecificUser);
    });
    // all user end

    // single user 
    app.get("/single-user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const result = await userCollection.findOne(query)
      res.send(result);
    });
    // end single user

    // update user 
    app.put("/user-update/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(query,updateDoc,options)
      res.send(result);
    });
    // end update user

    app.get("/allQuestion", async (req, res) => {
      const query = {};
      const result = await allFirst4FaqQuestion.find(query).toArray();
      res.send(result);
    });

    // get an admin
    app.get("/admin/:email", varifyJwt, async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user?.role === "admin";
      res.send({ admin: isAdmin });
    });


    // get product filter by id for payment
    app.get('/payment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const booking = await allBookingServiceCollection.findOne(query);
      res.send(booking)
    })

    // payment
    app.post('/create-payment-intent', async (req, res) => {
      const service = req.body
      const totalPrice = service?.totalPrice
      const amount = parseInt(totalPrice) * 100
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      })
      res.send({ clientSecret: paymentIntent.client_secret })
    })

    // get individual blogs comment
    app.get("/comment/:blogId", async (req, res) => {
      const { blogId } = req.params;
      const comments = await allCommentCollection.find({ blogId: blogId }).toArray();
      res.send(comments);
    });

    // get individual blogs comment
    app.get("/my-comment/:commentId", async (req, res) => {
      const { commentId } = req.params;
      const comments = await allCommentCollection.find({ commentId: commentId }).toArray();
      res.send(comments);
    });

    //  write a comment 
    app.put("/comment", async (req, res) => {
      const newServices = req.body;
      const result = await allCommentCollection.updateOne({ commentId: newServices?.commentId }, { $set: newServices }, { upsert: true });
      res.send({ success: result?.acknowledged });
    });

    // individual user's ticket booking put method
    app.put("/ticket-booking/:id", async (req, res) => {
      const { id } = req.params;
      const { booking } = req.body;
      const result = await allTicketBookingCollection.updateOne({ bookingId: id }, { $set: booking }, { upsert: true });
      res.send({ success: result?.acknowledged });
    })

    // individual user's ticket booking get method
    app.get("/ticket-booking/:id", async (req, res) => {
      const { id } = req.params;
      const result = await allTicketBookingCollection.findOne({ bookingId: id });
      res.send(result);
    })

    // individual tickets get method by userId
    app.get("/user-booked-ticket/:id", async (req, res) => {
      const { id } = req.params;
      const result = await allTicketBookingCollection.find({ userId: id }).toArray();
      res.send(result);
    })

    // delete booked ticket api by eventId
    app.delete("/delete-booked-ticket/:id", async (req, res) => {
      const { id } = req.params;
      const deleted = await allTicketBookingCollection.deleteOne({ eventId: id });
      res.send(deleted);
    });

    // individual booked event get method by eventId
    app.get("/event-booked-ticket/:id", async (req, res) => {
      const { id } = req.params;
      const result = await allTicketBookingCollection.find({ eventId: id }).toArray();
      res.send(result);
    })
    // get employed data
    app.get("/employee/:profession", async (req, res) => {
      const { profession } = req.params;
      const find = {profession:profession}
      const result = await allEmployee.find(find).toArray();
      res.send(result);
    })
    app.post("/employee", async (req, res) => {
      const employee = req.body;
      const result = await allEmployee.insertOne(employee);
      res.send(result);
    })

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
