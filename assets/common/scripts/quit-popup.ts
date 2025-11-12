import LessonController from "./lessonController";
import Config from "./lib/config";
import { GAME_EXIT, IS_CUBA } from "./lib/constants";
import Profile from "./lib/profile";
import { Util } from "./util";
import UtilLogger from "./util-logger";

const { ccclass, property } = cc._decorator;

@ccclass
export default class QuitPopup extends cc.Component {
  @property(cc.Node)
  inputEventBlocker: cc.Node = null;

  @property(cc.Label)
  exitLabel: cc.Label = null;

  @property(cc.Label)
  videoLabel: cc.Label = null;

  isCuba = Profile.getItem(IS_CUBA);

  onLoad() {
    this.inputEventBlocker.zIndex = 2;
    this.node.zIndex = 3;
    this.exitLabel.string = Util.i18NText("Exit");
    this.videoLabel.string = Util.i18NText("Watch Help Video");
  }

  onClickYesButton() {
    this.node
      .getChildByName("quit_bg")
      .getChildByName("exit_game")
      .getComponent(cc.Button).interactable = false;
    Config.isMicroLink = false;
    if (this.isCuba) {
      const config = Config.getInstance();
      let details = {
        studentId: config.microLinkData.studentid || null,
        studentName: config.microLinkData.studentname || null,
        classId: config.microLinkData.classid || null,
        schoolId: config.microLinkData.schoolid || null,

        mlPartnerId: config.lesson.mlPartnerId || null,
        mlClassId: config.lesson.mlClassId || null,
        mlStudentId: config.lesson.mlStudentId || null,
        // assignmentId: config.lesson.assignmentId || null,
        courseId: config.course.id,
        courseName: config.course.name,
        chapterId: config.chapter.id,
        chapterName: config.chapter.name,
        lessonId: config.lesson.id,
        lessonName: config.lesson.name,
        lessonType: "InComplete",
        timeSpent: config.timeSpent,
        score: -1,
        totalGames: config.totalProblems,
        totalMoves: config.correctMoves + config.wrongMoves,
        correctMoves: config.correctMoves,
        wrongMoves: config.wrongMoves,
        gameCompleted: config.gameCompleted,
        quizCompleted: config.quizCompleted,
        isQuizAnsweredCorrectly: config.isQuizAnsweredCorrectly,
        lessonSessionId: config.lessonSessionId,
        gameTimeSpent: -1, // `-1` repersents Didn't completed the lesson. so here we are giving values -1
        quizTimeSpent: -1,
        gameScore: -1,
        quizScore: -1,
        gameName: config.game,
        currentGameNumber: config.problem,
        // problemSessionId: this.problemSessionId,
        left_game_no: config.problem,
        left_game_name: config.game,
      };
      
      const eventData = {
        source: GAME_EXIT,
        eventName: GAME_EXIT,
        detail: details,
      };
      window.parent.postMessage(eventData, "*");
      console.log("event dispatched", eventData);
      return;
    }
    Config.i.popScene();
    LessonController.getFriend().stopAudio();
  }

  onClickNoButton() {
    this.node.active = false;
    this.inputEventBlocker.active = false;
  }

  onClickHelpButton() {
    this.node
      .getChildByName("quit_bg")
      .getChildByName("help_video")
      .getComponent(cc.Button).interactable = false;
    cc.sys.openURL("https://wa.me/917019270679");
    this.node.active = false;
    this.inputEventBlocker.active = false;
  }

  onEnable() {
    this.inputEventBlocker.active = true;
    cc.director.pause();
    cc.audioEngine.pauseAllEffects();
  }

  onDisable() {
    cc.director.resume();
    cc.audioEngine.resumeAllEffects();
  }
}
