
const bcrypt = require('bcrypt');
const { Users } = require('../Models/Model');
const { readData } = require('../Services/MongoServices');
var users = [];

// fs.readFile('./users.json', 'utf-8', (err, storedData) => {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     else {
//         users = JSON.parse(storedData);
//     }
// })

const mailjet = (email, mailToken, firstName, Subject, HTMLPart) => {
    const mailjet = require('node-mailjet').apiConnect(
        "628e64680dfd7cdd7f522b751a5272e6",
        "981a8d35da890ebea0ed0330f9f1cebf"
    )
    const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: 'shreyansh.sahu@ssipmt.com',
                    Name: 'E-Commerce',
                },
                To: [
                    {
                        Email: email,
                        Name: firstName,
                    },
                ],
                Subject,
                TextPart: '',
                HTMLPart
            },
        ],
    })
    request
        .then(result => {
            console.log(result.body)
        })
        .catch(err => {
            console.log(err)
        })
}

const signupGet = (req, res) => {
    res.render('signup');
    return;
}

const signupPost = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    // const foundUser = await Users.findOne({ email });
    const foundUser = await readData({
        Model: Users,
        findOne: true,
        filter: { email: req.session.email }
    });

    if (foundUser) {
        res.send(foundUser);
        return;
    }
    var createUser = {
        firstName,
        lastName,
        email,
        password: "",
        verified: false,
        mailToken: Date.now(),
        isAdmin: false,
    }
    bcrypt.hash(password, 10, async (err, hash) => {
        createUser.password = hash;
        users.push(createUser);
        Users.create(createUser);
    })
    req.session.loggedIn = false;
    req.session.firstName = createUser.firstName;
    req.session.lastName = createUser.lastName;
    req.session.email = createUser.email;
    req.session.mailToken = createUser.mailToken;
    const subject = 'Verify your account in E-Commerce';
    const htmlPart = `<h1>Hey ${req.session.firstName}, Please verify your account in E-Commerce by going to the below link.</h1>
    <p>localhost:5000/verifyAccount/${req.session.mailToken}</p>`
    mailjet(req.session.email, req.session.mailToken, req.session.firstName, subject, htmlPart)
    res.redirect('/verifyAccount');
}

const logout = (req, res) => {
    req.session.destroy((err) => {
        console.log(err);
    })
    res.redirect('/');
}

const loginGet = (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/Home');
        return;
    }
    res.render('login', { loggedIn: req.session.loggedIn })
}

const loginPost = async (req, res) => {
    const { email, password } = req.body;
    const foundUser = await readData({
        Model: Users,
        findOne: true,
        filter: { email: email }
    });

    req.session.loggedIn = false;
    if (foundUser) {
        bcrypt.compare(password, foundUser.password, (err, result) => {
            if (result) {
                req.session.firstName = foundUser.firstName;
                req.session.lastName = foundUser.lastName;
                req.session.email = foundUser.email;
                req.session.mailToken = foundUser.mailToken;
                req.session.isAdmin = foundUser.isAdmin;
                req.session.userId = foundUser._id;
                const subject = 'Verify your account in E-Commerce';
                const htmlPart = `<h1>Hey ${req.session.firstName}, Please verify your account in E-Commerce by going to the below link.</h1>
                <p>http://localhost:5000/verifyAccount/${req.session.mailToken}</p>`
                if (!foundUser.verified) {
                    mailjet(req.session.email, req.session.mailToken, req.session.firstName, subject, htmlPart);
                    res.redirect(`/verifyAccount`);
                    return;
                } else {
                    req.session.loggedIn = true;
                    req.session.access = true;
                }
                res.redirect('/Home');
                return;
            } else {
                res.status(400).send('Wrong email or password. Please try again.');
                return;
            }
        })
    } else {
        res.status(400).send('Wrong email or password. Please try again.');
    }
}

const verifyEmail = async (req, res) => {
    const { token } = req.params;
    if (token == req.session.mailToken) {
        req.session.loggedIn = true;
        const foundUser = await readData({
            Model: Users,
            findOne: true,
            filter: { mailToken: token }
        });

        foundUser.verified = true;
        foundUser.save();
        req.session.mailToken = "";
        res.redirect('/home');
        return;
    }
    else {
        res.redirect('/failedVerification');
    }
}

const changePassword = async (req, res) => {
    const { confirmPassword } = req.body;
    const foundUser = await readData({
        Model: Users,
        findOne: true,
        filter: { email: req.session.email }
    });
    bcrypt.hash(confirmPassword, 10, async (err, hash) => {
        foundUser.password = hash;
        await foundUser.save();

    })
    res.redirect('/login');
}

//checks the email and send the user verification email with link to change the password./endpoint= /forgotPassword, POST request
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const foundUser = await readData({
        Model: Users,
        findOne: true,
        filter: { email: email }
    });

    if (foundUser) {
        req.session.loggedIn = false;
        req.session.email = foundUser.email;
        req.session.firstName = foundUser.firstName;
        req.session.mailToken = foundUser.mailToken;
        const subject = 'Change Your E-Commerce Password';
        const htmlPart = `<h1>Hey ${req.session.firstName}, seems like you forgot your password, no worries!, go to the below link to change it.</h1>
        <form action = "http://localhost:5000/forgotPassword/${req.session.mailToken}" method = "GET">
            <button type = 'submit'>Click here!</button>
        </form>`;
        mailjet(req.session.email, req.session.mailToken, req.session.firstName, subject, htmlPart);
        res.redirect('/forgotPasswordEmail');
    } else {
        res.render('forgotPassword', { message: "Invalid email address" });
    }
}

const forgotPasswordTokenCheck = (req, res) => {
    const { token } = req.params;
    if (req.session.mailToken == token) {
        req.session.loggedIn = true;
        res.redirect('/changePassword');
        return;
    } else {
        res.redirect('/login');
        return;
    }
}




module.exports = {
    signupGet,
    signupPost,
    loginGet,
    loginPost,
    logout,
    verifyEmail,
    changePassword,
    forgotPassword,
    forgotPasswordTokenCheck,
}