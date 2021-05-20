import { Application } from "mydog";
import { svr_connector } from "../../../app/svr_connector/svr_connector";
import { cmd } from "../../../config/cmd";

declare global {
    interface Rpc {
        connector: {
            main: Remote,
        }
    }
}

export default class Remote {
    private app: Application
    constructor(app: Application) {
        this.app = app;
    }

    /**
     * 获取在线人数
     */
    getOnlineNum(cb: (err: number, num: number) => void) {
        cb(0, this.app.clientNum);
    }


    kickUserNotTellInfoSvr(msg: { "uid": number, "info": string }, cb?: (err: number) => void) {
        let session = this.app.getSession(msg.uid);
        if (session) {
            this.app.sendMsgByUid(cmd.onKicked, { "code": 1, "info": msg.info }, [msg.uid]);
            svr_connector.connectorMgr.setUid(msg.uid);
            setTimeout(() => {
                session.close();
            }, 100)
        }
        cb && cb(0);
    }

    setGameState(uid: number, gameState: { "gameSvr": string, "roomId": number }) {
        let session = this.app.getSession(uid);
        if (session) {
            session.set({ "gameState": gameState });
        }
    }
}