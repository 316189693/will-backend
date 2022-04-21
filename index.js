const express = require('express')
const cors = require('cors')
const app = express();
const port = 3000

app.get("/", (req, res) => {
    res.send('hello world')
})
app.use(express.json());
app.use(cors({
    origin : ['http://localhost:8080']
}));

app.post("/login", (req, res, next) => {
    console.log(req);
    console.log(req.body);
    let account = req.body.account;
    let password = req.body.password;
    if (account == 'will' && password == '123') {
       return res.send({status: 1});
    }
    return res.send({status: -1});
})
app.listen(3000)