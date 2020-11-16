export const enum cmd {
	/**
	 * 登录，获取网关
	 */
	gate_main_login = 0,
	/**
	 * 登录到网关
	 */
	connector_main_enter = 1,
	/**
	 * 重连
	 */
	connector_main_reconnectEnter = 2,
	/**
	 * 被踢
	 */
	onKicked = 3,
	/**
	 * 修改昵称
	 */
	info_main_changeNickname = 4,
	/**
	 * 匹配
	 */
	info_main_match = 5,
	/**
	 * 重连进入房间
	 */
	info_main_enterRoom = 6,
	/**
	 * 取消匹配
	 */
	match_main_cancelMatch = 7,
	/**
	 * 抢地主
	 */
	game_main_qiangDizhu = 8,
	/**
	 * 出牌
	 */
	game_main_playCard = 9,
	/**
	 * 离开
	 */
	game_main_leave = 10,
	/**
	 * 游戏开始
	 */
	onGameStart = 11,
	/**
	 * 抢地主
	 */
	onQiangDizhu = 12,
	/**
	 * 抢地主完成
	 */
	onDizhuOk = 13,
	/**
	 * 出牌
	 */
	onPlayCard = 14,
	/**
	 * 游戏结束
	 */
	onGameOver = 15,
	/**
	 * 游戏结算信息
	 */
	onWinInfo = 16,
	/**
	 * 金币改变
	 */
	onGoldChanged = 17,
}