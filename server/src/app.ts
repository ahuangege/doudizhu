
import { connector, createApp, Session } from "mydog";
let app = createApp();

import { svr_info } from "./app/svr_info/svr_info";
import { getCpuUsage } from "./app/util/cpuUsage";
import { constKey, getGameState, svrType } from "./app/util/gameUtil";
import { svr_init } from "./app/util/serverInit";
import { onUserLeave } from "./servers/connector/handler/main";

app.appName = "斗地主";
app.setConfig("encodeDecode", { "msgDecode": msgDecode, "msgEncode": msgEncode });
app.setConfig("connector", { "connector": connector.Ws, heartbeat: 10, interval: 30, clientOffCb: onUserLeave });
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
app.setConfig("logger", (level, info) => {
    if (level != "debug") {
        console.log(app.serverId, info);
    }
});



app.configure(svrType.connector, function () {
    app.route(svrType.info, function (session: Session) {
        return session.get("infoId");
    });
    app.route(svrType.match, function (session: Session) {
        return constKey.match;
    });
    app.route(svrType.game, function (session: Session) {
        return getGameState(session).gameSvr;
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
    let data = JSON.parse(msgBuf as any);
    console.log("↑ ", app.routeConfig[cmdId], data);
    return data;
}
function msgEncode(cmdId: number, data: any): Buffer {
    let msgStr = JSON.stringify(data);
    console.log(" ↓", app.routeConfig[cmdId], msgStr);
    return Buffer.from(msgStr);
}
