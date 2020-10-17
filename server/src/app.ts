
import { Application, connector, createApp, Session } from "mydog";
import { svr_info } from "./app/svr_info/svr_info";
let app = createApp();

import { getCpuUsage } from "./app/util/cpuUsage";
import { constKey, getGameState, svrType } from "./app/util/gameUtil";
import { svr_init } from "./app/util/serverInit";

app.appName = "斗地主";
app.setConfig("encodeDecode", { "msgDecode": msgDecode, "msgEncode": msgEncode });
app.setConfig("connector", { "connector": connector.connectorWs, heartbeat: 10, interval: 30 });
app.setConfig("rpc", { interval: 30 });
app.setConfig("mydogList", () => {
    let onlineNum = "--";
    let roleInfoNum = "--";
    if (app.serverType === svrType.connector) {
        onlineNum = app.clientNum.toString();
    } else if (app.serverType === svrType.info) {
        roleInfoNum = svr_info.roleMgr.getRoleNum().toString();
    }
    return [
        { "title": "cpu(%)", "value": getCpuUsage() },
        { "title": "onlineNum", "value": onlineNum },
        { "title": "infoNum", "value": roleInfoNum },
    ];
});
app.setConfig("logger", function (level, info) {
    if (level === "warn" || level === "error") {
        console.log(app.serverId, info);
    }
});



app.configure(svrType.connector, function () {
    app.route(svrType.info, function (app: Application, session: Session, serverType: string, cb) {
        cb(session.get("infoId"));
    });
    app.route(svrType.match, function (app: Application, session: Session, serverType: string, cb) {
        cb(constKey.match);
    });
    app.route(svrType.game, function (app: Application, session: Session, serverType: string, cb) {
        cb(getGameState(session).gameSvr);
    });
});


app.configure("all", function () {
    svr_init(app);
});



app.start();


process.on("uncaughtException", function (err: any) {
    console.log(err)
});



function msgDecode(cmdId: number, msgBuf: Buffer): any {
    console.log("req--", app.routeConfig[cmdId], JSON.parse(msgBuf as any));
    return JSON.parse(msgBuf as any);
}
function msgEncode(cmdId: number, data: any): Buffer {
    console.log("rsp--", app.routeConfig[cmdId], JSON.stringify(data));
    return Buffer.from(JSON.stringify(data));
}
