import { Application } from "mydog";
import { changeInfoGameState, constKey, svrType } from "../util/gameUtil";
import { randArr } from "../util/util";


export class MatchMgr {
    private app: Application;
    private roleArr: I_matchRole[] = [];
    constructor(app: Application) {
        this.app = app;
        setInterval(this.update.bind(this), 1000);
    }

    // 匹配
    match(info: I_matchRole) {
        this.roleArr.push(info);
        changeInfoGameState(info.uid, { "gameSvr": constKey.match, "roomId": 0 });
    }

    // 取消匹配
    cancelMatch(uid: number) {
        for (let i = this.roleArr.length - 1; i >= 0; i--) {
            let one = this.roleArr[i];
            if (one.uid === uid) {
                this.roleArr.splice(i, 1);
                changeInfoGameState(one.uid, { "gameSvr": "", "roomId": 0 });
                break;
            }
        }
    }
    offline(uid: number) {
        for (let i = this.roleArr.length - 1; i >= 0; i--) {
            let one = this.roleArr[i];
            if (one.uid === uid) {
                this.roleArr.splice(i, 1);
                break;
            }
        }
    }

    private update() {
        let roleArr = this.roleArr;
        while (roleArr.length >= 3) {
            this.matchOk(roleArr.splice(0, 3));
        }
    }

    private async matchOk(roles: I_matchRole[]) {
        let gameSvr = randArr(this.app.getServersByType(svrType.game));
        try {
            await this.app.rpc(gameSvr.id).game.main.newRoom(roles);
        } catch (e) {
            console.log(e)
            for (let one of roles) {
                changeInfoGameState(one.uid, { "gameSvr": "", "roomId": 0 });
            }
        }
    }
}

export interface I_matchRole {
    uid: number,
    sid: string,
    nickname: string,
    gold: number
}