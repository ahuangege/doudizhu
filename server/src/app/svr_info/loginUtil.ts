import { getInsertSql } from "../util/mysql";
import { I_roleInfo, I_roleAllInfo } from "../util/someInterface";
import { timeFormat } from "../util/util";
import { roleMysql } from "./roleInfo";
import { svr_info } from "./svr_info";


export class LoginUtil {

    getAllRoleInfo(uid: number, cb: (err: any, allInfo: I_roleAllInfo) => void) {
        this.getRoleInfo(uid, (err, role) => {
            if (err) {
                return cb(err, null as any);
            }
            cb(null, { "role": role });
        });
    }

    private getRoleInfo(uid: number, cb: (err: any, info: I_roleInfo) => void) {
        svr_info.mysql.query(`select * from player where uid = ${uid} limit 1`, null, (err, res: I_roleInfo[]) => {
            if (err) {
                return cb(err, null as any);
            }
            if (res.length === 0) {
                this.createRole(uid, cb);
            } else {
                let roleInfo = res[0]
                roleInfo.regTime = timeFormat(roleInfo.regTime);
                roleInfo.loginTime = timeFormat(roleInfo.loginTime);
                cb(null, roleInfo);
            }
        });
    }

    private createRole(uid: number, cb: (err: any, info: I_roleInfo) => void) {
        let nowTime = timeFormat(new Date());
        let roleInfo: I_roleInfo = {
            "uid": uid,
            "nickname": "农民" + uid,
            "gold": 1000,
            "regTime": nowTime,
            "loginTime": nowTime,
            "gameInfo": { "all": 0, "win": 0 },
        }
        svr_info.mysql.query(getInsertSql("player", roleInfo), null, (err) => {
            if (err) {
                return cb(err, null as any);
            }
            cb(null, roleInfo);
        });
    }
}