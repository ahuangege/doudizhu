export default [
    "gate.main.login",  // 登录，获取网关
    "connector.main.enter",     // 登录到网关
    "connector.main.reconnectEnter",     // 重连
    "onKicked",     // 被踢

    "info.main.changeNickname", // 修改昵称
    "info.main.match", // 匹配
    "info.main.enterRoom", // 重连进入房间

    "match.main.cancelMatch", // 取消匹配

    "game.main.qiangDizhu", // 抢地主
    "game.main.playCard", // 出牌
    "game.main.leave", // 离开


    "onGameStart",  // 游戏开始
    "onQiangDizhu", // 抢地主
    "onDizhuOk",    // 抢地主完成
    "onPlayCard",   // 出牌
    "onGameOver",   // 游戏结束

    "onWinInfo",    // 游戏结算信息
    "onGoldChanged",    // 金币改变
]