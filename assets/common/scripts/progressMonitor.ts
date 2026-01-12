import Config from "./lib/config";

const { ccclass, property } = cc._decorator;

const currentStarScale: number = 4;

export enum StarType {
    Default,
    Correct,
    Wrong,
    NextPage,
    PrevPage
}


const FRUITS = [
    "rewards/fruits/baag/red_bellpepper",
    "rewards/fruits/baag/yellow_bellpepper",
    "rewards/fruits/baag/carrot",
    "rewards/fruits/baag/popato",
    "rewards/fruits/baag/tomato",
    "rewards/fruits/baag/red_chillie",
    "rewards/fruits/baag/brocolli",
    "rewards/fruits/baag/cucumber",
    "rewards/fruits/baag/green_chillie",
    "rewards/fruits/baag/turnip",
    "rewards/fruits/sehar/omlette",
    "rewards/fruits/sehar/coffee",
    "rewards/fruits/sehar/yogurt",
    "rewards/fruits/sehar/boiled_egg",
    "rewards/fruits/sehar/butter",
    "rewards/fruits/sehar/cheese",
    "rewards/fruits/sehar/porridge",
    "rewards/fruits/sehar/salad",
    "rewards/fruits/sehar/bread_sliced",
    "rewards/fruits/sehar/tea",
    "rewards/fruits/badal/chickoo",
    "rewards/fruits/badal/pineapple",
    "rewards/fruits/badal/mango",
    "rewards/fruits/badal/cherry",
    "rewards/fruits/badal/orange",
    "rewards/fruits/badal/grapes",
    "rewards/fruits/badal/apple",
    "rewards/fruits/badal/pear",
    "rewards/fruits/badal/banana",
    "rewards/fruits/badal/strawberry",
    "rewards/fruits/samundra/prawns",
    "rewards/fruits/samundra/coconut",
    "rewards/fruits/samundra/watermelon",
    "rewards/fruits/samundra/tender_coconut",
    "rewards/fruits/samundra/lemon",
    "rewards/fruits/samundra/orange_juice",
    "rewards/fruits/samundra/kiwi",
    "rewards/fruits/samundra/juice",
    "rewards/fruits/samundra/lemon_wedge",
    "rewards/fruits/samundra/fish",
    "rewards/fruits/barf/salmon",
    "rewards/fruits/barf/bread",
    "rewards/fruits/barf/momos",
    //"rewards/fruits/barf/meat",
    "rewards/fruits/barf/rice",
    "rewards/fruits/barf/sushi",
    //"rewards/fruits/barf/chicken_meat",
    "rewards/fruits/barf/jam",
    "rewards/fruits/barf/dumpling",
    "rewards/fruits/barf/soup",
    "rewards/fruits/sagar/squid",
    "rewards/fruits/sagar/fish_eggs",
    "rewards/fruits/sagar/lobster",
    "rewards/fruits/sagar/cilantro",
    "rewards/fruits/sagar/tuna",
    "rewards/fruits/sagar/garlic",
    "rewards/fruits/sagar/crab",
    "rewards/fruits/sagar/mussel",
    "rewards/fruits/sagar/seaweed",
    "rewards/fruits/sagar/sardine",
    "rewards/fruits/jungle/corn",
    "rewards/fruits/jungle/wheat",
    "rewards/fruits/jungle/honeycomb",
    //"rewards/fruits/jungle/chicken",
    "rewards/fruits/jungle/honey",
    "rewards/fruits/jungle/milk",
    //"rewards/fruits/jungle/meat",
    "rewards/fruits/jungle/cabbage",
    "rewards/fruits/jungle/egg",
    "rewards/fruits/jungle/pumpkin",
    "rewards/fruits/udyaan/coffee_bean",
    "rewards/fruits/udyaan/chestnut",
    "rewards/fruits/udyaan/dango",
    "rewards/fruits/udyaan/peanut",
    "rewards/fruits/udyaan/sausage",
    "rewards/fruits/udyaan/acorn",
    "rewards/fruits/udyaan/sandwich",
    "rewards/fruits/udyaan/cashew",
    "rewards/fruits/udyaan/almond",
    "rewards/fruits/udyaan/roasted_sausage",
    "rewards/fruits/khet/honeydew",
    "rewards/fruits/khet/mushroom",
    "rewards/fruits/khet/raspberry",
    "rewards/fruits/khet/peach",
    "rewards/fruits/khet/black_currant",
    "rewards/fruits/khet/dragonfruit",
    "rewards/fruits/khet/blackberry",
    "rewards/fruits/khet/button_mushroom",
    "rewards/fruits/khet/redcurrant",
    "rewards/fruits/khet/enoki_mushroom",
    "rewards/fruits/registan/grapefruit",
    "rewards/fruits/registan/coco_bean",
    "rewards/fruits/registan/starfruit",
    "rewards/fruits/registan/litchi",
    "rewards/fruits/registan/date",
    "rewards/fruits/registan/mangosteen_sliced",
    "rewards/fruits/registan/mangosteen",
    "rewards/fruits/registan/starfruit_sliced",
    "rewards/fruits/registan/jackfruit",
    "rewards/fruits/registan/dry_coconut"
]

