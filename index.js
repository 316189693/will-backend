const express = require('express')
const cors = require('cors')
let fs = require('fs');
let https = require("https");
const bodyParser = require("body-parser");

let userService = require("./application/UserService");

let uuid = require('node-uuid');
let _ = require("lodash");
let moment = require('moment');
let HtjyLog = require("./infrastructure/HtjyLog")
let CheckSecure = require("./middleware/CheckSecure")

let Controllers = require('./controller/index');


let env = process.env.NODE_ENV !== 'production' ? 'dev':'prod';
let cfg = require("../will-config/will-backend/"+env+"/config.json");
let options = {
    key: fs.readFileSync(cfg.privkey_file),
    cert: fs.readFileSync(cfg.cacert_file)
};
const app = express();
const port = cfg.port;


let HtjyMysql = require("./infrastructure/HtjyMysql");
let HtjyRedis = require("./infrastructure/HtjyRedis");
function initSeckillMysql() {
    let log = HtjyLog.getLogger("seckill_mysql");
    let mysql = new HtjyMysql({
        host: cfg.mysql_seckill_host,
        port: cfg.mysql_seckill_port,
        user: cfg.mysql_seckill_user,
        password: cfg.mysql_seckill_psw,
        database: cfg.mysql_seckill_db
    }, log);
    return mysql;
}
function initSeckillRedis(){
    let log = HtjyLog.getLogger("seckill_redis");
    let redis = new HtjyRedis({
        host: cfg.redis_seckill_host,
        port: cfg.redis_seckill_port,
        username: cfg.redis_seckill_username,
        password: cfg.redis_seckill_psw,
    }, log);
    return redis;
}

function beforeStartServer() {
    global.config = cfg;
    global.mysql = initSeckillMysql();
    global.redis = initSeckillRedis();
    let log = HtjyLog.getLogger("api");
    global.logger = log;
    global._ = _;
    global.moment = moment;
}

function startServer() {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors({
        origin :cfg.allow_cros_origin_array
    }));
    // access log
    HtjyLog.initAccessLog(app);
    app.use(assignId);
    app.use(CheckSecure());
    app.use('/htjy/api', Controllers());


    app.post("/login", reqHandler(async function (req, res, next){

        let account = req.body.account;
        let password = req.body.password;
        return  await userService.login({account: account, password:password});
    }));


    app.post("/user/signup", reqHandler(async function (req, res, next){

        let account = req.body.account;
        let password = req.body.password;
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        return  await userService.signup({account: account, password:password,first_name:first_name,last_name:last_name});
    }));



// auth
   // app.use(auth_service());
   // app.use("/tms/cron", Controllers());
    app.use(handleError());
    let server = https.createServer(options, app);
    server.listen(port);
}
let initReq = function (req) {

};


let handleRes = function (req, res, rst) {
    res.status(rst.status || 200);
    res.json(Object.assign({"reference_id": req.id}, rst))
};

function reqHandler (processFunc) {
    return async function (req, res, next) {
        try {
            initReq(req);
            // let rst = {'data':"ffffff"};
            let rst = await processFunc(req);
            handleRes(req, res, rst);
        } catch (err) {
            next(err);
        }
    }
}

function assignId(req, res, next) {
    req.id = uuid.v4();
    next()
}
function handleError() {
    return function (err, req, res, next) {
        logger.fomatErrorLog(req, err);
        let rst = Object.assign({}, {'reference_id': req.id},
            {
                "error": err,
                "stack": (err.response && err.response.data) || err.stack || err.message
            }
        );
        res.status(err.status || 500);
        res.json(rst);
    }
}

function afterStartServer() {
    logger.info("server started:"+cfg.port);
    process.on('unhandledRejection', error => {
        logger.error(error);
    });
}

async function start() {
    beforeStartServer();
    startServer();
    afterStartServer();
};
start();
