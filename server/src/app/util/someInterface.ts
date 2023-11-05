import { Db_player } from "../logic/dbModel";

/**
 * 玩家内存里部分数据
 */
export interface I_roleMem {
    "gameSvr": string,          // game svr
    "roomId": number,          // 桌子id
    "token": number,            // token
}

/**
 * 玩家基本数据
 */
export interface I_roleAllInfo {
    "role": Db_player,
}

/**
 * 玩家基本数据（返回给客户端的）
 */
export interface I_roleAllInfoClient {
    "code": number,
    "uid": number,              // uid
    "nickname": string,         // 昵称
    "gold": number,           // 金币
    "gameInfo": { "all": number, "win": number },  // 游戏总局数，胜利局数
    "roomId": number,       // 房间id   
}




export interface I_enterSvr {
    sid: string
}