@ccclass
export default class ProgressMonitor extends cc.Component {

    @property(cc.SpriteFrame)
    complete: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    current: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    incomplete: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    correct: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    wrong: cc.SpriteFrame = null;

    @property(cc.Prefab)
    glowPrefab: cc.Prefab = null;

    totalStars: number = 0;
    stopStar: boolean = false
    fruit: cc.SpriteFrame = null

    onLoad() {
        const config = Config.getInstance()
        let fruitPath = FRUITS[Math.floor(Math.random() * FRUITS.length)]

        cc.resources.load(fruitPath, cc.SpriteFrame, (err, spriteFrame) => {
            // @ts-ignore
            if (!err) this.fruit = spriteFrame
        })

        this.totalStars = config.totalProblems;
        for (let index = 1; index <= this.totalStars; index++) {
            const node = new cc.Node();
            node.name = index.toString();
            const spriteNode = new cc.Node();
            spriteNode.name = 'sprite';
            node.addChild(spriteNode);
            const sprite = spriteNode.addComponent(cc.Sprite);
            if (index < config.problem) {
                // sprite.spriteFrame = this.complete;
                // spriteNode.scale = currentStarScale;
            } else if (index == config.problem) {
                sprite.spriteFrame = this.current;
            } else {
                sprite.spriteFrame = this.incomplete;
            }
            node.width = spriteNode.width * 2;
            node.height = spriteNode.height * 2;
            this.node.addChild(node);
        }
    }

    updateProgress(current: number, starType: StarType, callback: Function) {
        if (starType == StarType.NextPage) {
            const nowNode = this.node.getChildByName((current).toString());
            const nowSpriteNode = nowNode.getChildByName('sprite');
            nowSpriteNode.getComponent(cc.Sprite).spriteFrame = this.complete;
            if (current < this.totalStars) {
                const nowNode = this.node.getChildByName((current + 1).toString());
                const nowSpriteNode = nowNode.getChildByName('sprite');
                nowSpriteNode.getComponent(cc.Sprite).spriteFrame = this.current;
            }
            callback()
        } else if (starType == StarType.PrevPage) {
            const nowNode = this.node.getChildByName((current).toString());
            const nowSpriteNode = nowNode.getChildByName('sprite');
            nowSpriteNode.getComponent(cc.Sprite).spriteFrame = this.incomplete;
            if (current > 1) {
                const nowNode = this.node.getChildByName((current - 1).toString());
                const nowSpriteNode = nowNode.getChildByName('sprite');
                nowSpriteNode.getComponent(cc.Sprite).spriteFrame = this.current;
            }
            callback()
        } else {
            const newNode = new cc.Node();
            const glow = cc.instantiate(this.glowPrefab)
            const anim = glow.getComponent(cc.Animation)
            newNode.addChild(glow)
            glow.active = false
            const spriteNode = new cc.Node()
            spriteNode.name = 'sprite'
            const sprite = spriteNode.addComponent(cc.Sprite);
            switch (starType) {
                case StarType.Default:
                    sprite.spriteFrame = this.fruit
                    break;
                case StarType.Correct:
                    sprite.spriteFrame = this.correct
                    break;
                case StarType.Wrong:
                    sprite.spriteFrame = this.wrong
                    break;
                default:
                    break;
            }
            newNode.name = current.toString();
            newNode.scale = 1 / currentStarScale;
            newNode.addChild(spriteNode)
            const currentNode = this.node.getChildByName(current.toString());
            if (currentNode != null) {
                const currentSpriteNode = currentNode.getChildByName('sprite');
                if (currentSpriteNode != null) {
                    const currentPos = cc.v2(cc.winSize.width * Math.random() - cc.winSize.width / 2, -cc.winSize.height - 100)
                    newNode.setPosition(currentPos);
                    const newPos = cc.v2(cc.winSize.width / 2 * Math.random() - cc.winSize.width / 4, -cc.winSize.height / 2)
                    currentNode.addChild(newNode);
                    newNode.runAction(cc.sequence(
                        cc.spawn(cc.scaleTo(0.5, 1),
                            cc.bezierTo(0.5, [
                                cc.v2(currentPos.add(newPos).mul(0.33).add(cc.v2(200, 0))),
                                cc.v2(currentPos.add(newPos).mul(0.33).add(cc.v2(100, 0))),
                                newPos
                            ])
                        ),
                        cc.callFunc(() => {
                            glow.active = true
                            anim.on('finished', () => {
                                glow.active = false
                            })
                            anim.play()
                        }),
                        cc.delayTime(0.75),
                        cc.spawn(
                            cc.moveTo(0.5, currentSpriteNode.position),
                            cc.scaleTo(0.5, 1 / currentStarScale)
                        ),
                        cc.callFunc(() => {
                            glow.active = false
                        }),
                        cc.callFunc(() => {
                            currentSpriteNode.removeFromParent();
                            if (current < this.totalStars) {
                                const nowNode = this.node.getChildByName((current + 1).toString());
                                const nowSpriteNode = nowNode.getChildByName('sprite');
                                nowSpriteNode.getComponent(cc.Sprite).spriteFrame = this.current;
                            }
                            callback()
                        })
                    ))
                }
            }
        }
    }
}
