import { RoomMgr } from "./roomMgr";


interface I_svr_game {
    roomMgr: RoomMgr,
}

export let svr_game: I_svr_game = {
    roomMgr: null as any,
}
