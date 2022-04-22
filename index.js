const express = require('express')
const cors = require('cors')
let fs = require('fs');
let https = require("https");
let env = process.env.NODE_ENV !== 'production' ? 'dev':'prod';
console.log(env);
let cfg = require("../will-config/will-backend/"+env+"/config.json");
let options = {
    key: fs.readFileSync(cfg.privkey_file),
    cert: fs.readFileSync(cfg.cacert_file)
};

const app = express();
const port = cfg.port;

app.get("/", (req, res) => {
    res.send('hello world')
})
app.use(express.json());
app.use(cors({
    origin :cfg.allow_cros_origin_array
}));
app.post("/login", (req, res, next) => {
    let account = req.body.account;
    let password = req.body.password;
    if (account == 'will' && password == '123') {
       return res.send({status: 1});
    }
    return res.send({status: -1});
})
let server = https.createServer(options, app);
server.listen(port);