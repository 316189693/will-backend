const express = require('express')
const cors = require('cors')
let fs = require('fs');
let https = require("https");
let options = {
    key: fs.readFileSync("./enc/privkey.pem"),
    cert: fs.readFileSync("./enc/cacert.pem")
};

const app = express();
const port = 3000

app.get("/", (req, res) => {
    res.send('hello world')
})
app.use(express.json());
app.use(cors({
    origin : ['https://42.192.226.123:8000','https://localhost:8000']
}));
app.use(express.static("../will/dist"))
app.post("/login", (req, res, next) => {
    let account = req.body.account;
    let password = req.body.password;
    if (account == 'will' && password == '123') {
       return res.send({status: 1});
    }
    return res.send({status: -1});
})
let server = https.createServer(options, app);
server.listen(3000);