import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import Game from "../../../common/scripts/game";
import Config from "../../../common/scripts/lib/config";
import { catchError } from "../../../common/scripts/lib/error-handler";
import { Util } from "../../../common/scripts/util";
import AddButton from "./add-button";
import RemoveButton from "./remove-button";
import ChimpleRichText from "../../../common/scripts/chimple-richtext";

export interface BlenderConfig {
    level: string;
    workSheet: string;
    problem: string;
    objectNo: string;
    suggestNo: string;
    suggestHundredDigit: string;
    suggestTenthDigit: string;
    suggestZerothDigit: string;

}

export const BLENDER1_NODE = 'blender1_node';
export const BLENDER2_NODE = 'blender2_node';
export const BLENDER3_NODE = 'blender3_node';
export const landhundred = 'landHundred';
export const landOne = 'landOne';
export const landTen = 'landTen';

export const ADD_BUTTON_HUNDRED = 'add_button_hundred';
export const ADD_BUTTON_TEN = 'add_button_ten';
export const ADD_BUTTON_ONE = 'add_button_one';

export const REMOVE_BUTTON_HUNDRED = 'remove_button_hundred';
export const REMOVE_BUTTON_TEN = 'remove_button_ten';
export const REMOVE_BUTTON_ONE = 'remove_button_one';

export const LAYOUT = 'layout';
export const MAX_CHILDREN = 9;
const TEXT_BG = 'text_bg';
const LABEL = 'label';

export const LAND_TEN_SCALE_X = 0.9;
export const LAND_TEN_SCALE_Y = 0.9;
export const LAND_TEN_COLOR = '#00FF2A';
export const LAND_HUNDRED_SCALE = 0.9;
export const LAND_HUNDRED_COLOR = '#EAFF00';
export const LAND_ONE_SCALE_X = 0.8;
export const LAND_ONE_SCALE_Y = 0.8;
export const LAND_ONE_COLOR = '#42F9FF';
export const REMOVED_PLACE_VALUE_ITEM = 'REMOVED_PLACE_VALUE_ITEM';
export const PLAY_FINAL_ANIMATION = 'PLAY_FINAL_ANIMATION';
export const ADDED_PLACE_VALUE_ITEM = 'ADDED_PLACE_VALUE_ITEM';
export const MOVE_IF_NEEDED = 'MOVE_IF_NEEDED';

@ccclass
export default class Blender extends Game {
    @property(cc.Prefab)
    mixturePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    goalPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    landHundredPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    landTenPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    landOnePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    placeLabelPrefab: cc.Prefab = null;

    _currentConfig: BlenderConfig = null;
    _mixture: cc.Node = null;
    _placeValueComponent: Blender = null;
    _hundredTextNode: cc.Node = null;
    _tenTextNode: cc.Node = null;
    _oneTextNode: cc.Node = null;
    _hundredLayoutNode: cc.Node = null;
    _tenLayoutNode: cc.Node = null;
    _oneLayoutNode: cc.Node = null;
    _finalText: number = 0;
    _cup: cc.Node = null;
    _collectStarted: boolean = false;

    _collectedHundred: boolean = false;
    _collectedTenth: boolean = false;
    _collectedOne: boolean = false;

    _landHundredPos: cc.Vec2 = null;
    _landTenPos: cc.Vec2 = null;
    _landOnePos: cc.Vec2 = null;

    zeroT = Util.i18NText('0');

    cupText: string = "<color=#EAFF00><bold>@0<color=#00FF2A><bold>@1</bold></color><color=#42F9FF><bold>@2</bold></color></bold></color>";
    objectives: string[] = [];

    _helpMode: boolean = false;
    _helpNodes: cc.Node[] = [];

