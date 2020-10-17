import { Application } from "mydog";
import { I_matchRole } from "../svr_match/matchMgr";
import { DicObj } from "../util/util";
import { Room } from "./room";


export class RoomMgr {
    private app: Application;
    private roomId: number = 1;
    private rooms: DicObj<Room> = {};
    constructor(app: Application) {
        this.app = app;
        setInterval(this.update.bind(this), 100);
    }

    newRoom(roles: I_matchRole[]) {
        let id = this.roomId++;
        let room = new Room(this.app, id);
        room.init(roles);
        this.rooms[id] = room;
    }

    getRoom(roomId: number) {
        return this.rooms[roomId];
    }

    delRoom(roomId: number) {
        console.log("删除房间", roomId);
        delete this.rooms[roomId];
    }

    private update() {
        for (let x in this.rooms) {
            this.rooms[x].update(100);
        }
    }
}