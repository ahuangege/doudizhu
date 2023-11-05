"use strict";
exports.__esModule = true;
exports.mydog_send = exports.mydog_cmd = void 0;
var fs = require("fs");
var path = require("path");
var protoClientDir = path.join(__dirname, "../../client/assets/scripts/common"); // 客户端协议目录
/** 接收 mydog cmd 命令 */
function mydog_cmd(lans, cmdObjArr) {
    function cmd_func() {
        var endStr = 'export const enum cmd {\n';
        for (var _i = 0, cmdObjArr_1 = cmdObjArr; _i < cmdObjArr_1.length; _i++) {
            var one = cmdObjArr_1[_i];
            if (one.note) {
                endStr += "\t/**\n\t * ".concat(one.note, "\n\t */\n");
            }
            var oneStr = one.cmd;
            if (one.cmd.indexOf('.') !== -1) {
                var tmpArr = one.cmd.split('.');
                oneStr = tmpArr[0] + '_' + tmpArr[1] + '_' + tmpArr[2];
            }
            endStr += "\t".concat(oneStr, " = \"").concat(one.cmd, "\",\n");
        }
        endStr += '}';
        fs.writeFileSync(path.join(protoClientDir, "cmdClient.ts"), endStr);
    }
    cmd_func();
}
exports.mydog_cmd = mydog_cmd;
/** 接收 mydog send 命令的消息回调 */
function mydog_send(reqArgv, timeoutIds, data) {
    console.log(data);
}
exports.mydog_send = mydog_send;