    @catchError()
    protected onLoad(): void {
        var manager = cc.director.getCollisionManager();
        // this.node.scaleX = cc.winSize.width / 1024;
        manager.enabled = true;
        // manager.enabledDebugDraw = true;
        // manager.enabledDrawBoundingBox = true;
        this._mixture = cc.instantiate(this.mixturePrefab);
        this._placeValueComponent = this.node.getComponent(Blender);
        this._currentConfig = this.processConfiguration(Config.getInstance().data[0]);
        this.objectives = this._currentConfig.objectNo.split('');
        this.node.on(ADDED_PLACE_VALUE_ITEM, (event) => {
            event.stopPropagation();
            this.moveIfNeeded();
        });
        this.node.on(REMOVED_PLACE_VALUE_ITEM, (event) => {
            event.stopPropagation();
            this.moveIfNeeded();
        });

        this.node.on(PLAY_FINAL_ANIMATION, () => {
            this.playFinishAnimation();
        });
        this._helpMode = true;
        this.createCup();
    }

    playFinishAnimation() {
        if (!this._collectStarted && parseInt(this._currentConfig.objectNo) === this._finalText) {
            this.node.emit('correct');
            this.stopRemoVeFromContainers();
            this.scheduleOnce(
                () => {
                    const anim = this._mixture.getComponent(cc.Animation);
                    if (anim !== null) {
                        anim.stop();
                        anim.on('finished', () => {
                            this.collectNumbers();
                        }, this);
                        anim.play('blending');
                    }
                }, 0
            );
        }
    }

    collectNumbers() {
        if (!this._collectStarted) {
            this._collectStarted = true;
            this.updateToLabel(this._cup, '', '', null, '#654321', false);
            this.moveCupToNext();
        }
    }

    @catchError()
    moveCupToNext() {
        if (!this._collectedHundred) {
            this.moveCupToBlender(this._mixture.getChildByName(BLENDER1_NODE), this._hundredTextNode, '_collectedHundred');
        } else if (!this._collectedTenth) {
            this.moveCupToBlender(this._mixture.getChildByName(BLENDER2_NODE), this._tenTextNode, '_collectedTenth');
        } else if (!this._collectedOne) {
            this.moveCupToBlender(this._mixture.getChildByName(BLENDER3_NODE), this._oneTextNode, '_collectedOne');
        } else {
            this.scheduleOnce(
                () => {
                    const equations = this.formatFinalTextForSpeak(this._finalText);
                    if (!!equations && equations.length > 0) {
                        this.friend.speakEquation(equations, (index) => {
                            if (index + 1 === equations.length) {
                                this._finalText = null;
                                this._collectStarted = false;
                                this.node.emit('nextProblem');
                            }
                        });
                    } else {
                        this.node.emit('nextProblem');
                    }

                }, 0.5
            );
        }
    }

    @catchError()
    private formatFinalTextForSpeak(finalText: number): string[] {
        const hundredDigit = Math.floor(finalText / 100);
        const remainingDigit = String(finalText % 100);
        const andOp = Config.dir === 'en/' ? 'and' : '';

        const equations: string[] = [];
        hundredDigit !== 0 ? equations.push(String(hundredDigit * 100)) : '';
        !!andOp ? equations.push(andOp) : '';
        (remainingDigit.length === 2 && remainingDigit !== '00' ||
            remainingDigit.length === 1 && remainingDigit !== '0') ? equations.push(remainingDigit) : '';
        return equations;
    }

