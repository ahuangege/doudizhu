import { Application, ServerInfo, Session } from "mydog";
import { svrType } from "../../../app/util/gameUtil";
import { randInt, timeFormat } from "../../../app/util/util";
import mysqlClient from "../../../app/util/mysql";
import { GateMgr } from "../../../app/svr_gate/gateMgr";
import { svr_gate } from "../../../app/svr_gate/svr_gate";


export default class Handler {
    private app: Application;
    private mysql: mysqlClient;
    constructor(app: Application) {
        this.app = app;
        this.mysql = svr_gate.mysql;

    }


    // 登录
    login(msg: { "username": string, "password": string }, session: Session, next: Function) {

        this.mysql.query("select id, password from account where username=? limit 1", [msg.username], (err, res: { "id": number, "password": string }[]) => {
            if (err) {
                console.log(err)
                return next({ "code": -1 });
            }
            if (res.length === 0) {     // 有则登录，无则注册
                this.mysql.query("insert into account(username,password,regTime) values(?,?,?)", [msg.username, msg.password, timeFormat(new Date())], (err, res) => {
                    if (err) {
                        console.log(err)
                        return next({ "code": -1 });
                    }
                    okData(res.insertId);
                });
            } else if (msg.password !== res[0].password) {
                next({ "code": 1, "info": "密码错误" });
            } else {
                okData(res[0].id);
            }
        });

        function okData(uid: number) {
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
}