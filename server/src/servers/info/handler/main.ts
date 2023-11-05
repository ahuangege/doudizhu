import { Application, Session } from "mydog";
import { svr_info } from "../../../app/svr_info/svr_info";
import { changeConGameState, changeInfoGameState, constKey } from "../../../app/util/gameUtil";

export default class Handler {
    app: Application;
    constructor(app: Application) {
        this.app = app;
    }

    // 修改昵称
    changeNickname(msg: { nickname: string }, session: Session, next: Function) {
        let role = svr_info.roleMgr.getRole(session.uid);
        role.changeRoleInfo({ "nickname": msg.nickname });
        next({ "code": 0, "nickname": msg.nickname });
    }

    //  匹配
    async match(msg: any, session: Session, next: Function) {
        let role = svr_info.roleMgr.getRole(session.uid);
        if (role.isMatchRpcing) {
            return;
        }
        if (role.roleMem.gameSvr) {
            if (role.roleMem.roomId) {
                return next({ "code": 1, "info": "当前正在游戏中" });
            } else {
                return;
            }
        }
        role.isMatchRpcing = true;
        try {
            await this.app.rpc(constKey.match).match.main.match(role.toMatchJson());
        } catch (e) {
            console.log(e);
            role.isMatchRpcing = false;
            return next({ "code": -1 })
        }
        role.isMatchRpcing = false;

        next({ "code": 0 });
    }

    // 重连
    async enterRoom(msg: any, session: Session, next: Function) {
        let role = svr_info.roleMgr.getRole(session.uid);
        if (!role.roleMem.gameSvr || !role.roleMem.roomId) {
            return next({ "code": 1 });
        }
        const ok = await this.app.rpc(role.roleMem.gameSvr).game.main.enterRoom(role.roleMem.roomId, { "uid": role.uid, "sid": role.sid });
        if (!ok) {
            changeInfoGameState(session.uid, { "gameSvr": "", "roomId": 0 });
            return next({ "code": 1 });
        } else {
            changeConGameState(session.uid, session.sid, { "gameSvr": role.roleMem.gameSvr, "roomId": role.roleMem.roomId });
        }
        next({ "code": 0 });
    }
}


