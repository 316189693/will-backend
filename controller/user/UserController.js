let proxy = require("../../infrastructure/ThisProxy");
let {reqHandler} = require("../../infrastructure/AsyncRequestUtil");
let userService = require("../../application/UserService");
class UserController {
    constructor() {

    }

    async fetchUserList(req) {
        let rst = await userService.list();
        return { 'status': 200, 'data': rst };
    }
    async fetchUserDetail(req) {
        let user_id = req.query.user_id;
        let rst = await userService.detail(user_id);
        return {'status': 200, 'data': rst};
    }
}

module.exports = {
    init: function(router){
        let userController = proxy(new UserController());
        router.get('/user/list',  reqHandler(userController.fetchUserList));
        router.get('/user/detail',  reqHandler(userController.fetchUserDetail));

        return router;
    }
};