import Card from "./card";
import Config from '../../../common/scripts/lib/config';
import { Util } from "../../../common/scripts/util";
import catchError from "../../../common/scripts/lib/error-handler";
import Game from "../../../common/scripts/game";

const { ccclass, property } = cc._decorator;

const border: number = 80;
const CONFIG_LEN: number = 3;

const COLORS = [
    '#E556F4',
    '#F1C82A',
    '#F25949',
    '#65179C',
    '#45BA0F',
    '#00CFFF',
    '#2C3E50',
    '#D9042B',
    '#1FB170',
    '#2980B9',
    '#FF6425'
    ]
    
    
@ccclass
export default class LetterPair extends Game {

    @property(cc.Prefab)
    cardPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    progressMonitorPrefab: cc.Prefab = null;

    totalPieces: number = 0;
    isInteracting: boolean = false;

    @catchError()
    onLoad() {
        const data = Config.getInstance().data[0]
        cc.log('[shapepair/letterpair] game onLoad', Config.i.game, Config.i.lesson && Config.i.lesson.id, data && data.length);
        const numCards = Math.floor((data.length - 5) / CONFIG_LEN) * 2;
        const allValues = Array(numCards / 2);
        for (let i = 0; i < numCards; i++) {
            const place = Math.floor(Math.random() * numCards);
            let j = place;
            while (allValues[j] != null) {
                j = (j + 1) % numCards;
            }
            allValues[j] = i;
        }
        const boxWidth = (cc.winSize.width - border) / numCards * 2;
        const boxHeight = (cc.winSize.height - border * 2) / 2;
        let prefix = 0;
        const card1Type = data[3]
        const card2Type = data[4]
        for (let index = 0; index < numCards / 2; index++) {
            const color = new cc.Color().fromHEX(COLORS[index])
            const card1 = cc.instantiate(this.cardPrefab);
            card1.name = prefix + '1';
            const cardComp1 = card1.getComponent(Card);
            cardComp1.cardType = card1Type;
            cardComp1.color = color
            cardComp1.cardContent = data[index * CONFIG_LEN + 5];
            cardComp1.audio = data[index * CONFIG_LEN + 7];
            card1.position = new cc.Vec2(
                (boxWidth * (allValues[prefix] % (numCards / 2)) + Math.random() * (boxWidth - border)) - cc.winSize.width / 2 + border,
                (boxHeight * (Math.floor(allValues[prefix] / numCards * 2)) + Math.random() * (boxHeight - border)) - cc.winSize.height / 2 + border);
            const card2 = cc.instantiate(this.cardPrefab);
            card2.name = prefix + '2';
            prefix++;
            const cardComp2 = card2.getComponent(Card);
            cardComp2.cardType = card2Type;
            cardComp2.color = color
            cardComp2.cardContent = data[index * CONFIG_LEN + 6];
            cardComp2.audio = data[index * CONFIG_LEN + 7];
            card2.position = new cc.Vec2(
                (boxWidth * (allValues[prefix] % (numCards / 2)) + Math.random() * (boxWidth - border)) - cc.winSize.width / 2 + border,
                (boxHeight * (Math.floor(allValues[prefix] / numCards * 2)) + Math.random() * (boxHeight - border)) - cc.winSize.height / 2 + border);

            this.node.getChildByName('CardContainer').addChild(card1);
            this.node.getChildByName('CardContainer').addChild(card2);
            prefix++;
            this.totalPieces++;
            if (prefix == 2) {
                Util.showHelp(card1, card2, () => {
                    if (!cc.isValid(this.node) || !this.friend || !cc.isValid(this.friend.node)) {
                        cc.log('[shapepair/letterpair] skip help callback after destroy', Config.i.game, Config.i.lesson && Config.i.lesson.id);
                        return;
                    }

                    new cc.Tween().target(this.friend.node)
                    .to(0.25, {y: -600}, { progress: null, easing: 'sineOut' })  
                    .start()          
                })
            }
        }
        Card.letDrag = true
    }

    protected onDestroy() {
        cc.log('[shapepair/letterpair] game onDestroy', Config.i.game, Config.i.lesson && Config.i.lesson.id, this.totalPieces);
        Card.letDrag = true;
        this.unscheduleAllCallbacks();
        this.stopNodeWork(this.node);
    }

    private stopNodeWork(node: cc.Node) {
        if (!node || !cc.isValid(node)) return;

        node.stopAllActions();
        node.children.forEach((child) => this.stopNodeWork(child));
    }


    drop(isMatch: boolean) {
        cc.log('[shapepair/letterpair] drop', Config.i.game, Config.i.lesson && Config.i.lesson.id, isMatch, this.totalPieces);
        this.isInteracting = false;
        if (isMatch) {
            if (--this.totalPieces <= 0) {
                cc.log('[shapepair/letterpair] complete', Config.i.game, Config.i.lesson && Config.i.lesson.id);
                this.node.emit('nextProblem');
            }
        }
    }

    drag(): boolean {
        if (!this.isInteracting) {
            this.isInteracting = true;
            return true;
        }
        return false;
    }
}
