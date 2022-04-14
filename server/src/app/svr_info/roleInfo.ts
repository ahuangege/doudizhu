import { Application, rpcErr } from "mydog";
import { cmd } from "../../config/cmd";
import { I_matchRole } from "../svr_match/matchMgr";
import { I_gameState } from "../util/gameUtil";
import { nowMs } from "../util/nowTime";
import { I_roleAllInfo, I_roleInfo, I_roleAllInfoClient, I_roleMem } from "../util/someInterface";
import { timeFormat } from "../util/util";
import { svr_info } from "./svr_info";

// 数据库里的玩家数据（字段全部为真，以供下面使用）
export let roleMysql: I_roleInfo = {
    "uid": 1,
    "nickname": "1",
    "gold": 1,
    "regTime": "1",
    "loginTime": "1",
    "gameInfo": {} as any,
};

export class RoleInfo {
    public app: Application;
    public role: I_roleInfo;
    public roleMem: I_roleMem;
    public uid: number;
    public sid: string = "";

    private changedKey: { [k in keyof I_roleInfo]?: boolean } = {};
    public delTime = 0;
    private isInSql = false;

    public isMatchRpcing = false;
    constructor(app: Application, allInfo: I_roleAllInfo) {
        this.app = app;
        this.role = allInfo.role;
        this.uid = allInfo.role.uid;
        this.roleMem = {
            "gameSvr": "",
            "roomId": 0,
            "token": 0,
        }
    }

    entryServerLogic(sid: string, cb: (err: rpcErr, info: I_roleAllInfoClient) => void) {
        this.sid = sid;
        this.changeRoleInfo({ "loginTime": timeFormat(new Date()) });

        this.online();
        cb(0, {
            "code": 0,
            "role": {
                "uid": this.uid,
                "nickname": this.role.nickname,
                "gold": this.role.gold,
                "gameInfo": this.role.gameInfo,
                "roomId": this.roleMem.roomId,
            }
        });
    }

    /**
     * 上线
     */
    online() {
        this.delTime = 0;
    }

    /**
     * 掉线
     */
    offline() {
        this.delTime = nowMs() + 40 * 3600 * 1000;

        this.sid = "";

        let roleMem = this.roleMem;
        if (roleMem.gameSvr) {
            if (roleMem.roomId === 0) {
                this.app.rpc(roleMem.gameSvr).match.main.offline(this.uid);
                this.changeRoleMem({ "gameSvr": "", "roomId": 0 });
            } else {
                this.app.rpc(roleMem.gameSvr).game.main.offline(roleMem.roomId, this.uid);
            }
        }
    }

    updateSql() {
        this.isInSql = false;

        let updateArr: string[] = [];
        let key: keyof I_roleInfo;
        for (key in this.changedKey) {
            let typeStr = typeof roleMysql[key];
            if (typeStr === "string") {
                updateArr.push(key + "='" + this.role[key] + "'");
            } else if (typeStr === "object") {
                updateArr.push(key + "='" + JSON.stringify(this.role[key]) + "'");
            } else {
                updateArr.push(key + "=" + this.role[key]);
            }
        }
        if (updateArr.length === 0) {
            return;
        }
        this.changedKey = {};
        let sql = "update player set " + updateArr.join(",") + " where uid = " + this.uid + " limit 1";
        svr_info.mysql.query(sql, null, (err) => {
            if (err) {
                console.error(sql);
                console.error(err);
            }
        });
    }


    /**
     * 玩家信息改变
     */
    changeRoleInfo(changed: { [K in keyof I_roleInfo]?: I_roleInfo[K] }) {
        let key: keyof I_roleInfo;
        for (key in changed) {
            (this.role as any)[key] = changed[key];
            this.changedKey[key] = true;
        }
        this.addToSqlPool();
    }

    changeSqlKey(key: keyof I_roleInfo) {
        this.changedKey[key] = true;
        this.addToSqlPool();
    }

    addToSqlPool() {
        if (!this.isInSql) {
            this.isInSql = true;
            svr_info.roleMgr.toSqlRoles(this);
        }
    }

    changeRoleMem(changed: { [K in keyof I_roleMem]?: I_roleMem[K] }) {
        let key: keyof I_roleMem;
        for (key in changed) {
            (this.roleMem as any)[key] = changed[key];
        }
    }

    getMsg(cmd: number, info: any = null) {
        if (this.sid) {
            this.app.sendMsgByUidSid(cmd, info, [this]);
        }
    }


    toMatchJson() {
        let info: I_matchRole = {
            "uid": this.uid,
            "sid": this.sid,
            "nickname": this.role.nickname,
            "gold": this.role.gold,
        };
        return info;
    }

    addGold(num: number) {
        this.role.gold += num;
        if (this.role.gold < 0) {
            this.role.gold = 0;
        }
        this.changeSqlKey("gold");
        this.getMsg(cmd.onGoldChanged, { "gold": this.role.gold });
    }

    gameOver(info: { "isWin": boolean, "addGold": number }) {
        let gameInfo = this.role.gameInfo;
        gameInfo.all++;
        if (info.isWin) {
            gameInfo.win++;
        }
        this.changeSqlKey("gameInfo");
        this.addGold(info.addGold);
        this.getMsg(cmd.onWinInfo, { "isWin": info.isWin });
        this.changeRoleMem({ "gameSvr": "", "roomId": 0 });
    }
}