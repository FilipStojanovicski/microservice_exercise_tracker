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

app.get('/api/:_id/logs', function(req, res){
  let userID = req.params._id;

  exerciseModel.find({user_id: userID}).then(
    function(data){
      res.json(data);
    }
  )
})

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
