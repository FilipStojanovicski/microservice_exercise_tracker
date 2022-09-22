const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let bodyParser = require('body-parser');

let mongoose;
try {
  mongoose = require("mongoose");
} catch (e) {
  console.log(e);
}

// Mongoose Set Up
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Schema = mongoose.Schema;


// Define Models

// User
const userSchema = new Schema({
  username: {type: String, required: true}
})
let userModel = mongoose.model("user", userSchema);

// Exercise
const exerciseSchema = new Schema({
  user_id: {type: String, required: true},
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: {type: Date, default: new Date()}
})
let exerciseModel = mongoose.model("exercise", exerciseSchema);

app.use(cors())
app.use(express.static('public'))

// Middleware function to parse post requests
app.use("/", bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', function(req, res){
  let username = req.body.username;
  let newUser = new userModel({username: username});
  newUser.save();
  res.json(newUser);
})

app.get('/api/users', function(req, res){
  userModel.find({}).then(
    function(data){
      res.json(data);
    }
  )
})

app.get('/api/users/:_id/logs', function(req, res){
  let userID = req.params._id;

  let fromParam = req.query.from;
  let toParam = req.query.to;
  let limitParam = req.query.limit;

  console.log(req.query);
  // If limit param exists set it to an integer
  limitParam = limitParam ? parseInt(limitParam): limitParam

  let resObj = {}

  userModel.findById(userID, function (err, userFound){
    if (err) return console.log(err);

    resObj._id = userFound._id;
    resObj.username = userFound.username;

    let queryObj = {user_id: userID}

    // If we have a date
    if (fromParam || toParam){

      console.log("we have a date");

      queryObj.date = {}
      if (fromParam){
        queryObj.date['$gte'] = fromParam;
      }
      if (toParam){
        queryObj.date['$lte'] = toParam;
      }
    }

    if(limitParam){
      limitParam = parseInt(limitParam)
    }

    console.log(queryObj);

    exerciseModel.find(queryObj)
    .limit(limitParam)
    .exec(
      function(err, data){

        if (err) return console.log(err);

        resObj.count = data.length;

        // Format the exercises data
        data = data.map(function(x){
          return {description: x.description, duration: x.duration, 
            date: new Date(x.date).toDateString()}
        })

        resObj.log = data;


        res.json(resObj);
      }
    )
  })
  });

app.post('/api/users/:_id/exercises', function(req, res){
  let userID = req.params._id;

  exerciseObj = {
    user_id: userID,
    description: req.body.description,
    duration: req.body.duration
  }

  // If there is a date add it to the object
  if (req.body.date != ''){
    exerciseObj.date = req.body.date
  }

  let newExercise = new exerciseModel(exerciseObj);

  // Get the user associated with the id
  userModel.findById(userID, function (err, userFound){
    if (err) return console.log(err);

    // Add the exercise to the database
    newExercise.save();

    res.json({_id: userFound._id, username: userFound.username,
      description: newExercise.description, duration: newExercise.duration,
      date: new Date(newExercise.date).toDateString()
    });
  });
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
