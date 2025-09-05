import { Util, MicroLink } from "../util";
import UtilLogger from "../util-logger";
import { Chapter, Course, Lesson } from "./convert";
import Profile, { LANGUAGE, LessonProgress, User } from "./profile";
import TTFFont = cc.TTFFont;
import { GAME_CONFIGS } from "./gameConfigs";
import { BUNDLE_URL, IS_CUBA } from "./constants";
import { Capacitor } from "@capacitor/core";

export const DEFAULT_FONT = "main";
export const STORY = "story";
export const COURSES = [
  "en",
  "en-maths",
  "hi",
  "hi-maths",
  "ur",
  "ur-maths",
  "mr",
];
export const COURSES_LANG_ID = ["en", "hi", "maths", "kn", "mr"];

export enum Flow {
  Default,
  Platformer,
  Debug,
  Open,
}

export enum StartAction {
  Start,
  MoveLessonPlan,
  LessonComplete,
  Default,
}

export const BG_NAME = "bgRoot";
export const BRIDGE_NAME = "bridge";
export const QUIZ_LITERACY = "quizliteracy";
export const QUIZ_MATHS = "quizmaths";
export const ASSIGNMENT_COURSE_ID = "assignment";

export enum Direction {
  LTR,
  RTL,
}

const RTL_COURSES = ["ur", "ur-maths"];

export enum Lang {
  ENGLISH = "en",
  HINDI = "hi",
  KANNADA = "kn",
  PUZZLE = "puzzle",
  MARATHI = 'mr',
}

export const ALL_LANGS = [Lang.ENGLISH, Lang.HINDI, Lang.KANNADA];

export class LangConfig {
  font: string;
  displayName: string;
  symbol: string;
  colorCode: string;
}

export const LANG_CONFIGS = new Map<Lang, LangConfig>([
  [
    Lang.ENGLISH,
    {
      font: "en-main",
      displayName: "English",
      symbol: "A",
      colorCode: "#FFBC00",
    },
  ],
  [
    Lang.HINDI,
    {
      font: "hi-main",
      displayName: "हिन्दी",
      symbol: "अ",
      colorCode: "#3E99E7",
    },
  ],
  [
    Lang.KANNADA,
    {
      font: "kn-main",
      displayName: "ಕನ್ನಡ",
      symbol: "ಕ",
      colorCode: "#6E4596",
    },
  ],
  [
    Lang.PUZZLE,
    {
      font: "en-main",
      displayName: "Puzzle",
      symbol: "A",
      colorCode: "#FFBC00",
    },
  ],
  [
    Lang.MARATHI,
    {
      font: "mr-main",
      displayName: "Marathi",
      symbol: "अ",
      colorCode: "#FFBC00",
    },
  ],
]);

export class World {
  scene: string;
  mapPrefab: string;
  armature: string;

  constructor(scene: string, mapPrefab: string, armature: string) {
    this.scene = scene;
    this.mapPrefab = mapPrefab;
    this.armature = armature;
  }
}

export const WORLDS = [
  new World("platform/scenes/assemble", "forestMapPrefab", "tiger"),
  new World("platform/scenes/cityAssemble", "cityMapPrefab", "dog"),
  new World("platform/scenes/desertAssemble", "desertMapPrefab", "camel"),
  new World("platform/scenes/gardenAssemble", "gardenMapPrefab", "rabbit"),
  new World("platform/scenes/seaAssemble", "seaMapPrefab", "koala"),
  new World("platform/scenes/skyAssemble", "skyMapPrefab", "horse"),
  new World("platform/scenes/snowAssemble", "snowMapPrefab", "bear"),
  new World("platform/scenes/beachAssemble", "beachMapPrefab", "hippo"),
  new World("platform/scenes/playgroundAssemble", "playgroundMapPrefab", "cat"),
  new World("platform/scenes/farmAssemble", "farmMapPrefab", "duck"),
];

class SceneDef {
  scene: string;
  bundle: string;

  constructor(scene: string, bundle: string) {
    this.scene = scene;
    this.bundle = bundle;
  }
}

