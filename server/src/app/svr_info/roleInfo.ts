import { Application, rpcErr } from "mydog";
import { cmd } from "../../config/cmd";
import { I_matchRole } from "../svr_match/matchMgr";
import { I_gameState } from "../util/gameUtil";
import { nowMs } from "../util/nowTime";
import { I_roleAllInfo, I_roleInfo, I_roleInfoMysql, I_roleAllInfoClient } from "../util/someInterface";
import { timeFormat } from "../util/util";
import { svr_info } from "./svr_info";

// 数据库里的玩家数据（字段全部为真，以供下面使用）
export let roleMysql: I_roleInfoMysql = {
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
    public uidsid: { "uid": number, "sid": string };

    private changedSqlKey: { [k in keyof I_roleInfoMysql]?: boolean } = {};
    public delTime = 0;
    private isInSql = false;

    public isMatchRpcing = false;
    constructor(app: Application, allInfo: I_roleAllInfo) {
        this.app = app;
        this.role = allInfo.role;
        this.uidsid = { "uid": allInfo.role.uid, "sid": allInfo.role.sid };
    }

    entryServerLogic(sid: string, cb: (err: rpcErr, info: I_roleAllInfoClient) => void) {
        this.uidsid.sid = sid;
        this.role.sid = sid;
        this.changeRoleInfo({ "loginTime": timeFormat(new Date()) });

        this.online();
        cb(0, { "code": 0, "role": this.role });
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

        this.uidsid.sid = "";
        this.role.sid = "";

        let tmpRole = this.role;
        if (tmpRole.gameSvr) {
            if (tmpRole.roomId === 0) {
                this.app.rpc(tmpRole.gameSvr).match.main.offline(tmpRole.uid);
                this.changeGameState({ "gameSvr": "", "roomId": 0 });
            } else {
                this.app.rpc(tmpRole.gameSvr).game.main.offline(tmpRole.roomId, tmpRole.uid);
            }
        }
    }

    updateSql() {
        this.isInSql = false;
        let changedStr = "";
        for (let x in this.changedSqlKey) {
            if (typeof (roleMysql as any)[x] === "string") {
                changedStr += ", " + x + "='" + (this.role as any)[x] + "'";
            } else if (typeof (roleMysql as any)[x] === "object") {
                changedStr += ", " + x + "='" + JSON.stringify((this.role as any)[x]) + "'";
            } else {
                changedStr += ", " + x + "=" + (this.role as any)[x];
            }
        }
        if (!changedStr) {
            return;
        }
        this.changedSqlKey = {};
        svr_info.mysql.query("update player set " + changedStr.slice(1) + " where uid = " + this.uidsid.uid + " limit 1", null, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }


    /**
     * 玩家信息改变
     */
    changeRoleInfo(changed: { [K in keyof I_roleInfo]?: I_roleInfo[K] }) {
        let needDb = false;
        for (let x in changed) {
            (this.role as any)[x] = (changed as any)[x];
            if ((roleMysql as any)[x]) {
                (this.changedSqlKey as any)[x] = true;
                needDb = true;
            }
        }
        if (needDb && !this.isInSql) {
            this.isInSql = true;
            svr_info.roleMgr.toSqlRoles(this);
        }
    }

    changeSqlKey(key: keyof I_roleInfo) {
        (this.changedSqlKey as any)[key] = true;
        if (!this.isInSql) {
            this.isInSql = true;
            svr_info.roleMgr.toSqlRoles(this);
        }
    }

    getMsg(cmd: number, info: any = null) {
        this.app.sendMsgByUidSid(cmd, info, [this.uidsid]);
    }

    changeGameState(gameState: I_gameState) {
        this.role.gameSvr = gameState.gameSvr;
        this.role.roomId = gameState.roomId;
    }

    toMatchJson() {
        let info: I_matchRole = {
            "uid": this.role.uid,
            "sid": this.role.sid,
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
        this.changeGameState({ "gameSvr": "", "roomId": 0 });
    }
}