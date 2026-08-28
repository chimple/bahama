import {Util} from "../../../common/scripts/util";
import LetterPair from "./letterpair";
import ChimpleLabel from "../../../common/scripts/chimple-label";
import CountingLayout from "../../../common/scripts/countingLayout";
import LessonController from "../../../common/scripts/lessonController";
import Config from "../../../common/scripts/lib/config";

const {ccclass, property} = cc._decorator;

const FRUITS = [
    'items/fruit/peach',
    'items/fruit/xigua',
    'items/fruit/avacado',
    'items/fruit/pineapple',
    'items/fruit/mango',
    'items/fruit/dragonfruit',
    'items/fruit/nuts',
    'items/fruit/watermelon',
    'items/fruit/cherry',
    'items/fruit/orange',
    'items/fruit/grapes',
    'items/fruit/apple',
    'items/fruit/lemon',
    'items/fruit/banana',
    'items/fruit/acorn',
    'items/fruit/strawberry',
    'items/fruit/guava',
    'items/fruit/kiwi',
    'items/vegetable/potato',
    'items/vegetable/corn',
    'items/vegetable/capsicum',
    'items/vegetable/carrot',
    'items/vegetable/onion',
    'items/vegetable/tomato',
    'items/vegetable/chilly',
    'items/vegetable/garlic',
    'items/vegetable/peas',
    'items/vegetable/brinjal',
    'items/vegetable/spinach',
    'items/vegetable/cabbage',
    'items/vegetable/pumpkin',
    'items/vegetable/radish',
    'items/vegetable/broccoli'
]

@ccclass
export default class Card extends cc.Component {

    @property(cc.Prefab)
    cardParticle: cc.Prefab = null;

    @property(cc.Prefab)
    explodeParticle: cc.Prefab = null;

    @property(cc.Prefab)
    countingLayout: cc.Prefab = null;

    @property({
        type: cc.AudioClip
    })
    pickupAudio: cc.AudioClip = null;

    @property({
        type: cc.AudioClip
    })
    correctAudio: cc.AudioClip = null;

    @property(cc.AudioClip)
    wordAudio: cc.AudioClip = null

    @property(cc.Prefab)
    square: cc.Prefab = null

    @property(cc.Prefab)
    rectangle: cc.Prefab = null

    @property(cc.Prefab)
    block: cc.Prefab = null

    pairCard: Card = null;
    particleNode: cc.Node = null;
    cardType: string = null;
    cardContent: string = null;
    audio: string = null;
    color: cc.Color = null
    isInteracting: boolean = false;

    static letDrag: boolean = true


    // LIFE-CYCLE CALLBACKS:

    private isAlive(): boolean {
        return cc.isValid(this.node);
    }

    private isPairAlive(): boolean {
        return this.isAlive() && this.pairCard != null && cc.isValid(this.pairCard.node);
    }

    private getMatch(): LetterPair {
        if (!this.isAlive() || !this.node.parent || !this.node.parent.parent) return null;

        return this.node.parent.parent.getComponent(LetterPair);
    }

    private getFriend(): any {
        const friend = LessonController.getFriend();
        return friend && friend.node && cc.isValid(friend.node) ? friend : null;
    }

    private getFriendNode(): cc.Node {
        const friend = this.getFriend();
        return friend ? friend.node : null;
    }

