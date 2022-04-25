let commonUtil = require("../infrastructure/CommonUtil");
module.exports = {
  signup :  async function(user) {
      let user_name = mysql.escapeStr(user['account']);
      let first_name = mysql.escapeStr(user['first_name']);
      let last_name = mysql.escapeStr(user['last_name']);
      let password = user['password'];

      let old_user = await mysql.assocQuery(`select * from user where user_username=${user_name};`);
      if (old_user) {
          return {"status":400, "message": "user already exist!"};
      }
      let salt = commonUtil.generateStr(32);
      password = password + salt;
      let psw = commonUtil.md5(password);
      let rst = await mysql.query(`INSERT INTO user
          (user_username, user_status, user_created_when, user_salt, user_credit, user_first_name, user_last_name)
          VALUES(${user_name}, 1, now(), '${salt}', '${psw}', ${first_name}, ${last_name});`);
      return  {"status":200, user_id: rst.insertId};
  },
    login : async function(user) {
        let user_name = mysql.escapeStr(user['account']);
        let password = user['password'];
        let old_user = await mysql.assocQuery(`select * from user where user_username=${user_name};`);
        if (!old_user) {
            return {"status":400, "message": "user not exist!"};
        }
        password = password + old_user.user_salt;
        let psw = commonUtil.md5(password);
        if (psw == old_user.user_credit) {
            let token = commonUtil.md5(`users.${old_user.user_id}.token`+commonUtil.generateStr(26));
           await  redis.setKey(token, old_user.user_id, config.expire_token);
            return  {"status":200, user_id: old_user.user_id, token: token};
        }
        return  {"status":401, message: "Invalid password or account"};
    },
    list: async function() {

       return await mysql.query(`select user_username from user`);

    },
    detail: async function(user_id) {
      return await mysql.assocQuery(`select user_username, user_id, user_first_name, user_last_name from user where user_id ='${user_id}'`)
    }

};