    @catchError()
    moveCupToBlender(blender: cc.Node, textNode: cc.Node, collected: string) {
        const cupPosition = this.node.convertToNodeSpaceAR(blender.convertToWorldSpaceAR(cc.v3(0, 0)));
        new cc.Tween()
            .target(this._cup)
            .to(1, {position: new cc.Vec2(cupPosition.x, this._cup.position.y)}, {
                progress: null,
                easing  : 'quadOut'
            })
            .call(() => {
                var oldWorPos = textNode.convertToWorldSpaceAR(cc.v3(0, 0));
                var newLocPos = this.node.convertToNodeSpaceAR(oldWorPos);
                textNode.removeFromParent(false);
                this.node.addChild(textNode);
                textNode.setPosition(newLocPos);
                new cc.Tween()
                    .target(textNode)
                    .to(1, {
                        position: new cc.Vec2(textNode.position.x,
                            textNode.position.y + 140)
                    }, {
                        progress: null,
                        easing  : 'quadOut'
                    })
                    .to(0.25, {opacity: 0}, null)
                    .call(() => {
                        const animation = this._cup.getComponent(cc.Animation);
                        animation.on('glass_filling', (event) => {
                        });
                        animation.play();
                    })
                    .call(() => {
                        let result = this.labelValue(textNode);
                        let text = [];
                        if (collected === '_collectedHundred') {
                            // text = String(Number(this.objectives[0]) * 100);
                            text.push(String(Number(this.objectives[0])));
                            text.push('100');
                        } else if (collected === '_collectedTenth') {
                            // text = String(Number(this.objectives[1]) * 10);
                            text.push(String(Number(this.objectives[1])));
                            text.push('10');
                        } else if (collected === '_collectedOne') {
                            // text = String(Number(this.objectives[2]) * 1);
                            text.push(String(Number(this.objectives[2])));
                            text.push('1');
                        }

                        this.replaceCupText(this._cup, text, result, () => {
                                this[`${collected}`] = true;
                                this.moveCupToNext();
                            }
                        );
                    })
                    .start();
            })
            .start();
    }

    @catchError()
    labelValue(node: cc.Node) {
        let result = null;
        const placeLabel: cc.Node = node.getChildByName('placeLabel');
        if (placeLabel !== null) {
            const labelNode = placeLabel.getChildByName('label');
            if (labelNode !== null) {
                const labelComponent = labelNode.getComponent(ChimpleRichText);
                result = labelComponent.string.replace(/<\/?[^>]+(>|$)/g, "") || '';
            }
        }
        return result;
    }

    @catchError()
    stopRemoVeFromContainers() {
        const blender1 = this._mixture.getChildByName(BLENDER1_NODE);
        const blender2 = this._mixture.getChildByName(BLENDER2_NODE);
        const blender3 = this._mixture.getChildByName(BLENDER3_NODE);

        [blender1, blender2, blender3].forEach(
            (b, i) => {
                let childName = i == 0 ? ADD_BUTTON_HUNDRED :
                    i == 1 ? ADD_BUTTON_TEN : ADD_BUTTON_ONE;
                let b1 = b.getChildByName(childName);
                let adb = b1.getComponent(AddButton);
                adb.makeInteractable(false);

                childName = i == 0 ? REMOVE_BUTTON_HUNDRED :
                    i == 1 ? REMOVE_BUTTON_TEN : REMOVE_BUTTON_ONE;
                let b2 = b.getChildByName(childName);
                let adb2 = b2.getComponent(RemoveButton);
                adb2.makeInteractable(false);
            }
        );
    }

    @catchError()
    createCup() {
        this._cup = cc.instantiate(this.goalPrefab);
        this.node.addChild(this._cup);

        this._cup.scale = 2.25;
        const texts = String(Number(this._currentConfig.objectNo)).split('')
            .map(
                (c, i) => c !== '0' && String(Number(c) * Math.pow(10, (2 - i)))
            );
        this.replaceCupText(this._cup, [String(Number(this._currentConfig.objectNo))],
            Util.i18NNumberConvert(String(this._currentConfig.objectNo)),
            () => {
                this.moveCup();
            });
    }