    onLoad() {
        this.node.on('touchstart', this.onTouchStart, this);
        this.node.on('touchend', this.onTouchEnd, this);
        this.node.on('touchcancel', this.onTouchEnd, this);
        this.node.on('touchmove', this.onTouchMove, this);

        var bgBack: cc.Node = null
        var bgFront: cc.Node = null
        const giftBox = Config.i.course.type == 'maths' ? cc.instantiate(this.rectangle) : cc.instantiate(this.square)
        bgBack = giftBox.getChildByName('giftbox')
        bgFront = giftBox.getChildByName('giftboxwhite')
        this.node.addChild(giftBox)
        if (this.cardType == 'image' || this.cardType == 'rotate') {
            Util.loadTexture(this.cardContent, (texture) => {
                if (!texture || !this.isAlive()) return;

                const spriteNode = new cc.Node('frontSprite');
                const sprite = spriteNode.addComponent(cc.Sprite);
                sprite.spriteFrame = new cc.SpriteFrame(texture);
                if (this.cardType == 'rotate') {
                    spriteNode.angle = 90;
                }
                // spriteNode.scale = 0.9;
                this.node.addChild(spriteNode);
                Util.resizeSprite(sprite, 120, 120)
            });
        } else if (this.cardType == 'dice') {
            cc.resources.load('items/' + this.cardContent, cc.SpriteFrame, (err, spriteFrame) => {
                if (!err && spriteFrame && this.isAlive()) {
                    const spriteNode = new cc.Node('frontSprite');
                    const sprite = spriteNode.addComponent(cc.Sprite);
                    // @ts-ignore
                    sprite.spriteFrame = spriteFrame
                    spriteNode.scale = 0.9;
                    this.node.addChild(spriteNode);

                }
            });
        } else if (this.cardType == 'number' || this.cardType == 'stick') {
            const image = this.cardType == 'number' ? FRUITS[Math.floor(Math.random() * FRUITS.length)] : 'items/shake/stick'
            cc.resources.load(image, cc.SpriteFrame, (err, spriteFrame) => {
                if (!err && spriteFrame && this.isAlive()) {
                    const clNode = cc.instantiate(this.countingLayout);
                    const cl = clNode.getComponent(CountingLayout);
                    cl.fullCount = parseInt(this.cardContent);
                    cl.scale = 0.4
                    // @ts-ignore
                    cl.fullTexture = spriteFrame
                    // if (this.cardType == 'stick') {
                    //     const layout = cl.getComponent(cc.Layout)
                    //     layout.paddingLeft = 50
                    //     layout.paddingRight = 50
                    // }
                    this.node.addChild(clNode)
                }
            })
            if (this.audio.length == 0) {
                Util.loadNumericSound(this.cardContent, (clip) => {
                    if (clip && this.isPairAlive()) {
                        this.wordAudio = clip
                        this.pairCard.wordAudio = clip
                    }
                })
            }
        } else {
            const labelNode = new cc.Node('label');
            labelNode.height = this.node.height * 0.5
            labelNode.width = this.node.width * 0.8
            const label = labelNode.addComponent(ChimpleLabel);
            label.string = this.cardContent;
            label.horizontalAlign = cc.Label.HorizontalAlign.CENTER
            label.overflow = cc.Label.Overflow.SHRINK
            label.enableWrapText = false
            labelNode.color = this.color;
            label.fontSize = 128;
            label.lineHeight = 150;
            labelNode.position = new cc.Vec3(0, 128 * 0.1); // to align text with middle since in bigger font size it aligns down
            this.node.addChild(labelNode);
            if (this.audio.length == 0) {
                if (isNaN(parseInt(this.cardContent))) {
                    Util.loadsLetter(this.cardContent.toLowerCase(), (clip) => {
                        if (this.isAlive()) this.wordAudio = clip
                    })
                } else {
                    Util.loadNumericSound(this.cardContent, (clip) => {
                        if (this.isAlive()) this.wordAudio = clip
                    })
                }
            }
        }
        if ((Config.i.course.type == 'maths' && this.cardType == 'image')
            || this.cardType == 'dice') {
            bgFront.color = this.color
        } else {
            bgBack.color = this.color
        }
        if (this.audio.length > 0) {
            Util.loadGameSound(this.audio, (clip) => {
                if (this.isAlive()) this.wordAudio = clip
            })
        }
    }

    start() {
        const lastChar = this.node.name.charAt(this.node.name.length - 1);
        const toMatchName = this.node.name.substr(0, this.node.name.length - 1) + (lastChar == '1' ? '2' : '1');
        const pairNode = this.node.parent && this.node.parent.getChildByName(toMatchName);
        this.pairCard = pairNode ? pairNode.getComponent(Card) : null;
    }

