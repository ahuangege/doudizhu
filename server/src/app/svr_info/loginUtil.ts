import { I_roleInfo, I_roleInfoMysql, I_roleAllInfo } from "../util/someInterface";
import { timeFormat } from "../util/util";
import { roleMysql } from "./roleInfo";
import { svr_info } from "./svr_info";


export class LoginUtil {

    getAllRoleInfo(uid: number, cb: (err: boolean, allInfo: I_roleAllInfo) => void) {
        this.getRoleInfo(uid, (err, role) => {
            if (err) {
                return cb(err, null as any);
            }
            cb(false, { role: role as any });
        });
    }

    private getRoleInfo(uid: number, cb: (err: boolean, info?: I_roleInfo) => void) {
        svr_info.mysql.query(`select * from player where uid = ${uid} limit 1`, null, (err, res) => {
            if (err) {
                return cb(true);
            }
            if (res.length === 0) {
                this.createRole(uid, cb);
            } else {
                cb(false, this.endRoleInfo(res[0]));
            }
        });
    }

    private createRole(uid: number, cb: (err: boolean, info?: I_roleInfo) => void) {
        let nowTime = timeFormat(new Date());
        let tmp_player_mysql: I_roleInfoMysql = {
            "uid": uid,
            "nickname": "农民" + uid,
            "gold": 1000,
            "regTime": nowTime,
            "loginTime": nowTime,
            "gameInfo": { "all": 0, "win": 0 },
        }
        for (let x in roleMysql) {
            if (typeof (roleMysql as any)[x] === "object") {
                (tmp_player_mysql as any)[x] = JSON.stringify((tmp_player_mysql as any)[x]);
            }
        }
        svr_info.mysql.insert("player", tmp_player_mysql, (err) => {
            if (err) {
                return cb(true);
            }
            cb(false, this.endRoleInfo(tmp_player_mysql));
        });
    }


    private endRoleInfo(tmp_player_mysql: I_roleInfoMysql) {
        for (let x in roleMysql) {
            if (typeof (roleMysql as any)[x] === "object") {
                (tmp_player_mysql as any)[x] = JSON.parse((tmp_player_mysql as any)[x]);
            }
        }
        type infoNotMysql = Exclude<keyof I_roleInfo, keyof I_roleInfoMysql>
        let dataNotMysql: { [p in infoNotMysql]: I_roleInfo[p] } = {
            "sid": "",
            "gameSvr": "",
            "roomId": 0,
            "token": 0,
        };
        tmp_player_mysql.regTime = timeFormat(tmp_player_mysql.regTime);
        tmp_player_mysql.loginTime = timeFormat(tmp_player_mysql.loginTime);
        let roleInfo: I_roleInfo = tmp_player_mysql as any;
        for (let key in dataNotMysql) {
            (roleInfo as any)[key] = (dataNotMysql as any)[key];
        }
        return roleInfo;
    }

}