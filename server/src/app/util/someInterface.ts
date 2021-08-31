/**
 * 玩家数据结构 mysql
 */
export interface I_roleInfo {
    "uid": number,              // uid
    "nickname": string,         // 昵称
    "gold": number,           // 金币
    "regTime": string,           // 注册时间
    "loginTime": string,           // 最近登录时间
    "gameInfo": { "win": number, "all": number }, // 胜利局数，总局数
}

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
    "role": I_roleInfo,
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