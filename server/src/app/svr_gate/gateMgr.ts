import { Application, ServerInfo } from "mydog";
import { svrType } from "../util/gameUtil";
import { nowMs } from "../util/nowTime";
import { Dic, randInt } from "../util/util";


export class GateMgr {
    private app: Application;
    private minSvr: ServerInfo = null as any;
    private userToken: Dic<{ "token": number, "time": number }> = {};
    constructor(app: Application) {
        this.app = app;
        this.init();
    }

    private init() {
        setTimeout(this.checkMinSvr.bind(this), 1000);
        // 定时获取网关服人数
        setInterval(async () => {
            let svrs = this.app.getServersByType(svrType.connector);
            for (let one of svrs) {
                const num = await this.app.rpc(one.id).connector.main.getOnlineNum();
                one.userNum = num;
            }
            this.checkMinSvr();
        }, 5000);

        setInterval(this.checkTokenExpire.bind(this), 30 * 1000);
    }

    // 设置最低负载网关
    private checkMinSvr() {
        let svrs = this.app.getServersByType(svrType.connector);
        let minSvr = svrs[0];
        minSvr.userNum = minSvr.userNum || 0;
        for (let one of svrs) {
            one.userNum = one.userNum || 0;
            if (one.userNum < minSvr.userNum) {
                minSvr = one;
            }
        }
        this.minSvr = minSvr;
    }

    // 检测token过期
    private checkTokenExpire() {
        let now = nowMs();
        let userToken = this.userToken;
        for (let x in userToken) {
            if (now > userToken[x].time) {
                delete userToken[x];
            }
        }
    }

    getConSvr() {
        if (!this.app.getServerById(this.minSvr.id)) {
            this.checkMinSvr();
        }
        return this.minSvr;
    }

    getToken(uid: number) {
        let token = randInt(1000000);
        this.userToken[uid] = {
            "token": token,
            "time": nowMs() + 1 * 60 * 1000,
        };
        return token;
    }

    isTokenOk(info: { "uid": number, "token": number }) {
        let tokenInfo = this.userToken[info.uid];
        if (!tokenInfo) {
            return false;
        }
        let isOk = true;
        if (tokenInfo.token !== info.token) {
            isOk = false;
        }
        delete this.userToken[info.uid];
        return isOk;
    }
}