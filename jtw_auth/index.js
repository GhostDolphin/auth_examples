require('dotenv').config();
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = 'Authorization';

app.use((req, res, next) => {
    const token = req.get(SESSION_KEY);
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send('Unauthorized');
            }
            req.user = decoded;
            next();
        });
    } else {
        next();
    }
});

app.get('/', (req, res) => {
    if (req.user && req.user.username) {
        return res.json({
            username: req.user.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/logout', (req, res) => {
    // This would instruct the client to remove the token from local storage
    res.send('<script>sessionStorage.removeItem("session"); window.location.href = "/";</script>');
});

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'Login1',
        password: 'Password1',
        username: 'Username1',
    }
]

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    const user = users.find(user => user.login === login && user.password === password);

    if (!user) {
        return res.status(401).send('Unauthorized');
    }

    const token = jwt.sign(
        { username: user.username, login: user.login },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ token });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
