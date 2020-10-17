import { Application, rpcErr } from "mydog";
import { nowMs } from "../util/nowTime";
import { I_roleAllInfo, I_roleAllInfoClient } from "../util/someInterface";
import { LoginUtil } from "./loginUtil";
import { RoleInfo } from "./roleInfo";

export class RoleMgr {
    private app: Application;
    public loginUtil: LoginUtil;                        // 登陆 util
    private roles: { [uid: number]: RoleInfo } = {};    // 所有玩家数据
    private updateSqlRoles: Set<RoleInfo> = new Set();   // 定时落地玩家数据
    constructor(app: Application) {
        this.app = app;
        this.loginUtil = new LoginUtil();
        setInterval(this.updateSqlRole.bind(this), 1000 / 10);
        setInterval(this.check_delRole.bind(this), 1 * 3600 * 1000);
    }

    /**
     * 玩家登录游戏
     * @param uid 
     */
    enterServer(uid: number, sid: string, token: number, cb: (err: rpcErr, info: I_roleAllInfoClient) => void) {
        let role = this.roles[uid];
        if (!role) {
            this.loginUtil.getAllRoleInfo(uid, (err, allInfo) => {
                if (err) {
                    return cb(0, { code: -1 } as any);
                }
                role = new RoleInfo(this.app, allInfo);
                this.roles[uid] = role;
                role.role.token = token;
                role.entryServerLogic(sid, cb);
            });
            return;
        }
        console.log('信息已存在', role.role.sid);
        if (role.role.sid) {
            let data = { "uid": uid, "info": "您的账号在别处登陆" };
            this.app.rpc(role.role.sid).connector.main.kickUserNotTellInfoSvr(data, (err) => {
                if (err && err !== rpcErr.noServer) {
                    return cb(0, { code: -1 } as any);
                }
                role.offline();
                role.role.token = token;
                role.entryServerLogic(sid, cb);
            });
        } else {
            role.role.token = token;
            role.entryServerLogic(sid, cb);
        }
    }

    /**
     * 重连
     */
    reconnectEntry(uid: number, sid: string, token: number, cb: (err: rpcErr, info: I_roleAllInfoClient) => void) {
        let role = this.roles[uid];
        if (!role) {
            return cb(0, { "code": 1 } as any);
        }
        if (role.role.token !== token) {
            return cb(1, { "code": 2 } as any);
        }
        if (role.role.sid) {
            let data = { "uid": uid, "info": "您的账号在别处登陆" };
            this.app.rpc(role.role.sid).connector.main.kickUserNotTellInfoSvr(data, (err) => {
                if (err && err !== rpcErr.noServer) {
                    return cb(0, { code: -1 } as any);
                }
                role.offline();
                role.entryServerLogic(sid, cb);
            });
        } else {
            role.entryServerLogic(sid, cb);
        }
    }

    getRole(uid: number) {
        return this.roles[uid];
    }


    toSqlRoles(role: RoleInfo) {
        this.updateSqlRoles.add(role);
    }

    private updateSqlRole() {
        let num = 0;
        for (let one of this.updateSqlRoles) {
            one.updateSql();
            this.updateSqlRoles.delete(one);
            num++;
            if (num === 20) {
                break;
            }
        }
    }

    // 删除过期玩家数据
    private check_delRole() {
        let one: RoleInfo;
        let now = nowMs();
        for (let uid in this.roles) {
            one = this.roles[uid];
            if (one.delTime !== 0 && now > one.delTime) {
                delete this.roles[uid];
            }
        }
    }

    getRoleNum() {
        let num = 0;
        for (let x in this.roles) {
            num++;
        }
        return num;
    }
}