    @catchError()
    replaceCupText(node: cc.Node, text: string[], convertedString: string, callBack = Function = null) {
        let tokens: string[] = convertedString.split('');
        let displayText = this.cupText;
        if (tokens.length === 3) {
            for (let i = 0; i <= tokens.length - 1; i++) {
                displayText = displayText.replace('@' + i, tokens[i]);
                if (i === 0) {
                    this.cupText = this.cupText.replace('@' + i, tokens[i]);
                }
            }
        } else if (tokens.length === 2) {
            for (let i = 0; i <= tokens.length - 1; i++) {
                displayText = displayText.replace('@' + (i + 1), tokens[i]);
                if (i === 0) {
                    this.cupText = this.cupText.replace('@' + (i + 1), tokens[i]);
                }
            }

        } else if (tokens.length === 1) {
            for (let i = 0; i <= tokens.length - 1; i++) {
                displayText = displayText.replace('@2', tokens[i]);
                this.cupText = this.cupText.replace('@2', tokens[i]);
            }
        }

        const placeLabel: cc.Node = node.getChildByName('placeLabel');
        if (placeLabel !== null) {
            const labelNode = placeLabel.getChildByName('label');
            if (labelNode !== null) {
                const labelComponent = labelNode.getComponent(ChimpleRichText);
                new cc.Tween()
                    .target(labelNode)
                    .to(0.25, {opacity: 0}, null)
                    .call(() => {
                        labelComponent.string = displayText;
                    })
                    .to(0.25, {opacity: 255}, null)
                    .start();
            }
        }
        try {
            this.friend.speakEquation(text, (index) => {
                if (index + 1 == text.length) {
                    if (!!callBack) {
                        callBack();
                    }
                }
            });
        } catch (e) {
        }
    }

    @catchError()
    private moveCup() {
        new cc.Tween()
            .target(this._cup)
            .parallel(
                new cc.Tween().to(1, {position: new cc.Vec2(100 + -cc.winSize.width * 3 / 8, cc.winSize.height * 5 / 12 + 15)}, null),
                //@ts-ignore
                new cc.Tween().to(1, {scale: 1}, {progress: null, easing: 'backOut'})
            )
            .call(() => {
                const equations = this.formatFinalTextForSpeak(Number(this._currentConfig.objectNo));
                if (!!equations && equations.length > 0) {
                    this.friend.speakEquation(equations, (index) => {
                        if (index + 1 === equations.length) {
                            this.scheduleOnce(
                                () => {
                                    this.buildScene();
                                }, 0.5
                            );
                        }
                    });
                } else {
                    if(this._currentConfig.objectNo === '000' || this._currentConfig.objectNo === '00' || this._currentConfig.objectNo === '0') {
                        this.scheduleOnce(
                            () => {
                                this.buildScene();
                            }, 0.5
                        );
                    }
                }
            })
            .start();

        // this.scheduleOnce(
        //     () => {
        //         this.buildScene();
        //     }, 1
        // );
    }

    @catchError()
    private moveIfNeeded() {
        this.oneLayoutAnimate();
        this.tenLayoutAnimate();
    }

    @catchError()
    private oneLayoutAnimate() {
        const oneCount = this.oneCount();
        if (oneCount > MAX_CHILDREN) {
            this._oneLayoutNode.removeAllChildren(true);
            this.playTenMoveAnimation();
        } else {
            this.updateText();
            if (parseInt(this._currentConfig.objectNo) === this._finalText) {
                this.node.emit(PLAY_FINAL_ANIMATION);
            }

        }
    }

    @catchError()
    private tenLayoutAnimate() {
        const tenCount = this.tenCount();
        if (tenCount > MAX_CHILDREN) {
            this._tenLayoutNode.removeAllChildren(true);
            this.playHundredMoveAnimation();
        } else {
            this.updateText();
            if (parseInt(this._currentConfig.objectNo) === this._finalText) {
                this.node.emit(PLAY_FINAL_ANIMATION);
            }
        }
    }

    @catchError()
    hundredCount() {
        return this._mixture.getChildByName(BLENDER1_NODE).getChildByName(LAYOUT).childrenCount;
    }

    @catchError()
    tenCount() {
        return this._mixture.getChildByName(BLENDER2_NODE).getChildByName(LAYOUT).childrenCount;
    }

    @catchError()
    oneCount() {
        return this._mixture.getChildByName(BLENDER3_NODE).getChildByName(LAYOUT).childrenCount;
    }

