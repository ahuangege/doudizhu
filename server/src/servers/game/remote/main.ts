import { Application } from "mydog";
import { RoomMgr } from "../../../app/svr_game/roomMgr";
import { svr_game } from "../../../app/svr_game/svr_game";
import { I_matchRole } from "../../../app/svr_match/matchMgr";

declare global {
    interface Rpc {
        game: {
            main: Remote,
        }
    }
}

export default class Remote {
    private roomMgr: RoomMgr;
    constructor(app: Application) {
        this.roomMgr = svr_game.roomMgr;
    }

    /**
     * 创建房间
     */
    newRoom(roles: I_matchRole[]) {
        this.roomMgr.newRoom(roles);
    }

    // 掉线
    offline(roomId: number, uid: number) {
        let room = this.roomMgr.getRoom(roomId);
        room.leave(uid);
    }

    // 重连进入房间
    enterRoom(roomId: number, info: { "uid": number, "sid": string }) {
        let room = this.roomMgr.getRoom(roomId);
        if (!room) {
            return false;
        }
        let ok = room.enter(info);
        return ok;
    }
}