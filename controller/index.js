const fs = require('fs');
const path = require('path');
let express = require('express');
let router = express.Router();

module.exports = function () {

   return (function _loadServiceDir(dirname) {
        let files = {};
        fs.readdirSync(dirname).forEach(function (file) {
            let filePath = path.join(dirname, file);

            if (fs.statSync(filePath).isDirectory()) {
                _loadServiceDir(filePath);
            } else {
                 _loadServiceFile(filePath, files);
            }
        });
        return router;
        function _loadServiceFile(filePath, files) {
            if (!filePath.endsWith("index.js")  && path.extname(filePath) === '.js') {
                let serviceName = path.basename(filePath, '.js');
                let controller = require(filePath);
                controller.init(router);
            }
        }
    })(__dirname);

};