    onDestroy() {
        this.unregisterTouch()
        this.unscheduleAllCallbacks()
        this.stopNodeWork(this.node)
        Card.letDrag = true
        this.isInteracting = false
    }

    private stopNodeWork(node: cc.Node) {
        if (!node || !cc.isValid(node)) return;

        node.stopAllActions();
        node.children.forEach((child) => this.stopNodeWork(child));
    }

    unregisterTouch() {
        this.node.off('touchstart', this.onTouchStart, this);
        this.node.off('touchend', this.onTouchEnd, this);
        this.node.off('touchcancel', this.onTouchEnd, this);
        this.node.off('touchmove', this.onTouchMove, this);
    }

    onTouchStart(touch: cc.Touch) {
        if (Card.letDrag && this.isPairAlive()) {
            Card.letDrag = false
            this.isInteracting = true;
            this.node.zIndex = 3
            Util.playSfx(this.pickupAudio);
            this.node.setSiblingIndex(this.node.parent.childrenCount - 1);
            new cc.Tween().target(this.node).to(0.25, {scale: 1.1}, {progress: null, easing: 'sineOut'}).start();
        }
    }

    onTouchMove(touch: cc.Touch) {
        if (this.isInteracting && this.isPairAlive()) {
            // @ts-ignore
            this.node.setPosition(this.node.position.add(touch.getDelta()));
            if (this.node.getBoundingBoxToWorld().intersects(this.pairCard.node.getBoundingBoxToWorld())) {
                this.sparkle();
                if (this.particleNode != null) {
                    this.pairCard.node.setSiblingIndex(this.node.parent.childrenCount - 2);
                    new cc.Tween().target(this.pairCard.node).to(0.25, {scale: 1.1}, {
                        progress: null,
                        easing: 'elasticOut'
                    }).start();
                    this.pairCard.node.zIndex = 2
                    this.pairCard.sparkle();
                }
            } else {
                this.unSparkle();
                new cc.Tween().target(this.pairCard.node).to(0.25, {scale: 1}, {
                    progress: null,
                    easing: 'elasticOut'
                }).start();
                this.pairCard.node.zIndex = 0
                this.pairCard.unSparkle();
            }
        }
    }

