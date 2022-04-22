let mysql = require('mysql2');
const pool = {};

class HtjyMysql {
    constructor(options, logger=null) {
        this.options = {
            host: null,
            port: null,
            user: null,
            password: null,
            database: null,
            multipleStatements:true,
            useConnectionPooling: true,
            connectionLimit : 10,
        };

        Object.assign(this.options, options);
        this.mypool = mysql.createPool(this.options);
         Object.assign(pool, this.mypool);
         Object.setPrototypeOf(pool, this.mypool.__proto__);

        pool.getConnection(function(err, connection) {

            if (logger) {
                if (err) {logger.error(err)}
                else {
                    logger.info("mysql connect successful");
                }

            }

        });

    }

     query(sql) {
        return  new Promise(function (resolve, reject) {
            pool.getConnection(function(err, connection) {
                if (err) reject(err);// not connected!
                // Use the connection
                connection.query(sql, function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();
                    // Handle error after the release.
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
        });
    }

     assocQuery(sql) {
        return  new Promise(function (resolve, reject) {
            pool.getConnection(function(err, connection) {
                if (err) reject(err); // not connected!

                // Use the connection
                connection.query(sql, function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();
                    // Handle error after the release.
                    if (error) {
                        reject(error);
                    } else {
                        if (results && results.length > 0) {
                            resolve(results[0]);
                        } else {
                            resolve(null);
                        }
                        
                    }
                });
            });
        });
    }

    escapeStr(val) {
        return mysql.escape(val);
    }
}



module.exports = HtjyMysql;