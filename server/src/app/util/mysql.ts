import mysql = require("mysql");
type callback = (err: mysql.MysqlError | null, res?: any) => void
type normalObj = { [key: string]: any };

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

    /**
     * mysql 查询
     * @param table 表名
     * @param field 字段数组
     * @param objCon 条件
     * @param cb 回调
     */
    select(table: string, field: "*" | string[], objCon: normalObj, cb: callback) {
        let sql = "select ";
        if (field === "*") {
            sql += field;
        } else {
            sql += field.join();
        }
        sql += " from " + table + " where ";
        let whereStr = "";
        let value: any;
        for (let key in objCon) {
            value = objCon[key];
            if (typeof value === "string") {
                whereStr += key + "='" + value + "' and ";
            } else {
                whereStr += key + "=" + value + " and ";
            }
        }
        sql += whereStr.substring(0, whereStr.length - 5);
        this.query(sql, null, cb);
    }

    /**
     * mysql 插入
     * @param table 表名
     * @param obj 数据
     * @param cb 回调
     */
    insert(table: string, obj: normalObj, cb?: callback) {
        let sql = "insert into " + table + "(";
        let fieldStr = "";
        let valueStr = "";
        let value;
        for (let key in obj) {
            value = obj[key];
            fieldStr += key + ",";
            if (typeof value === "string") {
                valueStr += "'" + value + "',";
            } else {
                valueStr += value + ",";
            }
        }
        sql += fieldStr.substring(0, fieldStr.length - 1) + ") values(" + valueStr.substring(0, valueStr.length - 1) + ")";
        this.query(sql, null, cb);
    }

    /**
     * mysql 更新
     * @param table 表名
     * @param obj 数据
     * @param objCon 条件
     * @param cb 回调
     */
    update(table: string, obj: normalObj, objCon: normalObj, cb?: callback) {
        let sql = "update " + table + " set ";
        let updateStr = "";
        let value;
        for (let key in obj) {
            value = obj[key];
            if (typeof value === "string") {
                updateStr += key + "='" + value + "',";
            } else {
                updateStr += key + "=" + value + ",";
            }
        }
        let whereStr = " where ";
        for (let key in objCon) {
            value = objCon[key];
            if (typeof value === "string") {
                whereStr += key + "='" + value + "' and ";
            } else {
                whereStr += key + "=" + value + " and ";
            }
        }
        sql += updateStr.substring(0, updateStr.length - 1) + whereStr.substring(0, whereStr.length - 5);
        this.query(sql, null, cb);
    }

    /**
     * mysql 删除
     * @param table 表名
     * @param objCon 条件
     * @param cb 回调
     */
    delete(table: string, objCon: normalObj, cb?: callback) {
        let sql = "delete from " + table + " where ";
        let key;
        let value;
        let whereStr = "";
        for (key in objCon) {
            value = objCon[key];
            whereStr += key + "=";
            if (typeof value === "string") {
                whereStr += "'" + value + "' and ";
            } else {
                whereStr += value + " and ";
            }
        }
        sql += whereStr.substring(0, whereStr.length - 5);
        this.query(sql, null, cb);
    }
}