    @catchError()
    private updateText() {
        const hundredNumber = this._hundredLayoutNode.childrenCount === 0 ? '000' :
            String(this._hundredLayoutNode.childrenCount * 100);

        this.updateToLabel(this._hundredTextNode, hundredNumber, hundredNumber, null, LAND_HUNDRED_COLOR);

        const tenNumber = this._tenLayoutNode.childrenCount > 9 ? '00' :
            this._tenLayoutNode.childrenCount === 0 ? '00' : String(this._tenLayoutNode.childrenCount * 10);

        this.updateToLabel(this._tenTextNode, tenNumber, tenNumber, null, LAND_TEN_COLOR);

        const oneNumber = String(this._oneLayoutNode.childrenCount * 1);

        this.updateToLabel(this._oneTextNode, oneNumber, oneNumber, null, LAND_ONE_COLOR);

        this._finalText = Number(this._hundredLayoutNode.childrenCount * 100 +
            this._tenLayoutNode.childrenCount * 10 + this._oneLayoutNode.childrenCount * 1);

    }

    @catchError()
    private updateToLabel(node: cc.Node, text: string, displayText: string, formatted: string = null, color: string = null,
                          shouldAlwaysSpeak: boolean = false) {
        const placeLabel: cc.Node = node.getChildByName('placeLabel');
        const speakText: string = text;
        displayText = Util.i18NNumberConvert(displayText);

        if (!!formatted) {
            displayText = formatted;
        } else {
            if (!!color) {
                displayText = `<color=${color}><bold>${displayText}</bold></color>`;
            }
        }
        if (placeLabel !== null) {
            const labelNode = placeLabel.getChildByName('label');
            if (labelNode !== null) {
                const labelComponent = labelNode.getComponent(ChimpleRichText);
                const eStr = labelComponent.string;
                const zeroT = Util.i18NText(this.zeroT);
                const allZeros = speakText.startsWith(zeroT) && speakText.endsWith(zeroT);
                if (!!speakText && !isNaN(Number(speakText))
                    && eStr !== displayText && (!allZeros || shouldAlwaysSpeak)) {
                    try {
                        this.friend.speakEquation([speakText], (index) => {
                        });
                    } catch (e) {
                    }
                }
                if (eStr !== displayText) {
                    new cc.Tween()
                        .target(labelNode)
                        .to(0.25, {opacity: 0}, null)
                        .call(() => {
                            labelComponent.string = displayText;
                        })
                        .to(0.25, {opacity: 255}, null)
                        .start();
                }
            }
        }
    }

    @catchError()
    private buildScene() {
        // set up mixture
        // build suggestions
        // build logic for showing draggable objects
        this._mixture.setPosition(new cc.Vec2(-125, -25));
        this.node.addChild(this._mixture);

        const blender1 = this._mixture.getChildByName(BLENDER1_NODE);
        const blender2 = this._mixture.getChildByName(BLENDER2_NODE);
        const blender3 = this._mixture.getChildByName(BLENDER3_NODE);

        const hundredLabelNode: cc.Node = blender1.getChildByName(LABEL);
        hundredLabelNode.getComponent(cc.Label).string = Util.i18NText('hundreds');
        const tenLabelNode: cc.Node = blender2.getChildByName(LABEL);
        tenLabelNode.getComponent(cc.Label).string = Util.i18NText('tens');
        const oneLabelNode: cc.Node = blender3.getChildByName(LABEL);
        oneLabelNode.getComponent(cc.Label).string = Util.i18NText('ones');

        this._hundredTextNode = blender1.getChildByName(TEXT_BG);
        this._tenTextNode = blender2.getChildByName(TEXT_BG);
        this._oneTextNode = blender3.getChildByName(TEXT_BG);

        this._hundredLayoutNode = blender1.getChildByName(LAYOUT);
        this._tenLayoutNode = blender2.getChildByName(LAYOUT);
        this._oneLayoutNode = blender3.getChildByName(LAYOUT);

        [blender1, blender2, blender3].forEach(
            (b, i) => {
                const childName = i == 0 ? ADD_BUTTON_HUNDRED :
                    i == 1 ? ADD_BUTTON_TEN : ADD_BUTTON_ONE;
                let b1 = b.getChildByName(childName);
                let adb = b1.getComponent(AddButton);
                adb.placeValueNode = this.node;
            }
        );

        const hundredNumber = Number(this._currentConfig.suggestHundredDigit) === 0 ?
            '000' : String(Number(this._currentConfig.suggestHundredDigit) * 100);

        this.buildContainer(
            this._mixture.getChildByName(BLENDER1_NODE),
            hundredNumber,
            Number(this._currentConfig.suggestHundredDigit),
            this.landHundredPrefab,
            landhundred,
            LAND_HUNDRED_SCALE,
            LAND_HUNDRED_SCALE,
            LAND_HUNDRED_COLOR
        );

        const tenNumber = Number(this._currentConfig.suggestTenthDigit) === 0 ?
            '00' : String(Number(this._currentConfig.suggestTenthDigit) * 10);

        this.buildContainer(
            this._mixture.getChildByName(BLENDER2_NODE),
            tenNumber,
            Number(this._currentConfig.suggestTenthDigit),
            this.landTenPrefab,
            landTen,
            LAND_TEN_SCALE_X,
            LAND_TEN_SCALE_Y,
            LAND_TEN_COLOR);

        const oneNumber = Number(this._currentConfig.suggestZerothDigit) === 0 ?
            '0' : String(Number(this._currentConfig.suggestZerothDigit) * 1);

        this.buildContainer(
            this._mixture.getChildByName(BLENDER3_NODE),
            oneNumber,
            Number(this._currentConfig.suggestZerothDigit),
            this.landOnePrefab,
            landOne,
            LAND_ONE_SCALE_X,
            LAND_ONE_SCALE_Y,
            LAND_ONE_COLOR);

        // this.showLandHundred();
        // this.showLandTen();
        // this.showLandOne();
        //
        this.scheduleOnce(
            () => {
                Util.showHelp(null, null)
            }, 0.5
        );
    }