export default class Config {
  private static instance: Config;

  private _scenes: Array<SceneDef> = [];
  private _textFontMap = new Map();
  private _lessonData;

  course: Course;
  lesson: Lesson;
  chapter: Chapter;
  game: string;
  problem: number;
  totalProblems: number;
  data: Array<Array<string>>;
  currentFontName: string;
  curriculum: Map<string, Course> = new Map();
  allLessons: Map<string, Lesson> = new Map();
  currentGameLessonId: string;
  //currently used in story remove later
  gameLevelName: string;
  worksheet: number;
  startAction: StartAction = StartAction.Default;
  assignments: any[];
  featuredLessons: any[];
  stickerBook: any[];
  static isMicroLink: boolean;
  microLinkData: MicroLink;
  prevCourse: Course;
  prevChapter: Chapter;
  startCourse: Course;

  //Current Lesson Result
  totalMoves: number;
  correctMoves: number;
  wrongMoves: number;
  gameCompleted: boolean;
  quizCompleted: boolean;
  isQuizAnsweredCorrectly: boolean;
  lessonSessionId: string;
  timeSpent: number;
  score: number;

  //remove later
  flow: Flow;

  private constructor() {}

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
      Config.instance.gameLevelName = "1";
      Config.instance.worksheet = 1;
      Config.instance.problem = 1;
      Config.instance.totalProblems = 1;
      Config.instance.flow = Flow.Default;
      Config.instance._textFontMap = new Map();
      Config.instance.currentFontName = DEFAULT_FONT;
    }
    return Config.instance;
  }

  static get i(): Config {
    return Config.getInstance();
  }

  static get dir(): string {
    return Config.getInstance().course.id + "/";
  }

  static get wide(): boolean {
    return Config.getInstance().course.id == "kn";
  }

  clear() {
    this.course = null;
    this.chapter = null;
    this.lesson = null;
  }

  get direction(): Direction {
    // return this.course == null ? Direction.RTL : RTL_COURSES.indexOf(this.course.id) != -1 ? Direction.RTL : Direction.LTR;
    return Direction.LTR;
  }

  setRewardChapter(chapterName: String) {
    // if (this.course.id != 'reward') {
    //     this.prevCourse = this.course
    //     this.prevChapter = this.chapter
    // }
    this.course = this.curriculum.get("reward");
    this.chapter = this.course.chapters.find((c) => c.id == chapterName);
  }

  unsetRewardChapter() {
    // if (this.course.id == 'reward') {
    //     this.course = this.prevCourse
    //     this.chapter = this.prevChapter
    // }
  }

  hasTracing(): boolean {
    return this._lessonData.rows.some((arr) => arr[0].startsWith("write"));
  }

  addTextFont(fontName: string, newVal: cc.Font) {
    this._textFontMap.set(fontName, newVal);
  }

  hasLoadedTextFont(fontName: string) {
    const f: TTFFont = this._textFontMap.get(fontName);
    const isValid = this._textFontMap.has(fontName) && f && f.isValid;
    return isValid;
  }

  hadLoadedTraceFont(): string {
    let traceFont: string = null;
    Array.from(this._textFontMap, ([key, value]) => {
      if (key.indexOf("trace") !== -1) {
        traceFont = key;
      }
    });

    return traceFont;
  }

  getTextFont(fontName: string) {
    // cc.log("fonts loaded:" + Array.from(this._textFontMap.keys()))
    return this._textFontMap.get(fontName);
  }

  get textFontMap() {
    return this._textFontMap;
  }

  getAssignmentLessonsTodo(): Lesson[] {
    return !!this.assignments
      ? this.assignments
          .filter((ass) => {
            const lesson = Config.i.allLessons.get(ass.lessonId);
            const lessonProgress: LessonProgress =
              User.getCurrentUser().lessonProgressMap.get(ass.lessonId);
            return (
              !!lesson &&
              (!lessonProgress ||
                ![]
                  .concat(lessonProgress.assignmentIds)
                  .includes(ass.assignmentId))
            );
          })
          .map((ass) => {
            const lesson = Config.i.allLessons.get(ass.lessonId);
            const newLesson = { ...lesson };
            newLesson.assignmentId = ass.assignmentId;
            newLesson.name = !!ass.lessonName ? ass.lessonName : lesson.name;
            return newLesson;
          })
      : [];
  }

  static preloadScene(scene: string, callback: Function) {
    cc.director.preloadScene(scene, () => {
      if (callback != null) callback();
    });
  }

  static loadScene(
    scene: string,
    bundle: string = null,
    callback: Function = null
  ) {
    Util.freeResources();

    // const lang = Config.i.course.type == 'literacy' ? Config.i.course.lang as Lang : (Profile.lang || Lang.ENGLISH)
    const lang =
      scene == "common/scenes/lessonController"
        ? Config.i.course.id == "maths"
          ? Config.i.hasTracing
            ? Lang.ENGLISH
            : Profile.lang
          : (Config.i.course.lang as Lang)
        : Profile.lang || Lang.ENGLISH;
    console.log("LANG_CONFIGS.get(lang)", lang, LANG_CONFIGS.get(lang));

    const langConfig = LANG_CONFIGS.get(lang);
    console.log("const langConfig ", langConfig);

    Config.i.currentFontName = langConfig.font;
    if (!Config.i.hasLoadedTextFont(langConfig.font)) {
      Config.i.loadFontDynamically(langConfig.font, () => {
        cc.log("Loading font ....", langConfig.font);
        Config.continueLoadScene(scene, bundle, callback);
      });
    } else {
      Config.continueLoadScene(scene, bundle, callback);
    }
  }

  static continueLoadScene(
    scene: string,
    bundle: string = null,
    callback: Function = null
  ) {
    if (bundle != null) {
      UtilLogger.logChimpleEvent("load_scene", {
        scene:
          scene == "common/scenes/lessonController"
            ? scene + " " + Config.i.lesson.id
            : scene,
        bundle: bundle,
      });

      UtilLogger.logChimpleEvent("screen_view", {
        scene:
          scene == "common/scenes/lessonController"
            ? scene + " " + Config.i.lesson.id
            : scene,
        bundle: bundle,
      });

      cc.assetManager.loadBundle(bundle, (err, loadedBundle) => {
        if (err) {
          cc.log("Failed loading bundle: " + bundle + " " + err);
        } else {
          loadedBundle.loadScene(scene, (err, loadedScene) => {
            if (err) {
              cc.log("Failed loading scene: " + bundle + " " + err);
            } else {
              cc.director.runScene(loadedScene, null, () => {
                cc.sys.garbageCollect();
                if (callback != null) {
                  callback();
                }
              });
            }
          });
        }
      });
    } else {
      cc.director.loadScene(scene, () => {
        UtilLogger.logChimpleEvent("load_scene", {
          scene:
            scene == "common/scenes/lessonController"
              ? scene + " " + Config.i.lesson.id
              : scene,
        });

        UtilLogger.logChimpleEvent("screen_view", {
          scene:
            scene == "common/scenes/lessonController"
              ? scene + " " + Config.i.lesson.id
              : scene,
        });

        cc.sys.garbageCollect();
        if (callback != null) {
          callback();
        }
      });
    }
  }

  pushScene(
    scene: string,
    bundle: string = null,
    callback: Function = null,
    first: boolean = false
  ) {
    if (first) this.popAllScenes();
    this._scenes.push(new SceneDef(scene, bundle));
    Config.loadScene(scene, bundle, callback);
  }

  popScene() {
    const popScene: SceneDef = this._scenes.pop();
    UtilLogger.logChimpleEvent("scene_exit", {
      scene: popScene.scene,
      bundle: popScene.bundle,
    });

    const config = Config.i;
    if (!!config && !!config.game) {
      const gameConfig = GAME_CONFIGS[config.game];
      if (!!gameConfig && !!gameConfig.fontName && !!config.currentFontName) {
        config.releaseFont(config.currentFontName);
      }
      config.game = null;
    }

    var sceneDef = this._scenes[this._scenes.length - 1];
    var scene = sceneDef.scene;
    if (scene.startsWith("menu/map/scene/map")) {
      scene = scene.substr(0, scene.length - 1) + Profile.lastWorld;
    }
    Config.loadScene(scene, sceneDef.bundle);
  }

  prePopScene(callback: Function) {
    var sceneDef = this._scenes[this._scenes.length - 2];
    var scene = sceneDef.scene;
    if (scene.startsWith("menu/map/scene/map")) {
      scene = scene.substr(0, scene.length - 1) + Profile.lastWorld;
    }
    Config.preloadScene(scene, callback);
  }

  popAllScenes() {
    this._scenes = [];
  }

  get canPop(): boolean {
    return this._scenes.length > 1;
  }

  releaseFont(fontName: string) {
    if (this._textFontMap.has(fontName)) {
      cc.log("releasing current font", fontName);
      cc.resources.release(fontName);
      this._textFontMap.delete(fontName);
      Config.i.currentFontName = null;
    }
  }

  loadFontDynamically(
    fontName: string,
    callBack: Function = null,
    data: any = null
  ) {
    if (this.hasLoadedTextFont(fontName)) {
      this.currentFontName = fontName;
      if (!!callBack) callBack(data);
    } else {
      cc.resources.load(`fonts/${fontName}`, cc.Font, (err, fontAsset) => {
        if (err) {
          if (!!callBack) callBack(data);
        } else {
          console.log("loading font from Config", fontName);
          this._textFontMap.set(fontName, fontAsset);
          if (this.hadLoadedTraceFont() !== null) {
            this.currentFontName = this.hadLoadedTraceFont();
          } else {
            this.currentFontName = fontName;
          }
          if (!!callBack) callBack(data);
        }
      });
    }
  }

  loadLessonJson(
    callback: Function,
    node: cc.Node = null,
    lessons: Array<Lesson> = null,
    maxPerLesson: number = 0
  ) {
    if (this.problem != 0) {
      callback(this._lessonData.rows[this.problem - 1]);
    } else if (lessons != null) {
      var allLessonData = [];
      let numLessons = lessons.length;
      lessons.forEach((les) => {
        const jsonFile =
          this.course.id +
          "/" +
          (les.orig_lesson_id || les.id) +
          "/res/" +
          (les.orig_lesson_id || les.id) +
          ".json";
        Util.load(jsonFile, (err, jsonAsset) => {
          const lessonData =
            jsonAsset instanceof cc.JsonAsset ? jsonAsset.json : jsonAsset;
          const quizRows: [] = lessonData.rows
            .filter((el) => {
              return el[0].toLowerCase().includes("quiz");
            })
            .map((el) => {
              el[2] = les.id;
              return el;
            });
          allLessonData = allLessonData.concat(
            maxPerLesson > 0
              ? Util.shuffle(quizRows).slice(0, maxPerLesson)
              : quizRows
          );
          numLessons--;
        });
      });
      const checkAllLoaded = () => {
        if (numLessons <= 0) {
          cc.director.getScheduler().unschedule(checkAllLoaded, node);
          if (maxPerLesson == 0) {
            Util.shuffle(allLessonData);
            this._lessonData = {
              rows: allLessonData.slice(
                0,
                Math.min(10, allLessonData.length - 1)
              ),
            };
          } else {
            this._lessonData = { rows: allLessonData };
          }
          this.totalProblems = this._lessonData.rows.length;
          this.problem = 1;
          if (callback != null)
            callback(this._lessonData.rows[this.problem - 1]);
        }
      };
      cc.director.getScheduler().schedule(checkAllLoaded, node, 1);
    } else {
      const jsonFile =
        this.course.id +
        "/" +
        (this.lesson.orig_lesson_id || this.lesson.id) +
        "/res/" +
        (this.lesson.orig_lesson_id || this.lesson.id) +
        ".json";
      Util.load(
        jsonFile,
        (err, jsonAsset) => {
          this._lessonData =
            jsonAsset instanceof cc.JsonAsset ? jsonAsset.json : jsonAsset;
          if (this.lesson.id.endsWith("_PreQuiz")) {
            // get 4 chunks of data
            const numChunks = 4;
            const chunkLength = Math.floor(
              this._lessonData.rows.length / numChunks
            );
            const subArr = [];
            for (let index = 0; index < numChunks; index++) {
              const r1 = Util.randomBetween(0, chunkLength - 2);
              const r2 = Util.randomBetween(r1 + 1, chunkLength - 1);
              const r3 = Util.randomBetween(r2 + 1, chunkLength);
              subArr.push(this._lessonData.rows[index * chunkLength + r1]);
              subArr.push(this._lessonData.rows[index * chunkLength + r2]);
              subArr.push(this._lessonData.rows[index * chunkLength + r3]);
              cc.log(r1, r2, r3);
            }
            this._lessonData.rows = subArr;
          }
          this._lessonData.rows.forEach((el) => {
            el[2] = this.lesson.id;
          });
          this.totalProblems = this._lessonData.rows.length;
          this.problem = 1;
          if (callback != null)
            callback(this._lessonData.rows[this.problem - 1]);
        },
        true
      );
    }
  }

  // loadQuizData(callback: Function) {
  //     this._levelData = []
  //     const games = this.curriculum[this.world][this.level]
  //         .filter(val => (val[0] != 'run' && val[0] != QUIZ_LITERACY))
  //     var toLoad = games.length
  //     games.forEach(game => {
  //         if (game[0] != 'run' && game[0] != QUIZ_LITERACY) {
  //             const jsonFile = this.course + '/' + game[0] + '/res/' + game[0] + '.json'
  //             Util.load(jsonFile, (err, jsonAsset) => {
  //                 const json = jsonAsset instanceof cc.JsonAsset ? jsonAsset.json : jsonAsset;
  //                 json.forEach(el => {
  //                     if (!el[0].startsWith('#') && el[0] == game[1] && el[2] == '0') {
  //                         this._levelData.push([...el])
  //                     }
  //                 })

  //                 if (--toLoad <= 0) {
  //                     Util.shuffle(this._levelData)
  //                     this._levelData.forEach((val, index) => {
  //                         val[2] = String(index + 1)
  //                     })
  //                     this.problem = 1
  //                     this.totalProblems = this._levelData.length
  //                     callback([this._levelData[0]])
  //                 }
  //             })
  //         }
  //     })
  // }

  nextProblem() {
    if (this.problem < this.totalProblems) {
      this.problem++;
      this.data = [this._lessonData.rows[this.problem - 1]];
    }
  }

  prevProblem() {
    if (this.problem > 1) {
      this.problem--;
      this.data = [this._lessonData.rows[this.problem - 1]];
    }
  }

  loadPathJSON(
    fileName: string,
    callback: Function,
    isNumber: boolean = false
  ) {
    let data: any[] = [];
    let jsonData: string = null;
    let appendPath: string = null;
    fileName = fileName.trim();
    isNumber = !isNaN(Number(fileName));
    let jsonFile = null;

    if (fileName.indexOf("tutorial") !== -1) {
      fileName = fileName.replace(".png", "");
      jsonFile =
        "course-" +
        this.course.id +
        "/" +
        (this.lesson.orig_lesson_id || this.lesson.id) +
        "/res/" +
        fileName +
        "-json";
    } else {
      const isUpperCase: boolean = fileName === fileName.toUpperCase();
      appendPath = isNumber ? "numbers" : isUpperCase ? "upper" : "lower";
      jsonFile =
        this.course.id + "/course/res/paths/" + appendPath + "/" + fileName; //default
    }
    jsonFile = jsonFile + ".json";
    Util.load(
      jsonFile,
      (err, jsonAsset) => {
        data = [];
        if (jsonAsset !== null) {
          const json =
            jsonAsset instanceof cc.JsonAsset ? jsonAsset.json : jsonAsset;
          if (Array.isArray(json)) {
            json.forEach((el) => {
              data.push(el);
            });
          }
        }
        jsonData =
          !!data && data.length > 0
            ? JSON.stringify(data)
            : cc.sys.localStorage.getItem(fileName) != null &&
              cc.sys.localStorage.getItem(fileName).length > 0
            ? cc.sys.localStorage.getItem(fileName)
            : null;

        callback(jsonData);
      },
      true
    );
  }

  loadCourseJsons(user: User, node: cc.Node, callBack: Function) {
    let numCourses = 0;
    user.courseProgressMap.forEach((courseProgress, name) => {
      numCourses++;
      this.loadSingleCourseJson(name, () => {
        numCourses--;
      });
    });
    numCourses++;
    this.loadSingleCourseJson("reward", () => numCourses--);

    const checkAllLoaded = () => {
      if (numCourses <= 0) {
        user.curriculumLoaded = true;
        cc.director.getScheduler().unschedule(checkAllLoaded, node);
        callBack();
      }
    };
    cc.director.getScheduler().schedule(checkAllLoaded, node, 1);
  }

  loadSingleCourseJson(name: string, callBack: Function) {
    cc.assetManager.loadBundle(name, (err, bundle) => {
      if (err) {
        cc.log("error in loadSingleJson", err);
        return console.error(err);
      }
      Util.bundles.set(name, bundle);
      const jsonFile = name + "/course/res/course.json";
      Util.load(jsonFile, (err: Error, jsonAsset) => {
        if (!err) {
          const course: Course =
            jsonAsset instanceof cc.JsonAsset ? jsonAsset.json : jsonAsset;
          course.chapters.forEach((chapter) => {
            chapter.course = course;
            chapter.lessons.forEach((lesson) => {
              lesson.chapter = chapter;
              if (User.getCurrentUser() && User.getCurrentUser().debug) {
                lesson.open = true;
              } else {
                lesson.open = false;
              }
              this.allLessons.set(lesson.id, lesson);
            });
          });
          this.curriculum.set(name, course);
        }
        callBack();
      });
    });
  }

  public static loadBundle(
    lessonId: string,
    callback: Function,
    errCallback: Function
  ) {
    const isCuba = Profile.getItem(IS_CUBA);
    const isAndroid = Capacitor.getPlatform() === "android";
    const gameUrl =
      cc.sys.localStorage.getItem("gameUrl") ??
      "http://localhost/_capacitor_file_/data/user/0/org.chimple.cuba/files/";
    const firstPath =
      isCuba && isAndroid && gameUrl ? gameUrl + lessonId : lessonId;
    console.log(
      "gameUrl",
      gameUrl,
      "isCuba",
      isCuba,
      cc.sys.localStorage.getItem("gameUrl"),
      "firstPath",
      firstPath
    );
    cc.assetManager.loadBundle(firstPath, (err, bundle) => {
      if (err) {
        // if (Capacitor.getPlatform() === 'android') {
        //     const gameUrl = cc.sys.localStorage.getItem("gameUrl") ?? "http://localhost/_capacitor_file_/data/user/0/org.chimple.cuba/files/";
        //     console.log("gameUrl", gameUrl, cc.sys.localStorage.getItem("gameUrl"))
        //     const path = gameUrl + lessonId;
        //     cc.assetManager.loadBundle(path, (err2, bundle2) => {
        //         cc.log('loaded bundle with path ', path, "err", err2, "bundle", bundle2)
        //         if (err2) {
        //             cc.assetManager.loadBundle(BUNDLE_URL + lessonId, (err2, bundle2) => {
        //                 if (err2) {
        //                     errCallback(err2);
        //                 } else {
        //                     callback(bundle2);
        //                 }
        //             });
        //         } else {
        //             callback(bundle2);
        //         }
        //     });
        // } else {
        cc.assetManager.loadBundle(BUNDLE_URL + lessonId, (err2, bundle2) => {
          if (err2) {
            cc.assetManager.loadBundle(lessonId, (err3, bundle3) => {
              if (err3) {
                errCallback(err3);
              } else {
                callback(bundle3);
              }
            });
            errCallback(err2);
          } else {
            callback(bundle2);
          }
        });
        // }
      } else {
        callback(bundle);
      }
    });
  }

  get friend(): string {
    // return WORLDS[0].armature;
    return "chimp";
  }
}
