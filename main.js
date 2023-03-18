const express = require('express');
const app = express();
const {router} = require('./Routes/Router');
const session = require('express-session');
const dotenv = require('dotenv');
const { connectDB } = require('./config/DB');
dotenv.config();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads",express.static(__dirname+'/uploads'));
app.use("/cart/uploads",express.static(__dirname+'/uploads'));

connectDB();
let users = [];
// fs.readFile('./users.json', 'utf-8', (err, storedData) => {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     else {
//         users = JSON.parse(storedData);
//     }
// })

// users = 

const SECRET_KEY = 'somethingsomething';
app.use(session({
    secret: SECRET_KEY,
    saveUninitialized: true,
    resave: false,
    // cookie: { secure: true }
}))

app.use(router);

app.listen(5000, () => {
    console.log('listening at 5000');
})