    onTouchEnd(touch: cc.Touch) {
        if (this.isInteracting && this.isPairAlive()) {
            if (this.particleNode != null) {
                const friendNode = this.getFriendNode();
                if (!friendNode) return;

                const blockNode = cc.instantiate(this.block)
                const blockWidget = blockNode.getComponent(cc.Widget)
                if (blockWidget != null) {
                    blockWidget.target = cc.director.getScene()
                }
                this.node.parent.addChild(blockNode)
                blockNode.opacity = 224
                blockNode.zIndex = 1
                new cc.Tween().target(friendNode)
                    .to(0.25, {y: 0}, {progress: null, easing: 'sineOut'})
                    .call(() => {
                        const match = this.getMatch();
                        if (!match) return;

                        match.node.emit('correct');
                    })
                    .delay(1)
                    .to(0.25, {y: -600}, {progress: null, easing: 'sineOut'})
                    .start()
                this.unregisterTouch()
                this.unSparkle();
                new cc.Tween().target(this.node)
                    .to(0.25, {position: this.pairCard.node.position, scale: 1}, {progress: null, easing: 'elasticOut'})
                    .delay(0.5)
                    .call(() => {
                        const friend = this.getFriend();
                        if (!friend || this.wordAudio == null) return;

                        friend.speak(this.wordAudio);
                    })
                    .to(0.5, {position: cc.v2(-this.node.width / 2 - 20, 0)}, null)
                    .delay(0.5)
                    .call(() => {
                        if (!this.isPairAlive()) return;

                        const explode = cc.instantiate(this.explodeParticle);
                        explode.position = this.node.position;
                        this.node.parent.addChild(explode);
                        const match = this.getMatch();
                        if (!match) return;

                        match.scheduleOnce(() => {
                            if (!this.isPairAlive()) return;

                            if (cc.isValid(blockNode)) blockNode.destroy()
                            Card.letDrag = true
                            this.isInteracting = false
                            match.drop(true);
                            this.pairCard.node.destroy()
                            this.node.destroy()
                        }, 0.25);
                        match.scheduleOnce(() => {
                            if (cc.isValid(explode)) explode.destroy();
                        }, 0.5);
                    })
                    .start();
                this.pairCard.unSparkle();
                new cc.Tween().target(this.pairCard.node)
                    .to(0.25, {scale: 1}, {progress: null, easing: 'elasticOut'})
                    .delay(0.5)
                    .to(0.5, {position: cc.v2(this.node.width / 2 + 20, 0)}, null)
                    .delay(0.5)
                    .call(() => {
                        if (!this.isPairAlive()) return;

                        const explode = cc.instantiate(this.explodeParticle);
                        explode.position = this.pairCard.node.position;
                        this.node.parent.addChild(explode);
                        const match = this.getMatch();
                        if (!match) return;

                        match.scheduleOnce(() => {
                            if (cc.isValid(explode)) explode.destroy();
                        }, 0.5);
                    })
                    .start();
            } else {
                const friendNode = this.getFriendNode();
                if (!friendNode) return;

                new cc.Tween().target(friendNode)
                    .to(0.25, {y: 0}, {progress: null, easing: 'sineOut'})
                    .call(() => {
                        const match = this.getMatch();
                        if (!match) return;

                        match.node.emit('wrong');
                    })
                    .delay(1)
                    .to(0.25, {y: -600}, {progress: null, easing: 'sineOut'})
                    .start()
                new cc.Tween().target(this.node)
                    .to(0.25, {
                        scale: 1, position: this.node.position.clampf(
                            // @ts-ignore
                            new cc.Vec2(this.node.width - cc.winSize.width, this.node.height - cc.winSize.height).mul(0.5),
                            new cc.Vec2(cc.winSize.width - this.node.width, cc.winSize.height - this.node.height).mul(0.5)
                        )
                    }, {progress: null, easing: 'sineOut'})
                    .call(() => {
                        if (!this.isPairAlive()) return;

                        const match = this.getMatch();
                        if (!match) return;

                        Card.letDrag = true
                        this.isInteracting = false
                        this.node.zIndex = 0
                        this.pairCard.node.zIndex = 0
                        match.drop(false);
                    })
                    .start();
                this.node.parent.children.forEach((element: cc.Node) => {
                    if (!cc.isValid(element)) return;

                    if (element != this.node && element.getBoundingBox().intersects(this.node.getBoundingBox())) {
                        let inter = new cc.Rect();
                        element.getBoundingBox().intersection(inter, this.node.getBoundingBox());
                        const mag = new cc.Vec2(inter.width / element.getBoundingBox().width, inter.height / element.getBoundingBox().height);
                        // @ts-ignore
                        const pos = element.position.add(element.position.sub(this.node.position).scale(mag).mul(2)).clampf(
                            // @ts-ignore
                            new cc.Vec2(element.getBoundingBox().width - cc.winSize.width, element.getBoundingBox().height - cc.winSize.height).mul(0.5),
                            new cc.Vec2(cc.winSize.width - element.getBoundingBox().width, cc.winSize.height - element.getBoundingBox().height).mul(0.5)
                        );
                        new cc.Tween().target(element).to(0.5, {position: pos}, {
                            progress: null,
                            easing: 'quadOut'
                        }).start();
                    }
                });
            }
        }
    }

    sparkle() {
        if (this.isAlive() && this.particleNode == null) {
            this.particleNode = cc.instantiate(this.cardParticle);
            this.node.addChild(this.particleNode, 1, 'particle');
        }
    }

    unSparkle() {
        if (this.isAlive() && this.particleNode != null) {
            this.node.removeChild(this.particleNode);
            this.particleNode = null;
        }
    }
}
