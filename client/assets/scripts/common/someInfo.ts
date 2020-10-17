// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export class SomeInfo extends cc.Component {

    @property(cc.Label)
    private msgLabel: cc.Label = null;
    private showCloseBtn: boolean = true;
    private yesCb: Function = null;

    init(info: string, showCloseBtn = true, yesCb?: () => void) {
        this.msgLabel.string = info;
        this.showCloseBtn = showCloseBtn;
        this.yesCb = yesCb;
        if (!showCloseBtn) {
            cc.find("bg2/btn_close", this.node).active = false;
        }
    }

    private btn_close() {
        if (this.showCloseBtn) {
            this.node.destroy();
        }
    }

    private btn_yes() {
        this.node.destroy();
        if (this.yesCb) {
            this.yesCb();
        }
    }
}
