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





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
