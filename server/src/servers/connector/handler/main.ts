import { Application, Session, app } from "mydog";
import { svr_connector } from "../../../app/svr_connector/svr_connector";
import { constKey, getInfoId } from "../../../app/util/gameUtil";

export default class Handler {
    app: Application;
    constructor(app: Application) {
        this.app = app;
    }

    async enter(msg: { uid: number, token: number }, session: Session, next: Function) {
        const ok = await this.app.rpc(constKey.gate).gate.main.isTokenOk(msg);
        if (!ok) {
            return next({ "code": 1, "info": "token错误" });
        }
        let infoId = getInfoId(msg.uid);
        const info = await this.app.rpc(infoId).info.main.enterServer(msg.uid, session.sid, msg.token);
        if (info.code !== 0) {
            return next(info);
        }
        session.bind(msg.uid);
        session.set({ "infoId": infoId });
        next(info);
    }


    /**
     * 重连
     */
    async reconnectEnter(msg: { "uid": number, "token": number }, session: Session, next: Function) {
        if (session.uid) {
            return;
        }
        let infoId = getInfoId(msg.uid);
        const info = await this.app.rpc(infoId).info.main.reconnectEntry(msg.uid, session.sid, msg.token);
        if (info.code !== 0) {
            return next(info);
        }
        session.bind(msg.uid);
        session.set({ "infoId": infoId });
        next(info);
    }
}



// 玩家socket断开
export function onUserLeave(session: Session) {
    console.log("--- one user leave :", session.uid);

    if (!session.uid) {
        return;
    }
    if (session.getLocal("notTellInfo")) {
        return;
    }
    app.rpc(getInfoId(session.uid), true).info.main.offline(session.uid);
}
