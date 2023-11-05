import { Application } from "mydog";
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
        setInterval(this.check_delRole.bind(this), 1 * 3600 * 1000);
    }

    /**
     * 玩家登录游戏
     * @param uid 
     */
    async enterServer(uid: number, sid: string, token: number): Promise<I_roleAllInfoClient> {
        let role = this.roles[uid];
        if (!role) {
            const allInfo = await this.loginUtil.getAllRoleInfo(uid);
            if (this.roles[uid]) {
                return { code: -1 } as any;
            }
            role = new RoleInfo(this.app, allInfo);
            this.roles[uid] = role;
            role.roleMem.token = token;
            return role.entryServerLogic(sid);
        }
        console.log('信息已存在', role.sid);
        if (role.sid) {
            let data = { "uid": uid, "info": "您的账号在别处登陆" };
            await this.app.rpc(role.sid).connector.main.kickUserNotTellInfoSvr(data);
            role.offline();
            role.roleMem.token = token;
            return role.entryServerLogic(sid);
        } else {
            role.roleMem.token = token;
            return role.entryServerLogic(sid);
        }
    }

    /**
     * 重连
     */
    async reconnectEntry(uid: number, sid: string, token: number) {
        let role = this.roles[uid];
        if (!role) {
            return { "code": 1 } as any;
        }
        if (role.roleMem.token !== token) {
            return { "code": 2 } as any;
        }
        if (role.sid) {
            let data = { "uid": uid, "info": "您的账号在别处登陆" };
            await this.app.rpc(role.sid).connector.main.kickUserNotTellInfoSvr(data);
            role.offline();
            return role.entryServerLogic(sid);
        } else {
            return role.entryServerLogic(sid);
        }
    }

    getRole(uid: number) {
        return this.roles[uid];
    }


    toSqlRoles(role: RoleInfo) {
        this.updateSqlRoles.add(role);
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