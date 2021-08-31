import mysql = require("mysql");
type callback = (err: mysql.MysqlError | null, res?: any) => void

export default class mysqlClient {
    private pool: mysql.Pool;
    constructor(config: mysql.PoolConfig) {
        this.pool = mysql.createPool(config);
    }

    /**
     * 执行mysql语句
     * @param sql sql语句
     * @param args sql参数
     * @param cb 回调
     */
    query(sql: string, args: any = null, cb?: callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                cb && cb(err);
            } else {
                connection.query(sql, args, function (err, res) {
                    connection.release();
                    cb && cb(err, res);
                });
            }
        });
    }
}

export function getInsertSql(table: string, obj: { [key: string]: any }) {
    let fieldArr: string[] = [];
    let valueArr: string[] = [];
    for (let key in obj) {
        fieldArr.push(key);
        let value = obj[key];
        if (typeof value === "string") {
            valueArr.push("'" + value + "'");
        } else if (typeof value === "object") {
            valueArr.push("'" + JSON.stringify(value) + "'");
        } else {
            valueArr.push(value);
        }
    }
    let sql = "insert into " + table + "(" + fieldArr.join(",") + ") values(" + valueArr.join(",") + ")";
    return sql;
}