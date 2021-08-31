import { Application, Session, app } from "mydog";
import { svr_connector } from "../../../app/svr_connector/svr_connector";
import { constKey, getInfoId } from "../../../app/util/gameUtil";

export default class Handler {
    app: Application;
    constructor(app: Application) {
        this.app = app;
    }

    enter(msg: { uid: number, token: number }, session: Session, next: Function) {
        this.app.rpc(constKey.gate).gate.main.isTokenOk(msg, (err, ok) => {
            if (err) {
                return next({ "code": -2, "info": "服务器错误" });
            }
            if (!ok) {
                return next({ "code": 1, "info": "token错误" });
            }
            let infoId = getInfoId(msg.uid);
            this.app.rpc(infoId).info.main.enterServer(msg.uid, session.sid, msg.token, (err, info) => {
                if (err || info.code !== 0) {
                    return next({ "code": 1 });
                }
                session.bind(msg.uid);
                session.set({ "infoId": infoId });
                next(info);
            });

        });
    }


    /**
     * 重连
     */
    reconnectEnter(msg: { "uid": number, "token": number }, session: Session, next: Function) {
        if (session.uid) {
            return;
        }
        let infoId = getInfoId(msg.uid);
        this.app.rpc(infoId).info.main.reconnectEntry(msg.uid, session.sid, msg.token, function (err, info) {
            if (err || info.code !== 0) {
                return next({ "code": 1 });
            }
            session.bind(msg.uid);
            session.set({ "infoId": infoId });
            next(info);
        });
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
    app.rpc(getInfoId(session.uid)).info.main.offline(session.uid);
}
