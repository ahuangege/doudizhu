import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";

let protoClientDir = path.join(__dirname, "../../client/assets/scripts/common");      // 客户端协议目录


/** 接收 mydog cmd 命令 */
export function mydog_cmd(lans: string[], cmdObjArr: { "cmd": string, "note": string }[]) {
    function cmd_func() {
        let endStr = 'export const enum cmd {\n'
        for (let one of cmdObjArr) {
            if (one.note) {
                endStr += `\t/**\n\t * ${one.note}\n\t */\n`;
            }
            let oneStr = one.cmd;
            if (one.cmd.indexOf('.') !== -1) {
                let tmpArr = one.cmd.split('.');
                oneStr = tmpArr[0] + '_' + tmpArr[1] + '_' + tmpArr[2];
            }
            endStr += `\t${oneStr} = "${one.cmd}",\n`;
        }
        endStr += '}';
        fs.writeFileSync(path.join(protoClientDir, "cmdClient.ts"), endStr);
    }

    cmd_func();
}

/** 接收 mydog send 命令的消息回调 */
export function mydog_send(reqArgv: any, timeoutIds: string[], data: { "id": string, "serverType": string, "data": any }[]) {
    console.log(data);
}



