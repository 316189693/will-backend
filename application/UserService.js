let commonUtil = require("../infrastructure/CommonUtil");

module.exports = {
  signup :  async function(user) {
      let user_name = mysql.escapeStr(user['account']);
      let password = user['password'];

      let old_user = await mysql.assocQuery(`select * from user where user_username=${user_name};`);
      if (old_user) {
          return {"status":400, "message": "user exists!"};
      }
      let salt = commonUtil.generateStr(32);
      password = password + salt;
      let psw = commonUtil.md5(password);
      let rst = await mysql.query(`INSERT INTO user
          (user_username, user_status, user_created_when, user_salt, user_credit)
          VALUES(${user_name}, 1, now(), '${salt}', '${psw}');`);
      return  {"status":200, user_id: rst.insertId};
  },
    login : async function(user) {
        let user_name = mysql.escapeStr(user['account']);
        let password = user['password'];
        let old_user = await mysql.assocQuery(`select * from user where user_username=${user_name};`);
        if (!old_user) {
            return {"status":400, "message": "user not exists!"};
        }
        password = password + old_user.user_salt;
        let psw = commonUtil.md5(password);
        if (psw == old_user.user_credit) {
            return  {"status":200, user_id: old_user.user_id};
        }
        return  {"status":401, message: "Invalid password or account"};
    }

};