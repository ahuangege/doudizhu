import { Application } from "mydog";
import { mysqlConfig } from "../../config/dbConfig";
import { RoomMgr } from "../svr_game/roomMgr";
import { svr_game } from "../svr_game/svr_game";
import { GateMgr } from "../svr_gate/gateMgr";
import { svr_gate } from "../svr_gate/svr_gate";
import { RoleMgr } from "../svr_info/roleMgr";
import { svr_info } from "../svr_info/svr_info";
import { MatchMgr } from "../svr_match/matchMgr";
import { svr_match } from "../svr_match/svr_match";
import { svrType } from "./gameUtil";
import { nowMs } from "./nowTime";
import { MysqlClient } from "./mysql";
import { SyncUtil } from "sync-util";
import { RoleSync } from "../dbSync/roleSync";

// 游戏服务器启动，初始化
export function svr_init(app: Application) {
    nowMs();
    switch (app.serverType) {
        case svrType.gate:
            gate_init(app);
            break;
        case svrType.connector:
            connector_init(app);
            break;
        case svrType.info:
            info_init(app);
            break;
        case svrType.match:
            match_init(app);
            break;
        case svrType.game:
            game_init(app);
            break;
        default:
            break;
    }
}


function gate_init(app: Application) {
    svr_gate.mysql = new MysqlClient(mysqlConfig);
    svr_gate.gateMgr = new GateMgr(app);
}

function connector_init(app: Application) {
}


function info_init(app: Application) {
    svr_info.mysql = new MysqlClient(mysqlConfig)
    svr_info.roleMgr = new RoleMgr(app);
    svr_info.syncUtil = new SyncUtil({
        "handler": { "roleSync": new RoleSync(svr_info.mysql) },
        "syncInterval": 3 * 60 * 1000,
        "syncCount": 1000,
        "logger": console
    });

    app.setConfig("onBeforeExit", async (cb) => {
        await svr_info.syncUtil.saveAll();

        setTimeout(() => {
            cb();
        }, 2000);
    });
}

function match_init(app: Application) {
    svr_match.matchMgr = new MatchMgr(app);
}

function game_init(app: Application) {
    svr_game.roomMgr = new RoomMgr(app);
}