    @catchError()
    private processConfiguration(data: any[] = []): BlenderConfig {
        const configurations: any[] = [].concat(...data);
        let [level, workSheet, problem, objectNo, suggestNo] = configurations;
        objectNo = objectNo.length === 1 ? '00' + objectNo : objectNo.length === 2
            ? '0' + objectNo : objectNo;
        suggestNo = suggestNo.length === 1 ? '00' + suggestNo : suggestNo.length === 2
            ? '0' + suggestNo : suggestNo;

        let [suggestHundredDigit, suggestTenthDigit, suggestZerothDigit] = suggestNo.split('');
        return {
            level, workSheet, problem, objectNo, suggestNo,
            suggestHundredDigit, suggestTenthDigit, suggestZerothDigit
        };
    }

    @catchError() playTenMoveAnimation() {
        const tenNode = this.createFromPrefab(this.landTenPrefab,
            LAND_TEN_SCALE_X,
            LAND_TEN_SCALE_Y
        );

        const blender2 = this._mixture.getChildByName(BLENDER2_NODE);
        const blender3 = this._mixture.getChildByName(BLENDER3_NODE);
        const pos = this.node.convertToNodeSpaceAR(blender3.getPosition());
        tenNode.setPosition(pos.x + blender3.width - 25 + blender2.width / 2, pos.y + blender3.height - 150);
        this.node.addChild(tenNode);

        new cc.Tween()
            .target(tenNode)
            .to(1, {opacity: 255}, null)
            .to(1, {position: new cc.Vec2(tenNode.position.x - blender3.width + 25 - blender2.width / 2, tenNode.position.y)}, {
                progress: null,
                easing  : 'quadOut'
            })
            .call(() => {
                tenNode.active = false;
                tenNode.removeFromParent(true);
                this.scheduleOnce(
                    () => {
                        this.addToTenContainer();
                        this.tenLayoutAnimate();
                    }, 0.5
                );
            })
            .start();
    }

