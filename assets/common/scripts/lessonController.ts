import { Queue } from "../../queue";
import Friend from "./friend";
import Game from "./game";
import Config, { DEFAULT_FONT, Lang, LANG_CONFIGS } from "./lib/config";
import {
  BUNDLE_URL,
  CURRENT_CLASS_ID,
  CURRENT_SCHOOL_ID,
  CURRENT_SECTION_ID,
  CURRENT_STUDENT_ID,
  CURRENT_SUBJECT_ID,
  EXAM,
  IS_CUBA,
  Mode,
} from "./lib/constants";
import { Lesson } from "./lib/convert";
import { GAME_CONFIGS } from "./lib/gameConfigs";
import Profile, { CURRENTMODE, LANGUAGE, User } from "./lib/profile";
import ProgressMonitor, { StarType } from "./progressMonitor";
import { QUIZ_ANSWERED } from "./quiz-monitor";
import { Util } from "./util";
import UtilLogger from "./util-logger";
import Scorecard from "../scorecard/scripts/scorecard";
import { APIMode, ServiceConfig } from "./services/ServiceConfig";
import { ParseNetwork, RequestParams } from "./services/ParseNetwork";
import {
  WEBCLASS_HISTORICAL_PROGRESS_URL_PROD,
  WEBCLASS_HISTORICAL_PROGRESS_URL_TEST,
} from "./domain/parseConstants";
import { FirebaseApi } from "./services/FirebaseApi";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LessonController extends cc.Component {
  @property(cc.Prefab)
  progressMonitor: cc.Prefab = null;

  @property(cc.AudioClip)
  correctAudio: cc.AudioClip = null;

  @property(cc.AudioClip)
  wrongAudio: cc.AudioClip = null;

  @property(cc.AudioClip)
  startAudio: cc.AudioClip = null;

  @property(cc.Prefab)
  scorecardPrefab: cc.Prefab = null;

  @property(cc.Prefab)
  blockPrefab: cc.Prefab = null;

  @property(cc.Node)
  gameParent: cc.Node = null;

  @property(cc.Node)
  loading: cc.Node = null;

  @property(cc.Node)
  backButton: cc.Node = null;

  progressMonitorNode: cc.Node = null;
  gameNode: cc.Node = null;
  wrongMoves: number = 0;
  rightMoves: number = 0;
  callback: () => boolean;
  nest: cc.Node = null;
  quizScore: number = 0;
  totalQuizzes: number = 0;
  isQuizAnsweredCorrectly: boolean = false;
  lessonStartTime: number = 0;
  lessonSessionId: string = null;
  problemSessionId: string = null;
  problemStartTime: number = new Date().getTime();
  quizStartTime: number = 0;
  problemTime: number = 0;
  isGameCompleted: boolean = false;
  isQuizCompleted: boolean = false;
  isQuiz: boolean = false;
  gameTime: number = 0;
  quizTime: number = 0;
  quizScores: number[] = [];
  tempWrongMoves: number = 0;

  static bundles: cc.AssetManager.Bundle[] = [];
  static friend: Friend = null;
  static gamePrefab: cc.Prefab;
  isCuba = Profile.getItem(IS_CUBA);

  onLoad() {
    this.loading.width = cc.winSize.width;
    this.loading.zIndex = 10;
    this.progressMonitorNode = cc.instantiate(this.progressMonitor);
    this.progressMonitorNode.zIndex = 2;
    this.node.addChild(this.progressMonitorNode);
    this.node.addChild(LessonController.friend.node);
    Util.loadAccessoriesAndEquipAcc(
      LessonController.friend.node.children[1],
      LessonController.friend.node
    );
    LessonController.friend.node.removeFromParent();
    this.lessonStart();
    if (Config.isMicroLink && !this.isCuba) {
      this.backButton.active = false;
    } else {
      this.backButton.on("touchend", () => {
        this.node.getChildByName("quit").active = true;
        if (
          parseInt(Profile.getValue(CURRENTMODE)) == Mode.School ||
          this.isCuba
        ) {
          this.node
            .getChildByName("quit")
            .getChildByName("quit_bg")
            .getChildByName("exit_game").y = this.node
            .getChildByName("quit")
            .getPosition().y;
          this.node
            .getChildByName("quit")
            .getChildByName("quit_bg")
            .getChildByName("help_video").active = false;
        }
      });
    }
  }

  static preloadLesson(node: cc.Node, callback: Function) {
    LessonController.bundles.forEach((bundle) => {
      cc.log("Releasing bundle: " + bundle.name);
      bundle.releaseAll();
    });
    LessonController.bundles.length = 0;
    const config = Config.i;
    config.problem = 0;
    // if (config.lesson.id == config.course.id + '_PreQuiz') {
    //     const quizChapter = config.course.chapters.find((c) => c.id == config.course.id + '_quiz')
    //     if (quizChapter) {
    //         LessonController.loadQuizzes(quizChapter.lessons, callback, node, 3);
    //     } else {
    //         const lessons: Array<Lesson> = []
    //         const sample = Math.floor(config.course.chapters.length / 5)
    //         for (let index = 0; index < config.course.chapters.length; index += sample) {
    //             lessons.push(config.course.chapters[index].lessons[0])
    //         }
    //         LessonController.loadQuizzes(lessons, callback, node, 2);
    //     }
    // } else if (config.lesson.type == EXAM) {
    if (config.lesson.type == EXAM) {
      const lessons: Array<Lesson> = [];
      var found = false;
      config.chapter.lessons.forEach((les) => {
        if (!found) {
          if (les.type != EXAM) {
            lessons.push(les);
          } else if (les.type == EXAM) {
            if (les.id == config.lesson.id) {
              found = true;
            } else {
              lessons.length = 0;
            }
          }
        }
      });
      LessonController.loadQuizzes(lessons, callback, node);
    } else {
      Config.loadBundle(
        config.lesson.orig_lesson_id || config.lesson.id,
        (bundle) => {
          LessonController.preloadAndFirst(bundle, callback);
        },
        callback
      );
    }
  }

  private static preloadAndFirst(bundle: any, callback: Function) {
    bundle.preloadDir("res", null, null, (err: Error, items) => {
      Util.bundles.set(
        Config.i.lesson.orig_lesson_id || Config.i.lesson.id,
        bundle
      );
      LessonController.bundles.push(bundle);
      LessonController.loadDataAndFirstGame(callback);
    });
  }

  private static loadDataAndFirstGame(
    callback: Function,
    node: cc.Node = null,
    lessons: Lesson[] = null,
    maxPerLesson: number = 0
  ) {
    const config = Config.i;
    config.loadLessonJson(
      (data: Array<string>) => {
        config.data = [data];
        this.preloadGame((prefab: cc.Prefab) => {
          this.gamePrefab = prefab;
          Util.loadFriend((friendNode: cc.Node) => {
            LessonController.friend = friendNode.getComponent(Friend);
            callback();
          });
        });
      },
      node,
      lessons,
      maxPerLesson
    );
  }

  private static loadQuizzes(
    lessons: Lesson[],
    callback: Function,
    node: cc.Node,
    maxPerLesson: number = 0
  ) {
    let numLessons = lessons.length;
    lessons.forEach((les) => {
      Config.loadBundle(
        les.orig_lesson_id || les.id,
        (bundle) => {
          bundle.preloadDir("res", null, null, (err: Error, items) => {
            Util.bundles.set(les.orig_lesson_id || les.id, bundle);
            LessonController.bundles.push(bundle);
            numLessons--;
          });
        },
        callback
      );
    });
    const checkAllLoaded = () => {
      if (numLessons <= 0) {
        cc.director.getScheduler().unschedule(checkAllLoaded, node);
        LessonController.loadDataAndFirstGame(
          callback,
          node,
          lessons,
          maxPerLesson
        );
      }
    };
    cc.director.getScheduler().schedule(checkAllLoaded, node, 1);
  }

  static preloadGame(callback: Function) {
    const config = Config.i;
    cc.log("in preload", config.data);
    config.game = config.data[0][0];
    config.currentGameLessonId =
      config.lesson.orig_lesson_id || config.lesson.id;
    const gameConfig = GAME_CONFIGS[config.game];
    let fontName: string = config.course.id.split("-")[0] + "-" + DEFAULT_FONT;
    if (gameConfig.fontName != null) {
      let splits = gameConfig.fontName.split("-");
      if (splits && splits.length === 2) {
        const prefixFont = config.course.lang;
        const suffixFont = splits[1];
        fontName = prefixFont + "-" + suffixFont;
      }
    }

    if (!Config.i.hasLoadedTextFont(fontName)) {
      Config.i.loadFontDynamically(fontName, () => {
        cc.log("Loading font for game ...", fontName);
        cc.assetManager.loadBundle(gameConfig.bundle, (err, bundle) => {
          bundle.load(gameConfig.prefab, cc.Prefab, (err, prefab) => {
            callback(prefab);
          });
        });
      });
    } else {
      cc.assetManager.loadBundle(gameConfig.bundle, (err, bundle) => {
        bundle.load(gameConfig.prefab, cc.Prefab, (err, prefab) => {
          callback(prefab);
        });
      });
    }
  }

  private lessonStart() {
    this.lessonStartTime = new Date().getTime();
    this.lessonSessionId = User.createUUID();
    this.startGame(LessonController.gamePrefab);
    this.loading.active = false;
  }

  private problemStart(replaceScene: boolean) {
    const config = Config.getInstance();
    this.problemStartTime = new Date().getTime();
    this.problemSessionId = User.createUUID();
    this.isQuiz =
      config.game.toLowerCase().includes("quizmaths") ||
      config.game.toLowerCase().includes("quizliteracy");

    if (this.isQuiz && this.quizStartTime <= 0) {
      this.quizStartTime = new Date().getTime();
      // this.quizTime = this.quizTime + this.quizStartTime;
    }
    if (replaceScene) {
      LessonController.preloadGame((prefab: cc.Prefab) => {
        LessonController.friend.extraClip = null;
        LessonController.friend.node.removeFromParent();
        LessonController.friend.isFace = false;
        this.startGame(prefab);
        this.loading.active = false;
      });
    } else {
      if (this.gameNode != null) this.gameNode.emit("nextIteration");
      this.loading.active = false;
    }
  }

  private startGame(prefab: cc.Prefab) {
    const newGameNode = cc.instantiate(prefab);
    const gameComponent = newGameNode.getComponent(Game);
    if (gameComponent) {
      if (!gameComponent.friendPos) {
        gameComponent.friendPos = new cc.Node();
        gameComponent.friendPos.position = cc.v3(-512, -384);
        gameComponent.node.addChild(gameComponent.friendPos);
      }
      gameComponent.friend = LessonController.friend;
      gameComponent.friend.node.position = cc.Vec3.ZERO;
      gameComponent.friendPos.addChild(LessonController.friend.node);
      LessonController.friend.helpFile = `games/${Config.i.game}`;
      LessonController.friend.playIdleAnimation(1);
    }
    if (this.gameNode != null) this.gameNode.removeFromParent();
    this.gameNode = newGameNode;
    this.gameParent.addChild(this.gameNode);
    // if(gameComponent) Util.loadAccessoriesAndEquipAcc(this.friend.node.children[1], this.friend.node)
    const gameConfig = GAME_CONFIGS[Config.i.game];
    if (gameConfig.center) {
      this.gameNode.x = -512;
      this.gameNode.y = -384;
    } else {
      this.gameNode.x = 0;
      this.gameNode.y = 0;
    }
    this.setupEventHandlers();
  }

  private problemEnd(replaceScene: boolean, forward: boolean = true) {
    const config = Config.i;
    const gameConfig = GAME_CONFIGS[config.game];
    if (!!gameConfig && !!gameConfig.fontName) {
      config.releaseFont(config.currentFontName);
    }

    const timeSpent = Math.ceil(
      (new Date().getTime() - this.problemStartTime) / 1000
    );
    const monitor = this.progressMonitorNode.getComponent(ProgressMonitor);
    const currentProblem = config.problem;
    this.isQuiz =
      config.game.toLowerCase().includes("quizmaths") ||
      config.game.toLowerCase().includes("quizliteracy");
    this.isQuizCompleted = this.isQuiz ? true : false;
    this.isGameCompleted = this.isQuiz && !this.isGameCompleted ? false : true;
    let quizTimeSpent = Math.ceil(
      (new Date().getTime() - this.quizStartTime) / 1000
    );
    console.log(
      "this.quizStartTime in problemEnd",
      this.isQuiz,
      quizTimeSpent,
      new Date().getTime(),
      this.quizStartTime,
      new Date().getTime() - this.quizStartTime,
      (new Date().getTime() - this.quizStartTime) / 1000,
      Math.ceil((new Date().getTime() - this.quizStartTime) / 1000)
    );
    if (this.isQuiz) {
      // if (this.quizStartTime <= 0) {
      // }
      //   this.quizStartTime = new Date().getTime();
      this.totalQuizzes++;
      this.quizScores.push(this.isQuizAnsweredCorrectly ? 1 : 0);
    }
    const isStory = config.game == "story";
    if (cc.sys.localStorage.getItem(CURRENT_STUDENT_ID)) {
      let monitorInfo = {
        chapter: config.chapter.id,
        lesson: config.lesson.id,
        incorrect: this.wrongMoves,
        totalQuestions: config.totalProblems,
        correct: this.rightMoves,
        totalChallenges: config.totalProblems,
        totalSeconds: timeSpent,
        quizStartTime: this.quizStartTime,
        activity: config.game,
        kind: "Monitor",
        schoolId: cc.sys.localStorage.getItem(CURRENT_SCHOOL_ID),
        studentId: cc.sys.localStorage.getItem(CURRENT_STUDENT_ID),
        classId: cc.sys.localStorage.getItem(CURRENT_CLASS_ID),
      };
      Queue.getInstance().push(monitorInfo);
    }

    const eventName: string = "problemEnd";
    const event = {
      studentId: config.microLinkData.studentid || null,
      studentName: config.microLinkData.studentname || null,
      classId: config.microLinkData.classid || null,
      schoolId: config.microLinkData.schoolid || null,

      mlPartnerId: config.lesson.mlPartnerId || null,
      mlClassId: config.lesson.mlClassId || null,
      mlStudentId: config.lesson.mlStudentId || null,
      assignmentId: config.lesson.assignmentId || null,
      courseId: config.course.id,
      courseName: config.course.name,
      chapterId: config.chapter.id,
      chapterName: config.chapter.name,
      lessonId: config.lesson.id,
      lessonName: config.lesson.name,
      lessonType: "InComplete",
      timeSpent: Math.abs(timeSpent),
      totalGames: config.totalProblems,
      totalMoves: this.rightMoves + this.wrongMoves,
      correctMoves: this.rightMoves,
      wrongMoves: this.wrongMoves,
      gameCompleted: this.isGameCompleted,
      quizCompleted: this.isQuizCompleted,
      isQuizAnsweredCorrectly: this.isQuizAnsweredCorrectly ? 1 : 0,
      lessonSessionId: this.lessonSessionId,
    };

    //Set Lesson Result to config Class
    config.totalMoves = this.rightMoves + this.wrongMoves;
    config.correctMoves = this.rightMoves;
    config.wrongMoves = this.wrongMoves;
    config.gameCompleted = this.isGameCompleted;
    config.quizCompleted = this.isQuizCompleted;
    config.isQuizAnsweredCorrectly = this.isQuizAnsweredCorrectly;
    config.lessonSessionId = this.lessonSessionId;
    config.timeSpent = timeSpent;

    const isCuba = Profile.getItem(IS_CUBA);

    if (isCuba) {
      const eventData = {
        source: eventName,
        eventName: eventName,
        detail: event,
      };
      window.parent.postMessage(eventData, "*");

      console.log(`${eventName} message sent via postMessage`, eventData);
    }
    if (!isCuba) {
      console.log(eventName, " Event Logged ", isCuba, !isCuba, !!isCuba);

      UtilLogger.logChimpleEvent(eventName, event);
      console.log("problemEnd event dispatched", event);
    }
    if (!Config.isMicroLink) {
      const deviceId = UtilLogger.currentDeviceId();
      const logEventForIxo = {
        lessonSessionId: this.lessonSessionId,
        gameName: config.game,
        totalGames: config.totalProblems,
        currentGameNumber: config.problem,
        problemSessionId: this.problemSessionId,
        chapterName: config.chapter.name,
        chapterId: config.chapter.id,
        lessonName: config.lesson.name,
        lessonId: config.lesson.id,
        courseName: config.course.id,
        problemNo: config.problem,
        timeSpent: Math.abs(timeSpent),
        userId: User?.getCurrentUser()?.id,
        deviceId: deviceId,
      };
      const headerCSV = Object.keys(logEventForIxo).join(",");
      const eventCSV = Object.values(logEventForIxo).join(",");
      UtilLogger.logToDaily(deviceId, headerCSV, eventCSV);
    }

    const starType = this.isQuiz
      ? this.isQuizAnsweredCorrectly
        ? StarType.Correct
        : StarType.Wrong
      : isStory
      ? forward
        ? StarType.NextPage
        : StarType.PrevPage
      : StarType.Default;
    monitor.updateProgress(currentProblem, starType, () => {
      LessonController.getFriend().stopAudio();
      monitor.stopStar = false;
      if (
        (forward && currentProblem < config.totalProblems) ||
        (!forward && currentProblem > 1)
      ) {
        this.loading.active = true;
        forward ? config.nextProblem() : config.prevProblem();
        this.problemStart(replaceScene);
      } else {
        this.lessonEnd();
      }
    });
  }

  private async lessonEnd() {
    Util.playSfx(this.startAudio);
    const config = Config.getInstance();
    let timeSpent = Math.ceil(
      (new Date().getTime() - this.lessonStartTime) / 1000
    );
    if (Math.abs(timeSpent) > 1200) {
      timeSpent = 1200;
    }
    let quizTimeSpent = -1;
    if (this.quizStartTime > 0) {
      quizTimeSpent = Math.ceil(
        (new Date().getTime() - this.quizStartTime) / 1000
      );
    }
    let gameTimeSpent = timeSpent - quizTimeSpent;

    let score: number = Math.round(
      this.totalQuizzes > 0
        ? (this.quizScore / this.totalQuizzes) * 70 +
            (this.rightMoves / (this.rightMoves + this.wrongMoves)) * 30
        : (this.rightMoves / (this.rightMoves + this.wrongMoves)) * 100
    );

    console.log("gameTimeSpent & quizTimeSpent ", gameTimeSpent, quizTimeSpent);

    const quizScore = Math.round((this.quizScore / this.totalQuizzes) * 100);

    console.log(
      "gamescore =this.quizScore / this.totalQuizzes",
      this.rightMoves,
      this.wrongMoves,
      this.rightMoves + this.wrongMoves,
      this.rightMoves / (this.rightMoves + this.wrongMoves),
      (this.rightMoves / (this.rightMoves + this.wrongMoves)) * 100
    );

    const gameScore = Math.round(
      (this.rightMoves / (this.rightMoves + this.wrongMoves)) * 100
    );

    console.log("Gamescore and quizscore ", gameScore, quizScore);

    if (isNaN(score)) score = 0;
    const isCuba = Profile.getItem(IS_CUBA);

    //Set Lesson Result to config Class
    config.totalMoves = this.rightMoves + this.wrongMoves;
    config.correctMoves = this.rightMoves;
    config.wrongMoves = this.wrongMoves;
    config.gameCompleted = this.isGameCompleted;
    config.quizCompleted = this.isQuizCompleted;
    config.isQuizAnsweredCorrectly = this.isQuizAnsweredCorrectly;
    config.lessonSessionId = this.lessonSessionId;
    config.timeSpent = timeSpent;
    config.score = score;

    if (isCuba) {
      const detail = {
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
        lessonType: "completed",
        timeSpent: Math.abs(timeSpent),
        score: score,
        totalGames: config.totalProblems,
        totalMoves: this.rightMoves + this.wrongMoves,
        correctMoves: this.rightMoves,
        wrongMoves: this.wrongMoves,
        gameCompleted: this.isGameCompleted,
        quizCompleted: this.isQuizCompleted,
        isQuizAnsweredCorrectly: this.isQuizAnsweredCorrectly ? 1 : 0,
        lessonSessionId: this.lessonSessionId,
        gameTimeSpent: Math.abs(gameTimeSpent),
        quizTimeSpent: Math.abs(quizTimeSpent),
        gameScore: gameScore,
        quizScore: isNaN(quizScore) ? -1 : quizScore,
        gameName: null,
        currentGameNumber: null,
        // problemSessionId: this.problemSessionId,
      };
      // if (config.lesson.id == config.course.id + "_PreQuiz") {
      //   detail["preQuizChapterId"] = UtilLogger.getChapterIdForPrequiz(
      //     this.quizScores
      //   );
      // }
      const eventData = {
        source: "lessonEnd",
        eventName: "lessonEnd",
        detail: detail,
      };
      window.parent.postMessage(eventData, "*");
      console.log("event dispatched", eventData);
      // return;
    }

    if (!isCuba) {
      console.log("lessonEnd Event Logged ", isCuba, !isCuba, !!isCuba);
      UtilLogger.logChimpleEvent("lessonEnd", {
        studentId: config.microLinkData.studentid || null,
        studentName: config.microLinkData.studentname || null,
        classId: config.microLinkData.classid || null,
        schoolId: config.microLinkData.schoolid || null,

        lessonSessionId: this.lessonSessionId,
        chapterName: config.chapter.name,
        chapterId: config.chapter.id,
        lessonName: config.lesson.name,
        lessonId: config.lesson.id,
        courseName: config.course.id,
        lessonType: config.lesson.type,
        score: score,
        timeSpent: Math.abs(timeSpent),
        skills:
          config.lesson.skills && config.lesson.skills.length > 0
            ? config.lesson.skills.join(",")
            : "",
        attempts: undefined,
        assignmentId: config.lesson.assignmentId,
        mlStudentId: config.lesson.mlStudentId,
        mlClassId: config.lesson.mlClassId,
        mlPartnerId: config.lesson.mlPartnerId,
      });
    }

    try {
      if (
        config.microLinkData.webclass === "true" &&
        config.lesson.assignmentId != null
      ) {
        cc.log("config.microLinkData.isprod ", config.microLinkData.test);
        cc.log("config.microLinkData.isprod ", config.microLinkData);
        const requestParams: RequestParams = {
          url:
            config.microLinkData.test == "true"
              ? WEBCLASS_HISTORICAL_PROGRESS_URL_TEST
              : WEBCLASS_HISTORICAL_PROGRESS_URL_PROD,
          body: {
            lessonId: config.lesson.id,
            chapterId: config.chapter.id,
            lessonName: config.lesson.name,
            chapterName: config.chapter.name,
            assignmentId: config.lesson.assignmentId,
            score: score,
            sectionId: config.lesson.mlClassId,
            subjectCode: config.course.id,
          },
        };
        await ParseNetwork.getInstance().post(
          requestParams,
          FirebaseApi.getInstance().getAuthHeader()
        );
      }
    } catch (error) {
      cc.log(
        "WEBCLASS_HISTORICAL_PROGRESS_URL Lamda function failed to call:",
        error
      );
    }

    const gameConfig = GAME_CONFIGS[config.game];
    if (!!gameConfig && !!gameConfig.fontName) {
      config.releaseFont(config.currentFontName);
    }
    config.game = null;

    console.log("isCuba ", isCuba, !isCuba, !!isCuba);
    if (isCuba) {
      console.log("no scorecard", isCuba, !!isCuba);
      const eventData = {
        source: "gameEnd",
        eventName: "gameEnd",
        detail: {},
      };
      window.parent.postMessage(eventData, "*");
      console.log("line no 580 returning to cuba ", eventData);
      return;
    } else {
      console.log("went scorecard", isCuba);

      const user = User.getCurrentUser();
      var reward: [string, string];
      if (user) {
        reward = user.updateLessonProgress(
          config.lesson.id,
          score,
          this.quizScores,
          config.lesson.assignmentId
        );
        let finishedLessons = 0;
        let percentageComplete = 0;
        if (
          config.chapter &&
          config.chapter.lessons &&
          config.chapter.lessons.length > 0
        ) {
          config.chapter.lessons.forEach((lesson: Lesson) => {
            user.lessonProgressMap.has(lesson.id) ? finishedLessons++ : "";
          });
          percentageComplete = finishedLessons / config.chapter.lessons.length;
        }

        switch (ServiceConfig.getI().mode) {
          case APIMode.FIREBASE:
            let updateInfo = {
              lessonName: config.lesson.name,
              chapterName: config.chapter.name,
              chapter: config.chapter.id,
              lesson: config.lesson.id,
              courseName: config.course.id,
              percentComplete: percentageComplete,
              timespent: Math.abs(timeSpent),
              assignmentId: config.lesson.assignmentId,
              assessment: score,
              kind: "Progress",
              studentId: User.getCurrentUser().id,
              dateTimeStamp: new Date().getTime(),
            };
            let mode = parseInt(Profile.getValue(CURRENTMODE));
            if (mode === Mode.School || mode === Mode.HomeConnect) {
              if (mode === Mode.School || user.isConnected) {
                UtilLogger.historyProgress(
                  updateInfo.chapter,
                  updateInfo.chapterName,
                  updateInfo.lesson,
                  updateInfo.lessonName,
                  User.getCurrentUser().id,
                  User.getCurrentUser().schoolId,
                  User.getCurrentUser().sectionId,
                  updateInfo.courseName,
                  "" + updateInfo.assessment,
                  config.lesson.assignmentId,
                  User.getCurrentUser().name,
                  timeSpent.toString()
                );
              }
            } else {
              Queue.getInstance().push(updateInfo);
            }
            break;
          case APIMode.PARSE:
            if (cc.sys.localStorage.getItem(CURRENT_STUDENT_ID)) {
              let updateInfo = {
                chapter: config.chapter.id,
                lesson: config.lesson.id,
                courseName: config.course.id,
                percentComplete: percentageComplete,
                timespent: Math.abs(timeSpent),
                assessment: score,
                kind: "Progress",
                schoolId: cc.sys.localStorage.getItem(CURRENT_SCHOOL_ID),
                studentId: cc.sys.localStorage.getItem(CURRENT_STUDENT_ID),
                sectionId: cc.sys.localStorage.getItem(CURRENT_SECTION_ID),
                subjectId: cc.sys.localStorage.getItem(CURRENT_SUBJECT_ID),
              };

              Queue.getInstance().push(updateInfo);
            }
            break;
        }
      }

      const block = cc.instantiate(this.blockPrefab);
      this.node.addChild(block);
      // LessonController.getFriend().stopAudio()
      const scorecard = cc.instantiate(this.scorecardPrefab);
      const scorecardComp = scorecard.getComponent(Scorecard);
      scorecardComp.score = score;
      scorecardComp.text = config.lesson.name;
      scorecardComp.reward = reward;
      if (Config.isMicroLink && !cc.sys.isNative && !isCuba) {
        scorecardComp.continueButton.active = false;
      }
      LessonController.friend.node.removeFromParent();
      // scorecardComp.friendPos.addChild(this.friend.node)
      // LessonController.friend.playAnimation('joy', 1)
      this.node.addChild(scorecard);
    }
  }

  private setupEventHandlers() {
    const iconHighlightAnimation = this.backButton.getComponent(cc.Animation);
    this.gameNode.on("nextProblem", (replaceScene: boolean = true) => {
      this.problemEnd(replaceScene, true);
    });
    this.gameNode.on("prevProblem", (replaceScene: boolean = true) => {
      this.problemEnd(replaceScene, false);
    });
    this.gameNode.on("correct", () => {
      this.rightMoves++;
      this.tempWrongMoves = 0;
      iconHighlightAnimation.stop("icon_highlight");
      LessonController.friend.speak(this.correctAudio, null, true, "happy");
      // Util.playSfx(this.correctAudio);
      // LessonController.friend.playHappyAnimation(1)
    });
    this.gameNode.on("wrong", () => {
      this.wrongMoves++;
      this.tempWrongMoves++;
      if (this.tempWrongMoves > 1) {
        iconHighlightAnimation.play("icon_highlight");
      }
      LessonController.friend.speak(this.wrongAudio, null, true, "sad");
      // Util.playSfx(this.wrongAudio);
      // LessonController.friend.playSadAnimation(1)
    });
    this.gameNode.on(QUIZ_ANSWERED, (isAnsweredCorrectly: boolean) => {
      if (isAnsweredCorrectly) {
        cc.log("QUIZ_ANSWERED correctly");
        this.isQuizAnsweredCorrectly = true;
        this.quizScore++;
      } else {
        cc.log("QUIZ_ANSWERED wrongly");
        this.isQuizAnsweredCorrectly = false;
      }
    });
  }

  protected onDisable() {
    if (!this.isQuizCompleted && !this.isGameCompleted) {
      const timeSpent = Math.ceil(
        (new Date().getTime() - this.problemStartTime) / 1000
      );
      const eventName: string = this.isQuiz
        ? "quizIncomplete"
        : "gameIncomplete";
      const config = Config.i;
      if (!this.isCuba) {
        console.log(
          eventName,
          " Event Logged ",
          this.isCuba,
          !this.isCuba,
          !!this.isCuba
        );
        UtilLogger.logChimpleEvent(eventName, {
          studentId: config.microLinkData.studentid || null,
          studentName: config.microLinkData.studentname || null,
          classId: config.microLinkData.classid || null,
          schoolId: config.microLinkData.schoolid || null,

          gameName: config.game,
          totalGames: config.totalProblems,
          currentGameNumber: config.problem,
          lessonSessionId: this.lessonSessionId,
          problemSessionId: this.problemSessionId,
          chapterName: config.chapter.name,
          chapterId: config.chapter.id,
          lessonName: config.lesson.name,
          lessonId: config.lesson.id,
          courseName: config.course.id,
          problemNo: config.problem,
          timeSpent: Math.abs(timeSpent),
          wrongMoves: this.wrongMoves,
          correctMoves: this.rightMoves,
          skills:
            config.lesson.skills && config.lesson.skills.length > 0
              ? config.lesson.skills.join(",")
              : "",
          mlStudentId: config.lesson.mlStudentId,
          mlClassId: config.lesson.mlClassId,
          mlPartnerId: config.lesson.mlPartnerId,
          assignmentId: config.lesson.assignmentId,
          game_completed: this.isGameCompleted,
          quiz_completed: this.isQuizCompleted,
        });
      }
    }
  }

  public static getFriend(): Friend {
    // const lessonNode = cc.Canvas.instance.node
    // const lessonComp = lessonNode.getComponent(LessonController)
    // return lessonComp.friend
    return LessonController.friend;
  }

  onClickHelpVideoButton() {
    UtilLogger.launchYoutube(GAME_CONFIGS[Config.i.game].youtube);
  }
}
