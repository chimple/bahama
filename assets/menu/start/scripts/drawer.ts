import { User, CourseProgress } from "../../../common/scripts/lib/profile";
import Config from "../../../common/scripts/lib/config";
import { Util } from "../../../common/scripts/util";
import HeaderButton from "../../../common/scripts/headerButton";
import Header from "../../../common/scripts/header";

const { ccclass, property } = cc._decorator;

const DRAWER_ICON_COLORS = {
    'en': '#FFBC00',
    'maths': '#42C0FF',
    'hi': '#009158',
    'kn': '#BD1F32',
    'mr': '#BD1F32',
    'puzzle': '#FF5500',
    'test-lit': '#FFBC00',
    'test-maths': '#42C0FF'
}

@ccclass
export default class Drawer extends cc.Component {
    @property(cc.Node)
    courseLayout: cc.Node = null;

    @property(cc.Prefab)
    drawerButtonPrefab: cc.Prefab = null

    @property(cc.Node)
    block: cc.Node = null

    @property(cc.Node)
    left: cc.Node = null

    onCourseClick: Function
    onHomeClick: Function
    onRightClick: Function
    private selectedHeaderButton: HeaderButton

    onLoad() {
        const config = Config.i
        this.left.x = - cc.winSize.width / 2

        User.getCurrentUser().courseProgressMap.forEach((val: CourseProgress, courseId: string) => {
            const drawerButton = cc.instantiate(this.drawerButtonPrefab)
            const drawerButtonComp = drawerButton.getComponent(HeaderButton)
            const course = config.curriculum.get(courseId)
            if (config.course.id != course.id) {
                this.courseLayout.addChild(drawerButton)
                drawerButtonComp.label.string = Util.i18NText(course.name)
            }
            const color = DRAWER_ICON_COLORS[courseId]
            if (color) drawerButtonComp.selected.node.color = new cc.Color().fromHEX(color)
            Util.load(courseId + '/course/res/icons/' + courseId + '.png', (err: Error, texture) => {
                drawerButtonComp.sprite.spriteFrame = err ? null : new cc.SpriteFrame(texture);
            })
            drawerButtonComp.button.node.on('touchend', (event: cc.Event) => {
                if (event.target.getComponent(cc.Button).enabled) {
                    if (config.course.id == course.id) {
                        config.pushScene('menu/start/scenes/courseChapters', 'menu')
                    } else {
                        config.course = course;
                        Config.loadScene('menu/start/scenes/start', 'menu')
                    }
                }
            })
            if (!Header.homeSelected && config.course && config.course.id == course.id) {
                this.selectHeaderButton(drawerButtonComp);
            }
        })

        this.node.width = cc.winSize.width
        const spacing = Math.max(0, (this.courseLayout.width - (this.courseLayout.childrenCount * this.courseLayout.children[0].width)) / (this.courseLayout.childrenCount + 1))
        this.courseLayout.getComponent(cc.Layout).spacingX = spacing
        this.courseLayout.getComponent(cc.Layout).paddingLeft = spacing
        this.courseLayout.getComponent(cc.Layout).paddingRight = spacing
    }

    selectHeaderButton(newButton: HeaderButton) {
        if (this.selectedHeaderButton != null) {
            this.selectedHeaderButton.selected.node.active = false
            this.selectedHeaderButton.button.enabled = true
        }
        newButton.selected.node.active = true
        newButton.button.enabled = false
        this.selectedHeaderButton = newButton
    }

    onEnable() {
        this.block.active = true
        this.block.on('touchend', () => {
            this.closeDrawer()
        })
        new cc.Tween().target(this.left)
            .to(0.5, { x: - cc.winSize.width / 2 + 320 }, { progress: null, easing: 'cubicInOut' })
            .start()
    }

    closeDrawer() {
        new cc.Tween().target(this.left)
            .to(0.5, { x: - cc.winSize.width / 2 }, { progress: null, easing: 'cubicInOut' })
            .call(() => {
                this.node.active = false
            })
            .start()
    }
}