    @catchError() playHundredMoveAnimation() {
        const hundredNode = this.createFromPrefab(this.landHundredPrefab,
            LAND_HUNDRED_SCALE,
            LAND_HUNDRED_SCALE
        );

        const blender1 = this._mixture.getChildByName(BLENDER1_NODE);
        const blender2 = this._mixture.getChildByName(BLENDER2_NODE);
        const pos = this.node.convertToNodeSpaceAR(blender2.getPosition());
        hundredNode.setPosition(pos.x + blender2.width - 25, pos.y + blender2.height - 100);
        this.node.addChild(hundredNode);
        hundredNode.scale = 0.6;

        new cc.Tween()
            .target(hundredNode)
            .to(1, {opacity: 255}, null)
            .to(1, {position: new cc.Vec2(hundredNode.position.x - blender1.width / 2 - 50, hundredNode.position.y)}, {

                progress: null,
                easing  : 'quadOut'
            })
            .call(() => {
                hundredNode.active = false;
                hundredNode.removeFromParent(true);
                this.scheduleOnce(
                    () => {
                        this.addToHundredContainer();
                    }, 0.5
                );
            })
            .start();
    }

    @catchError() addToOneContainer(shouldUpdateText: boolean = true) {
        this.addToContainer(10,
            this._oneLayoutNode,
            this.landOnePrefab,
            LAND_ONE_SCALE_X,
            LAND_ONE_SCALE_Y
        );
    }

    @catchError() addToTenContainer(shouldUpdateText: boolean = true) {
        this.addToContainer(10,
            this._tenLayoutNode,
            this.landTenPrefab,
            LAND_TEN_SCALE_X,
            LAND_TEN_SCALE_Y
        );
        shouldUpdateText ? this.updateText() : '';
    }

    @catchError()
    addToHundredContainer(shouldUpdateText: boolean = true) {
        this.addToContainer(100,
            this._hundredLayoutNode,
            this.landHundredPrefab,
            LAND_HUNDRED_SCALE,
            LAND_HUNDRED_SCALE
        );

        if (shouldUpdateText) {
            this.updateText();
            if (parseInt(this._currentConfig.objectNo) === this._finalText) {
                this.node.emit(PLAY_FINAL_ANIMATION);
            }
        }
    }

    @catchError()
    createFromPrefab(prefab: cc.Prefab, scaleX: number, scaleY: number) {
        const item = cc.instantiate(prefab);
        item.scaleX = scaleX;
        item.scaleY = scaleY;
        item.setPosition(new cc.Vec2(0, 0));
        return item;
    }

    @catchError()
    addToContainer(faceValue: number, node: cc.Node, prefab: cc.Prefab,
                   scaleX: number, scaleY: number, suggestedItem: boolean = false) {
        const item = this.createFromPrefab(prefab, scaleX, scaleY);
        node.addChild(item);
    }

    @catchError()
    private setUpLayout(faceValue: number, node: cc.Node, totalElements: number, prefab: cc.Prefab,
                        scaleX: number, scaleY: number) {
        for (let i = 0; i < totalElements; i++) {
            this.addToContainer(faceValue, node,
                prefab, scaleX, scaleY, true);
        }
    }

    @catchError()
    private createLabel(name: string, color: string = '#ffffff', shrink: boolean = false): cc.Node {
        const labelNode = cc.instantiate(this.placeLabelPrefab);
        const child = labelNode.getChildByName('label');
        const label = child.getComponent(ChimpleRichText);
        name = Util.i18NNumberConvert(name);
        label.string = `<color=${color}><bold>${name}</bold></color>`;
        if (shrink) {
            label.fontSize = 32;
            labelNode.width = child.width;
        }
        return labelNode;
    }

    @catchError()
    private buildContainer(node: cc.Node,
                           labelStr: string,
                           totalElements: number,
                           prefab: cc.Prefab,
                           allowDropName: string,
                           scaleX: number,
                           scaleY: number,
                           fontColor: string) {
        node.getChildByName(TEXT_BG).addChild(this.createLabel(labelStr, fontColor));
        const layout = node.getChildByName(LAYOUT);
        let faceValue = 0;
        switch (allowDropName) {
            case landhundred:
                faceValue = 100;
                break;
            case landTen:
                faceValue = 10;
                break;
            case landOne:
                faceValue = 1;
                break;
        }
        this.setUpLayout(
            faceValue,
            node.getChildByName(LAYOUT),
            totalElements,
            prefab,
            scaleX,
            scaleY
        );
    }
}
