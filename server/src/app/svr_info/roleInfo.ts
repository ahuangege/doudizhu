import { Application } from "mydog";
import { cmd } from "../../config/cmd";
import { I_matchRole } from "../svr_match/matchMgr";
import { I_gameState } from "../util/gameUtil";
import { nowMs } from "../util/nowTime";
import { I_roleAllInfo, I_roleAllInfoClient, I_roleMem } from "../util/someInterface";
import { getUpdateObj, timeFormat } from "../util/util";
import { svr_info } from "./svr_info";
import { Db_player } from "../logic/dbModel";


export class RoleInfo {
    public app: Application;
    public role: Db_player;
    public roleMem: I_roleMem;
    public uid: number;
    public sid: string = "";

    private changedKey: { [key in keyof Db_player]?: boolean } = {};
    private isInSql = false;
    public delTime = 0;

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

    entryServerLogic(sid: string): I_roleAllInfoClient {
        this.sid = sid;
        this.changeRoleInfo({ "loginTime": Date.now() });

        this.online();
        return {
            "code": 0,
            "uid": this.uid,
            "nickname": this.role.nickname,
            "gold": this.role.gold,
            "gameInfo": this.role.gameInfo,
            "roomId": this.roleMem.roomId,
        };
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
        this.delTime = nowMs() + 3 * 3600 * 1000;

        this.sid = "";

        let roleMem = this.roleMem;
        if (roleMem.gameSvr) {
            if (roleMem.roomId === 0) {
                this.app.rpc(roleMem.gameSvr, true).match.main.offline(this.uid);
                this.changeRoleMem({ "gameSvr": "", "roomId": 0 });
            } else {
                this.app.rpc(roleMem.gameSvr, true).game.main.offline(roleMem.roomId, this.uid);
            }
        }

        svr_info.syncUtil.saveUid(this.uid);
    }

    //#region  玩家的信息改变，数据库
    private addToSqlPool() {
        if (!this.isInSql) {
            this.isInSql = true;
            svr_info.syncUtil.sync.roleSync.updateRole(this.uid, this);
        }
    }
    public getSqlUpdateObj() {
        let updateObj: Partial<Db_player> = getUpdateObj(this.role, this.changedKey);
        this.changedKey = {};
        this.isInSql = false;
        return updateObj;
    }

    changeSqlKey(key: keyof Db_player) {
        if (!this.changedKey[key]) {
            this.changedKey[key] = true;
            this.addToSqlPool();
        }
    }
    changeSqlKeys(keys: (keyof Db_player)[]) {
        for (let key of keys) {
            this.changeSqlKey(key);
        }
    }
    changeRoleInfo(changed: Partial<Db_player>) {
        let key: keyof Db_player;
        for (key in changed) {
            (this.role as any)[key] = changed[key];
            this.changedKey[key] = true;
        }
        this.addToSqlPool();
    }

    changeRoleMem(changed: Partial<I_roleMem>) {
        let key: keyof I_roleMem;
        for (key in changed) {
            (this.roleMem as any)[key] = changed[key];
        }
    }
    //#endregion

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