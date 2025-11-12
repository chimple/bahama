import Config from "../../../common/scripts/lib/config";
import { REWARD_TYPES, Util } from "../../scripts/util";
import Achievement from "./achievement";
import Friend from "../../scripts/friend";
import { IS_CUBA, MICROLINK_END_BLANK } from "../../scripts/lib/constants";
import Profile from "../../scripts/lib/profile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Scorecard extends cc.Component {
  @property(cc.Label)
  label: cc.Label = null;

  @property(cc.Sprite)
  star1: cc.Sprite = null;

  @property(cc.Sprite)
  star2: cc.Sprite = null;

  @property(cc.Sprite)
  star3: cc.Sprite = null;

  @property(cc.SpriteFrame)
  active: cc.SpriteFrame = null;

  @property(cc.Node)
  friendPos: cc.Node = null;

  @property(cc.Node)
  rewardPos: cc.Node = null;

  @property
  score: number = 0;

  @property
  text: string = "Lesson";

  @property(cc.Prefab)
  achievementPrefab: cc.Prefab;

  @property(cc.Node)
  continueButton: cc.Node;

  @property(cc.Node)
  downloadButton: cc.Node;

  reward: [string, string];

  isCuba = Profile.getItem(IS_CUBA);

  onLoad() {
    if (!cc.sys.isNative && Config.isMicroLink && !this.isCuba) {
      this.continueButton.active = false;
      if (Config.i.microLinkData.end != MICROLINK_END_BLANK) {
        this.downloadButton.active = true;
        this.downloadButton.parent.getChildByName("web_scorecard_bg").active =
          true;
        this.downloadButton.parent.getChildByName("playstore_label").active =
          true;
      }
    }
    this.label.string = Util.i18NText(this.text);
    if (this.score > 25) this.star1.spriteFrame = this.active;
    if (this.score > 50) this.star2.spriteFrame = this.active;
    if (this.score > 75) this.star3.spriteFrame = this.active;
    Util.loadFriend((friendNode: cc.Node) => {
      const friend = friendNode.getComponent(Friend);
      friend.interactable = false;
      this.friendPos.addChild(friendNode);
      Util.loadAccessoriesAndEquipAcc(friendNode.children[1], friendNode);
      friend.playHappyAnimation(1);
    });
    const scorecardAnim = this.getComponent(cc.Animation);
    scorecardAnim.play("scorecard");
    const continueNode = this.node.getChildByName("commonButton");
    const continueAnime: cc.Animation = continueNode.getComponent(cc.Animation);
    continueAnime.play("continue");
    if (this.reward) {
      if (this.reward[0] == REWARD_TYPES[0]) {
        //animate character
      } else if (this.reward[0] == REWARD_TYPES[1]) {
        cc.resources.load(
          `backgrounds/textures/bg_icons/${this.reward[1]}`,
          cc.SpriteFrame,
          (err, spriteFrame) => {
            if (!err) {
              const sprite = this.rewardPos.addComponent(cc.Sprite);
              // @ts-ignore
              sprite.spriteFrame = spriteFrame;
            }
          }
        );
      } else if (this.reward[0] == REWARD_TYPES[2]) {
        const achievement = cc.instantiate(this.achievementPrefab);
        const achievementComp = achievement.getComponent(Achievement);
        achievementComp.image = Config.i.lesson.image;
        achievementComp.courseId = Config.i.course.id;
        achievementComp.score = this.score;
        this.rewardPos.addChild(achievement);
      } else if (this.reward[0] == REWARD_TYPES[3]) {
        // animate character
      }
    }
  }

  onContinueClick() {
    this.continueButton.getComponent(cc.Button).interactable = false;
    if (this.isCuba) {
      const eventData = {
        source: "gameEnd",
        eventName: "gameEnd",
        detail: {},
      };
      window.parent.postMessage(eventData, "*");
      console.log("event dispatched", eventData);
      return;
    }
    if (cc.sys.isNative && Config.isMicroLink) {
      Config.isMicroLink = false;
      Config.i.pushScene("menu/start/scenes/start", "menu", null, true);
    } else {
      Config.i.popScene();
    }
  }

  onDownloadButtonClick() {
    cc.sys.openURL(
      "https://play.google.com/store/apps/details?id=org.chimple.bahama&hl=en_IN"
    );
  }
}
