import { Application } from "mydog";
import { DicObj } from "../util/util";


export class ConnectorMgr {

    private notTellInfoSvrUid: { [uid: number]: boolean } = {}; //  掉线后不用通知info服的uid集合

    constructor(app: Application) {

    }

    /**
     * 该玩家掉线后不必通知info服
     */
    setUid(uid: number) {
        this.notTellInfoSvrUid[uid] = true;
    }

    /**
     * 是否需要通知info服
     */
    isNeedTell(uid: number) {
        let has = this.notTellInfoSvrUid[uid] || false;
        if (has) {
            delete this.notTellInfoSvrUid[uid];
        }
        return !has;
    }

}