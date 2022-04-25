module.exports = function () {
    let skip_urls = ["/", "/login", "/user/signup"];
    return async function authHandle(req, res, next) {

        if (skip_urls.length > 0 && skip_urls.find((item) => item == req.url)) {
            next()

        } else {
            let token = req.query.UserToken;
            let user_id = req.query.UserID;
            let rst = await redis.getKey(token);
            if (!rst) {
                next({'status': 401, 'message': 'Token not exist or expired. please log in again'});
            } else {
                if (rst != user_id) {
                    next({'status': 401, 'message': 'Invalid token.  please log in again'});
                } else {
                    await redis.expireKey(token, config.expire_token)
                    next()
                }

            }
        }

    }
}