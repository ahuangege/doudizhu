import { Application, ServerInfo, Session } from "mydog";
import { svrType } from "../../../app/util/gameUtil";
import { randInt, timeFormat } from "../../../app/util/util";
import { GateMgr } from "../../../app/svr_gate/gateMgr";
import { svr_gate } from "../../../app/svr_gate/svr_gate";
import { MysqlClient } from "../../../app/util/mysql";
import { Db_account, dbTable } from "../../../app/logic/dbModel";


export default class Handler {
    private app: Application;
    private mysql: MysqlClient;
    constructor(app: Application) {
        this.app = app;
        this.mysql = svr_gate.mysql;

    }


    // 登录
    async login(msg: { "username": string, "password": string }, session: Session, next: Function) {
        let uid = 0;
        let res = await this.mysql.select<Db_account>(dbTable.account, "*", { "where": { "username": msg.username }, "limit": 1 });
        if (res.length === 0) {     // 有则登录，无则注册
            const account = new Db_account();
            account.username = msg.username;
            account.password = msg.password;
            delete (account as any).id;
            const insertRes = await this.mysql.insert<Db_account>(dbTable.account, account);
            uid = insertRes.insertId;
        } else if (msg.password !== res[0].password) {
            return next({ "code": 1, "info": "密码错误" });
        } else {
            uid = res[0].id;
        }

        let minSvr = svr_gate.gateMgr.getConSvr();
        next({
            "code": 0,
            "host": minSvr.clientHost,
            "port": minSvr.clientPort,
            "uid": uid,
            "token": svr_gate.gateMgr.getToken(uid),
        });

    }
}