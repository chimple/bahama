import { Queue } from "../../../queue";
import Header from "../header";
import {
  INVENTORY_DATA,
  REWARD_BACKGROUNDS,
  REWARD_CHARACTERS,
  REWARD_TYPES,
  STICKER_BOOK,
  STICKER_REWARDS,
  Util,
} from "../util";
import UtilLogger from "../util-logger";
import Config, {
  ALL_LANGS,
  StartAction,
  Lang,
  ASSIGNMENT_COURSE_ID,
} from "./config";
import {
  COUNTRY_CODES,
  CURRENT_STUDENT_ID,
  EXAM,
  FIREBASE_SCHOOL_ID,
  FIREBASE_SECTION_ID,
  FIREBASE_STUDENT_ID,
  MIN_PASS,
  Mode,
} from "./constants";
import { Chapter } from "./convert";

const WORLD = "World";
const LEVEL = "Level";
const IS_INITIALIZED = "isInitialized";
export const DIALING_CODE = "dialingCode";
export const SFX_OFF = "sfxOff";
export const GENDER = "gender";
export const MUSIC_OFF = "musicOff";
export const AGE = "age";
export const USER_ID = "UserId";
export const MAX_USERS = 3;
export const MAX_AGE = 12;
export const LANGUAGE = "language";
export const CURRENTMODE = "currentMode";
export const EMAIL = "email";
export const CONTACT = "contact";
export const PASSWORD = "password";
export const IS_OTP_VERIFIED = "isOtpVerified";
export const IN_LOGIN_FLOW = "in_login_flow";

export enum Gender {
  BOY,
  GIRL,
  UNKNOWN,
}

export interface UserAttribute {
  id?: string;
  name?: string;
  age?: number;
  gender?: Gender;
  imgPath?: string;
  avatarImage?: string;
  isTeacher?: boolean;
}

export interface CourseProgress {
  currentChapterId: string;
  currentLessonId: string;
  date?: Date;
  assignments?: string[];
  lessonPlan?: string[];
  lessonPlanIndex?: number;
  lessonPlanDate?: Date;
  isCourseCompleted?: boolean;

  updateChapterId(c: string);
}

export class CourseProgressClass implements CourseProgress {
  currentChapterId: string;
  currentLessonId: string;
  date: Date;
  assignments: string[];
  lessonPlan: string[];
  lessonPlanIndex: number;
  lessonPlanDate: Date;
  isCourseCompleted?: boolean;

  constructor(currentChapterId: string = null) {
    this.currentChapterId = currentChapterId;
    this.date = new Date();
    this.assignments = [];
    this.lessonPlan = [];
    this.lessonPlanIndex = 0;
    this.isCourseCompleted = false;
  }

  updateChapterId(c: string) {
    this.currentChapterId = c;
    if (Config.i.course) {
      UtilLogger.logChimpleEvent("student_level", {
        level: c,
        subject: Config.i.course.name,
      });
    }
  }
}

export interface LessonProgress {
  achievement?: number;
  score: number;
  course: string;
  attempts?: number;
  date?: Date;
  assignmentIds: string[];
}

export interface Last5LessonsItem {
  score: number;
  date?: string;
  lesson: string;
}
export class LessonProgressClass implements LessonProgress {
  achievement: number = 0;
  score: number;
  attempts: number;
  course: string;
  date: Date = null;
  assignmentIds: string[] = [];

  constructor(
    score: number,
    attempts: number = 0,
    course: string = Config.i.course.id,
    assignmentId: string = null,
    date: Date = null
  ) {
    this.score = score;
    this.attempts = attempts;
    !!date ? (this.date = date) : new Date();
    this.course = course;
    let assignment_ids = !!assignmentId ? assignmentId.split(",") : [];
    if (assignment_ids.length > 0) {
      assignment_ids.forEach((value) => {
        this.assignmentIds.push(value);
      });
    } else {
      !!assignmentId ? this.assignmentIds.push(assignmentId) : "";
    }
  }
}

export class User {
  private static _currentUser: User;
  private _serverId: string;
  private _id: string;
  private _name: string;
  private _age: number;
  private _gender: Gender;
  private _imgPath: string;
  private _avatarImage: string;
  private _inventory: object;
  private _currentBg: string;
  private _currentCharacter: string;
  private _chapterFinishedMap: Map<string, boolean>;
  private _courseProgressMap: Map<string, CourseProgress>;
  private _lessonProgressMap: Map<string, LessonProgress>;
  private _unlockedInventory: object;
  private _unlockedRewards: object;
  private _isTeacher: boolean;
  private _level: number;
  private _assignments: string[];
  private _currentCourseId: string;
  private _currentReward: string[];
  isConnected: boolean = false;
  private _schoolId: string;
  private _sectionId: string;
  private _studentId: string;
  debug: boolean = false;
  curriculumLoaded: boolean = false;
  private _sectionName: string;
  private _schoolName: string;
  private _last5Lessons: Map<string, Last5LessonsItem[]>;

  constructor(
    id: string,
    name: string,
    age: number,
    gender: Gender,
    imgPath: string,
    avatarImage: string,
    isTeacher: boolean,
    inventory: object,
    currentBg: string,
    currentCharacter: string,
    courseProgressMap: Map<string, CourseProgress>,
    lessonProgressMap: Map<string, LessonProgress>,
    chapterFinishedMap: Map<string, boolean>,
    unlockedInventory: object,
    unlockedRewards: object,
    debug: boolean = false,
    lessonPlan: string[],
    serverId: string = "",
    schoolId: string = "",
    sectionId: string = "",
    studentId: string = "",
    schoolName: string = "",
    sectionName: string = "",
    currentReward: string[] = [],
    last5Lessons: Map<string, Last5LessonsItem[]> = new Map()
  ) {
    this._id = id;
    this._name = name;
    this._age = age;
    this._gender = gender;
    this._imgPath = imgPath;
    this._avatarImage = avatarImage;
    this._isTeacher = isTeacher;
    this._inventory = inventory;
    this._unlockedInventory = unlockedInventory;
    this._unlockedRewards = unlockedRewards;
    this._currentBg = currentBg;
    this._currentCharacter = currentCharacter;
    this._courseProgressMap = courseProgressMap;
    this._lessonProgressMap = lessonProgressMap;
    this._chapterFinishedMap = chapterFinishedMap;
    UtilLogger.setUserIdEvent(id);
    UtilLogger.setUserPropertiesEvent("userName", name);
    UtilLogger.setUserPropertiesEvent("userAge", age);
    this._genderEvent(gender);
    this.debug = debug;
    this._serverId = serverId;
    this._assignments = [];
    this._currentReward = currentReward;
    this._schoolId = schoolId;
    this._sectionId = sectionId;
    this._studentId = studentId;
    this._schoolName = schoolName;
    this._sectionName = sectionName;
    this._last5Lessons = last5Lessons;
  }

  _genderEvent(gender: Gender) {
    switch (gender) {
      case Gender.BOY:
        UtilLogger.setUserPropertiesEvent("userGender", "Boy");
        break;
      case Gender.GIRL:
        UtilLogger.setUserPropertiesEvent("userGender", "Girl");
        break;
      case Gender.UNKNOWN:
        UtilLogger.setUserPropertiesEvent("userGender", "Unknown");
        break;
    }
  }

  set serverId(id: string) {
    this._serverId = id;
    this.storeUser();
    UtilLogger.setUserIdEvent(id);
  }

  set id(id: string) {
    this._id = id;
    this.storeUser();
    UtilLogger.setUserIdEvent(id);
  }

  get id(): string {
    return this._id;
  }

  get serverId(): string {
    return this._serverId;
  }

  set name(name: string) {
    this._name = name;
    this.storeUser();
    UtilLogger.setUserPropertiesEvent("userName", name);
  }

  get name(): string {
    return this._name;
  }

  set age(age: number) {
    this._age = age;
    this.storeUser();
    UtilLogger.setUserPropertiesEvent("userAge", age);
  }

  get age(): number {
    return this._age;
  }

  set gender(gender: Gender) {
    this._gender = gender;
    this.storeUser();
    this._genderEvent(gender);
  }

  get gender(): Gender {
    return this._gender;
  }

  set imgPath(imgPath: string) {
    this._imgPath = imgPath;
    this.storeUser();
  }

  get imgPath(): string {
    return this._imgPath;
  }

  set avatarImage(avatarImage: string) {
    console.log(" avatar image : ", avatarImage);
    this._avatarImage = avatarImage;
    UtilLogger.setUserPropertiesEvent("userAvatarImage", avatarImage);
    this.storeUser();
  }

  get avatarImage(): string {
    return this._avatarImage;
  }

  set inventory(inventory: object) {
    this._inventory = inventory;
    this.storeUser();
  }

  get inventory(): object {
    return this._inventory;
  }

  set currentBg(currentBg: string) {
    this._currentBg = currentBg;
    this.storeUser();
  }

  get currentBg(): string {
    return this._currentBg;
  }

  set currentCharacter(currentCharacter: string) {
    this._currentCharacter = currentCharacter;
    this.storeUser();
  }

  get currentCharacter(): string {
    return this._currentCharacter;
  }

  set courseProgressMap(courseProgressMap: Map<string, CourseProgress>) {
    this._courseProgressMap = courseProgressMap;
  }

  get courseProgressMap(): Map<string, CourseProgress> {
    return this._courseProgressMap;
  }

  set lessonProgressMap(lessonProgressMap: Map<string, LessonProgress>) {
    this._lessonProgressMap = lessonProgressMap;
  }

  get lessonProgressMap(): Map<string, LessonProgress> {
    return this._lessonProgressMap;
  }

  set unlockedInventory(unlockedInventory: object) {
    this._unlockedInventory = unlockedInventory ?? {};
    this.storeUser();
  }

  get unlockedInventory(): object {
    return this._unlockedInventory;
  }

  set unlockedRewards(unlockedRewards: object) {
    this._unlockedRewards = unlockedRewards ?? {};
    this.storeUser();
  }

  get unlockedRewards(): object {
    return this._unlockedRewards;
  }

  set isTeacher(isTeacher: boolean) {
    this._isTeacher = isTeacher;
    this.storeUser();
  }

  set assignments(assignments: string[]) {
    this._assignments = assignments;
    this.storeUser();
  }

  get assignments(): string[] {
    return this._assignments;
  }

  set currentCourseId(currentCourseId: string) {
    this._currentCourseId = currentCourseId;
    this.storeUser();
  }

  get currentCourseId(): string {
    return this._currentCourseId;
  }

  set currentReward(currentReward: string[]) {
    this._currentReward = currentReward;
    this.storeUser();
  }

  get currentReward(): string[] {
    return this._currentReward;
  }

  get schoolId(): string {
    return this._schoolId;
  }

  set schoolId(value: string) {
    this._schoolId = value;
  }

  get sectionId(): string {
    return this._sectionId;
  }

  set sectionId(value: string) {
    this._sectionId = value;
  }

  get studentId(): string {
    return this._studentId;
  }

  set studentId(value: string) {
    this._studentId = value;
  }

  get sectionName(): string {
    return this._sectionName;
  }

  set sectionName(value: string) {
    this._sectionName = value;
  }

  get schoolName(): string {
    return this._schoolName;
  }

  set schoolName(value: string) {
    this._schoolName = value;
  }

  get last5Lessons(): Map<string, Last5LessonsItem[]> {
    return this._last5Lessons;
  }
  set last5Lessons(value: Map<string, Last5LessonsItem[]>) {
    this._last5Lessons = value;
  }

  updateLast5Lessons(item: Last5LessonsItem) {
    const config = Config.i;
    const course = config.course.id;
    let last5Lessons = this._last5Lessons.get(course) ?? [];
    last5Lessons.unshift(item);
    last5Lessons = last5Lessons.slice(0, 5);
    this._last5Lessons.set(course, last5Lessons);
  }

  unlockInventoryForItem(item: string) {
    this._unlockedInventory[item] = true;
    this.storeUser();
  }

  unlockRewardsForItem(item: string, value: number) {
    this._unlockedRewards[item] = value;
    this.storeUser();
  }

  updateInventory(name: string, value: string) {
    this._inventory[name] = value;
    this.storeUser();
  }

  openAllRewards() {
    REWARD_CHARACTERS.forEach((char) => {
      this._unlockedRewards[`${REWARD_TYPES[0]}-${char}`] = 1;
      INVENTORY_DATA.forEach((arr) => {
        arr.forEach((inv) => {
          this._unlockedRewards[`${REWARD_TYPES[3]}-${char}-${inv}`] = 1;
        });
      });
    });
    REWARD_BACKGROUNDS.forEach((bg) => {
      this._unlockedRewards[`${REWARD_TYPES[1]}-${bg}`] = 1;
    });

    //unlocking Sticker Book Rewards
    STICKER_REWARDS.forEach((arr) => {
      STICKER_BOOK.forEach((lessonId) => {
        this._unlockedRewards[`${REWARD_TYPES[4]}-sticker-${lessonId}`] = 1;
        arr.forEach((sticker) => {
          this._unlockedRewards[
            `${REWARD_TYPES[4]}-sticker-${lessonId}-${sticker}`
          ] = 1;
        });
      });
    });
    this.storeUser();
  }

  openAllRewardsForCharacter(character: string) {
    INVENTORY_DATA.forEach((arr) => {
      arr.forEach((inv) => {
        this._unlockedRewards[`${REWARD_TYPES[3]}-${character}-${inv}`] = 1;
      });
    });
  }

  openOnlyTheSelectedRewards(character: string) {
    INVENTORY_DATA.forEach((arr, i) => {
      let unlockItem = this._inventory[`${character}-${arr[0].split("-")[0]}`];
      arr.forEach((inv) => {
        delete this._unlockedRewards[`${REWARD_TYPES[3]}-${character}-${inv}`];
      });

      if (unlockItem != undefined)
        this._unlockedRewards[
          `${REWARD_TYPES[3]}-${character}-${arr[i]
            .split("-")[0]
            .concat(`-${unlockItem}`)}`
        ] = 1;
    });
  }

  unlockBydefaultRewards() {
    this.unlockRewardsForItem(`${REWARD_TYPES[0]}-${REWARD_CHARACTERS[0]}`, 1);
    this.unlockRewardsForItem(`${REWARD_TYPES[1]}-${REWARD_BACKGROUNDS[0]}`, 1);
  }

  updateLessonProgress(
    lessonId: string,
    score: number,
    quizScores: number[],
    assignmentId: string = null
  ): [string, string] {
    var reward: [string, string];
    const config = Config.i;
    const cpm = this.courseProgressMap.get(config.course.id);
    this.updateLast5Lessons({
      lesson: lessonId,
      score: score,
      date: new Date().toISOString(),
    });
    if (cpm) {
      if (this._lessonProgressMap.has(lessonId)) {
        const lessonProgress = this._lessonProgressMap.get(lessonId);
        lessonProgress.assignmentIds.push(Config.i.lesson.assignmentId);
        lessonProgress.attempts++;
        lessonProgress.date = new Date();
        if (score > (lessonProgress.score ?? 0)) {
          lessonProgress.score = score;
          if (Config.i.lesson.type == EXAM && score >= MIN_PASS) {
            reward = [REWARD_TYPES[2], Config.i.lesson.image];
          }
        }
        if (Config.i.lesson.type == EXAM && score < MIN_PASS) {
          // attempted challenge twice but did not pass
        }
      } else {
        if (Config.i.lesson.type == EXAM && score >= MIN_PASS) {
          reward = [REWARD_TYPES[2], Config.i.lesson.image];
        }
        this._lessonProgressMap.set(
          lessonId,
          new LessonProgressClass(
            score,
            1,
            Config.i.course.id,
            Config.i.lesson.assignmentId
          )
        );
      }
      if (lessonId == config.course.id + "_PreQuiz") {
        const chapterId = UtilLogger.getChapterIdForPrequiz(quizScores);
        console.log("on prequiz chapterid", chapterId);
        cpm.updateChapterId(chapterId);
        // const quizChapter = config.course.chapters.find((c) => c.id == config.course.id + '_quiz')
        // if (quizChapter) {
        //     let currentCourse = config.course.chapters.find((c) => c.id != config.course.id + '_quiz')
        //     let qzId = 0
        //     for (let index = 0; index + 2 < quizScores.length; index += 3) {
        //         if (quizScores[index] + quizScores[index + 1] + quizScores[index + 2] >= 2) {
        //             currentCourse = config.course.chapters.find((c) => c.id == config.course.levels[qzId])
        //         } else {
        //             break
        //         }
        //         qzId++
        //     }
        //     cpm.updateChapterId(currentCourse.id);
        // } else {
        //     const formulaScore = quizScores.reduce((acc, cur, i, arr): number => {
        //         const mul = Math.floor(arr.length / 2) - Math.floor(i / 2)
        //         const neg = cur == 0 ? -0.5 : cur
        //         return acc + neg * mul
        //     }, 0)
        //     const max = quizScores.length / 2 * (quizScores.length / 2 + 1)
        //     const total = Math.max(0, formulaScore / max)
        //     const chapters = config.curriculum.get(config.course.id).chapters
        //     cpm.updateChapterId(chapters[Math.floor((chapters.length - 1) * total)].id);
        // }
      } else {
        if (Config.i.lesson.type != EXAM || score >= MIN_PASS) {
          // open the next lesson
          const lessons = Config.i.chapter.lessons;
          const lessonIndex = lessons.findIndex((les) => {
            return les.id == lessonId;
          });
          if (lessons.length > lessonIndex + 1) {
            const nextLesson = lessons[lessonIndex + 1];
            if (!this._lessonProgressMap.has(nextLesson.id)) {
              this._lessonProgressMap.set(
                nextLesson.id,
                new LessonProgressClass(-1)
              );
            }
          }
        }
      }
      const lessonPlan = cpm.lessonPlan;
      if (lessonPlan && lessonPlan[cpm.lessonPlanIndex] == config.lesson.id) {
        Config.i.startAction = StartAction.MoveLessonPlan;
        if (Config.i.lesson.type != EXAM || score >= MIN_PASS) {
          // if passed challenge in reco
          cpm.lessonPlanIndex++;
          const lessons = Config.i.chapter.lessons;
          const lessonIndex = lessons.findIndex((les) => {
            return les.id == lessonId;
          });
          if (lessons.length > lessonIndex + 1) {
            const nextLesson = lessons[lessonIndex + 1];
            cpm.currentLessonId = nextLesson.id;
          } else if (
            this.courseProgressMap.get(Config.i.course.id).currentChapterId ==
            Config.i.chapter.id
          ) {
            let nextChapter: Chapter;
            if (
              Config.i.course.chapters[Config.i.course.chapters.length - 1]
                .id == Config.i.chapter.id ||
              this.courseProgressMap.get(Config.i.course.id)
                .isCourseCompleted === true
            ) {
              const randomInt = Math.floor(
                Math.random() * (Config.i.course.chapters.length - 1 - 1 + 1) +
                  0
              );
              nextChapter = Config.i.course.chapters[randomInt];
              this.courseProgressMap.get(Config.i.course.id).isCourseCompleted =
                true;
            }
            if (!nextChapter) {
              var found = false;
              nextChapter = Config.i.course.chapters.find((c) => {
                if (found) return true;
                found =
                  c.id ==
                  this.courseProgressMap.get(Config.i.course.id)
                    .currentChapterId;
                return false;
              });
            }
            if (nextChapter) {
              cpm.currentLessonId = null;
              cpm.updateChapterId(nextChapter.id);
            }
          }
        } else {
          cpm.lessonPlanIndex = 0;
        }
      }
    }

    if (config.startCourse.id == ASSIGNMENT_COURSE_ID) {
      const startCourseProgressMap = this.courseProgressMap.get(
        config.startCourse.id
      );
      const lessonPlan = startCourseProgressMap.lessonPlan;
      if (
        lessonPlan &&
        lessonPlan[startCourseProgressMap.lessonPlanIndex] == config.lesson.id
      ) {
        Config.i.startAction = StartAction.MoveLessonPlan;
        startCourseProgressMap.lessonPlanIndex++;
      }
    }

    if (this.assignments) {
      const index = this.assignments.indexOf(config.lesson.id);
      if (index > -1) {
        this.assignments.splice(index, 1);
      }
    }

    // check if all lessons for current chapter are finished
    const courseProgress = this.courseProgressMap.get(Config.i.course.id);
    if (!!courseProgress) {
      courseProgress.date = new Date();
      this._chapterFinishedMap = !this._chapterFinishedMap
        ? new Map()
        : this._chapterFinishedMap;
      const currentChapter = config.curriculum
        .get(config.course.id)
        .chapters.find((c) => c.id === courseProgress.currentChapterId);
      if (
        !!currentChapter &&
        !this._chapterFinishedMap.has(currentChapter.id)
      ) {
        const allLessonIds = currentChapter.lessons.map((l) => l.id);
        const userFinishedLessonIds = Array.from(
          this._lessonProgressMap.keys()
        );
        const isAllLessonsFinished =
          allLessonIds.filter(
            (arr1Item) => !userFinishedLessonIds.includes(arr1Item)
          ).length === 0;
        if (isAllLessonsFinished) {
          this._chapterFinishedMap.set(currentChapter.id, true);

          UtilLogger.logChimpleEvent("chapterEnd", {
            chapterName: config.chapter.name,
            chapterId: config.chapter.id,
            courseName: config.course.id,
          });
        }
      }
    }
    this.storeUser();
    return reward;
  }

  storeUser() {
    User.storeUser(this);
  }

  static storeUser(user: User) {
    cc.log("serverid", user._serverId);
    cc.sys.localStorage.setItem(user.id, User.toJson(user));

    if (!user.debug) {
      // log to ff userProfile
      UtilLogger.logChimpleEvent("userProfile", {
        userAge: user.age,
        gender: user.gender,
        userId: user.id,
      });

      if (cc.sys.localStorage.getItem(CURRENT_STUDENT_ID)) {
        let profileInfo = {
          profile: User.toJson(user),
          kind: "Profile",
          studentId: cc.sys.localStorage.getItem(CURRENT_STUDENT_ID),
        };

        Queue.getInstance().push(profileInfo);
      }
    }

    User.syncProfile();
  }

  static syncProfile() {
    const user = User._currentUser;
    const mode = parseInt(Profile.getValue(CURRENTMODE));
    if (
      cc.sys.isNative &&
      !!user &&
      !!user.schoolId &&
      !!user.sectionId &&
      !!user.studentId &&
      !!user.id
    ) {
      if (!user?.isConnected && mode === Mode.HomeConnect) return;
      UtilLogger.syncProfile(
        user.schoolId,
        user.sectionId,
        user.studentId,
        User.toJson(user),
        user.id
      );
    }
  }

  static createUUID() {
    var dt = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
    return uuid;
  }

  static createUser(
    name: string,
    imgPath: string,
    age: number,
    gender: Gender,
    id: string = null,
    avatarImage: string = null,
    isTeacher: boolean = false
  ): User {
    let uid = !!id ? id : User.createUUID();
    const debug =
      name == "debug15" &&
      avatarImage == "teacherbird" &&
      age == 8 &&
      gender == Gender.GIRL;
    const getDate = (seconds = 1) => {
      const date = new Date();
      date.setSeconds(date.getSeconds() + seconds);
      return date;
    };
    let user = new User(
      uid,
      name,
      age,
      gender,
      imgPath,
      avatarImage,
      isTeacher,
      {},
      "camp",
      "chimp",
      debug
        ? new Map([
            ["assignment", new CourseProgressClass()],
            ["en", new CourseProgressClass("en00")],
            ["maths", new CourseProgressClass("maths00")],
            // ['hi', new CourseProgressClass('hi00')],
            // ['kn', new CourseProgressClass('kn00')],
            // ['mr', new CourseProgressClass('mr00')],
            ["puzzle", new CourseProgressClass("puzzle00")],
            ["test-lit", new CourseProgressClass("chapter_0")],
            ["test-maths", new CourseProgressClass("chapter_0")],
          ])
        : new Map([
            ["assignment", new CourseProgressClass()],
            ["en", new CourseProgressClass()],
            ["maths", new CourseProgressClass()],
            // ['hi', new CourseProgressClass()],
            // ['kn', new CourseProgressClass()],
            // ['mr', new CourseProgressClass('mr00')],
            ["puzzle", new CourseProgressClass("puzzle00")],
          ]),
      new Map(),
      new Map(),
      {},
      {},
      debug,
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "1",
        "2",
        "r",
        "1",
        "2",
        "r",
        "1",
        "2",
        "r",
      ]
      // ['', '', '', '', '', '', '', '', '1', '2', '1', '2', '1', '2', '1', '2', '1']
    );
    if (debug) user.openAllRewards();
    // open bydefault unlocked rewards
    user.unlockBydefaultRewards();

    let schoolId: string = cc.sys.localStorage.getItem(FIREBASE_SCHOOL_ID);
    user.schoolId = !!schoolId ? schoolId : null;
    let sectionId: string = cc.sys.localStorage.getItem(FIREBASE_SECTION_ID);
    user.sectionId = !!sectionId ? sectionId : null;
    let studentId: string = cc.sys.localStorage.getItem(FIREBASE_STUDENT_ID);
    user.studentId = !!studentId ? studentId : null;

    User.storeUser(user);
    let userIds = User.getUserIds();
    if (userIds == null) {
      userIds = [uid];
    } else {
      userIds.push(uid);
    }
    User.setUserIds(userIds);
    console.log(
      "User created ",
      User.fromJson(cc.sys.localStorage.getItem(uid))
    );
    return user;
  }

  static getUsers(): Array<User> {
    let response = [];
    const userIdList = User.getUserIds();
    if (userIdList != null) {
      userIdList.forEach((id) => {
        let user = User.fromJson(cc.sys.localStorage.getItem(id));
        if (!user.isTeacher && user.age > 0) response.push(user);
      });
    }
    return response;
  }

  public static getUserIds() {
    return JSON.parse(cc.sys.localStorage.getItem(USER_ID)) as Array<string>;
  }

  private static setUserIds(userId: string[]) {
    cc.sys.localStorage.setItem(USER_ID, JSON.stringify(userId));
    console.log(
      "User Id aray created ",
      JSON.parse(cc.sys.localStorage.getItem(USER_ID))
    );
  }

  static fromJson(jsonStr: string): User {
    const data = JSON.parse(jsonStr);
    if (!data) return null;
    const courseProgressMap = new Map<string, CourseProgress>();
    for (const key in data.courseProgressMap) {
      const cpData = data.courseProgressMap[key];
      const cp = new CourseProgressClass(cpData.currentChapterId);
      cp.currentLessonId = cpData.currentLessonId;
      cp.date = new Date(cpData.date);
      cp.assignments = cpData.assignments;
      cp.lessonPlan = cpData.lessonPlan;
      cp.lessonPlanIndex = cpData.lessonPlanIndex;
      cp.isCourseCompleted = cpData.isCourseCompleted;
      if (cp.lessonPlanDate) {
        cpData.lessonPlanDate = new Date(cp.lessonPlanDate);
      }
      courseProgressMap.set(key, cp);
    }
    const lessonProgressMap = new Map<string, LessonProgress>();
    for (const key in data.lessonProgressMap) {
      const lp = data.lessonProgressMap[key];
      lp.date = new Date(lp.date);
      lessonProgressMap.set(key, lp);
    }
    const chapterFinishedMap = new Map<string, boolean>();
    for (const key in data.chapterFinishedMap) {
      chapterFinishedMap.set(key, data.chapterFinishedMap[key]);
    }
    const last5Lessons = new Map<string, Last5LessonsItem[]>();
    if (data.last5Lessons) {
      for (const key in data.last5Lessons) {
        const last5LessonsItems: Last5LessonsItem[] = [];
        for (const item of data.last5Lessons[key]) {
          const last5LessonsItem: Last5LessonsItem = {
            lesson: item.lesson,
            score: item.score,
            date: item.date,
          };
          last5LessonsItems.push(last5LessonsItem);
        }
        last5Lessons.set(key, last5LessonsItems);
      }
    }
    let user = new User(
      data.id,
      data.name,
      data.age,
      data.gender,
      data.imgPath,
      data.avatarImage,
      data.isTeacher,
      data.inventory,
      data.currentBg,
      data.currentCharacter,
      courseProgressMap,
      lessonProgressMap,
      chapterFinishedMap,
      data.unlockedInventory,
      data.unlockedRewards,
      data.debug,
      data.lessonPlan,
      data.serverId,
      data.schoolId,
      data.sectionId,
      data.studentId,
      data.schoolName,
      data.sectionName,
      data.currentReward,
      last5Lessons
    );
    user.isConnected = data.isConnected;
    // user._lessonPlanDate = new Date(data.lessonPlanDate)
    // if (data.lessonPlanCourseId) user._lessonPlanCourseId = data.lessonPlanCourseId
    if (data.assignments) user._assignments = data.assignments;
    return user;
  }

  static toJson(user: User): string {
    const courseProgressObj = {};
    user.courseProgressMap.forEach((cp, name) => {
      courseProgressObj[name] = cp;
    });
    const lessonProgressObj = {};
    user.lessonProgressMap.forEach((lp, id) => {
      lessonProgressObj[id] = lp;
    });
    const chapterFinishedMapObj = {};
    user._chapterFinishedMap.forEach((lp, id) => {
      chapterFinishedMapObj[id] = lp;
    });
    const las5LessonMapObj = {};
    user._last5Lessons.forEach((lp, id) => {
      las5LessonMapObj[id] = lp;
    });
    return JSON.stringify({
      id: user.id,
      name: user.name,
      age: user.age,
      gender: user.gender,
      imgPath: user.imgPath,
      avatarImage: user.avatarImage,
      isTeacher: user.isTeacher,
      inventory: user.inventory,
      currentBg: user.currentBg,
      currentCharacter: user.currentCharacter,
      courseProgressMap: courseProgressObj,
      lessonProgressMap: lessonProgressObj,
      unlockedInventory: user.unlockedInventory,
      unlockedRewards: user.unlockedRewards,
      debug: user.debug,
      serverId: user.serverId,
      // 'lessonPlanCourseId': user.lessonPlanCourseId,
      // 'lessonPlanDate': user.lessonPlanDate,
      // 'lessonPlan': user.lessonPlan,
      assignments: user.assignments,
      chapterFinishedMap: chapterFinishedMapObj,
      isConnected: user.isConnected,
      schoolId: user.schoolId,
      sectionId: user.sectionId,
      studentId: user.studentId,
      schoolName: user.schoolName,
      sectionName: user.sectionName,
      currentReward: user.currentReward,
      last5Lessons: las5LessonMapObj,
    });
  }

  static setCurrentUser(user: User) {
    this._currentUser = user;
    Config.i.clear();
    Header.homeSelected = true;
  }

  static getCurrentUser() {
    return this._currentUser;
  }

  static getUser(uid: string): User {
    return User.fromJson(cc.sys.localStorage.getItem(uid));
  }

  static deleteUser(id: string) {
    cc.sys.localStorage.removeItem(id);
    const userIds = User.getUserIds();
    let index = userIds.indexOf(id);
    userIds.splice(index, 1);
    cc.sys.localStorage.setItem(USER_ID, JSON.stringify(userIds));
  }
  static replaceUserID(oldId: string, newId: string) {
    cc.sys.localStorage.removeItem(oldId);
    const userIds = User.getUserIds();
    let index = userIds.indexOf(oldId);
    userIds.splice(index, 1);
    userIds.push(newId);
    cc.sys.localStorage.setItem(USER_ID, JSON.stringify(userIds));
  }

  static createUserOrFindExistingUser(userAttribute: UserAttribute): User {
    let existingUser: User = null;
    if (!!userAttribute && !!userAttribute.id) {
      existingUser = this.getUser(userAttribute.id);
      if (!!existingUser) return existingUser;
    }

    return User.createUser(
      userAttribute.name,
      userAttribute.imgPath,
      userAttribute.age,
      userAttribute.gender,
      userAttribute.id,
      userAttribute.avatarImage || userAttribute.imgPath,
      userAttribute.isTeacher
    );
  }
}

// Do not use anymore
export default class Profile {
  static _profile = {};

  static initialize() {
    if (Profile.getValue(IS_INITIALIZED) != "true") {
      this.setItem(SFX_OFF, 0);
      this.setItem(MUSIC_OFF, 0);
      this.setItem(IS_OTP_VERIFIED, 0);
      this.setValue(IS_INITIALIZED, "true");
      let countryCode = UtilLogger.getCountryCode();
      if (!countryCode) {
        this.setValue(DIALING_CODE, "+91");
      } else {
        COUNTRY_CODES.forEach((e) => {
          if (e["code"].toLowerCase() === countryCode) {
            this.setValue(DIALING_CODE, e["dial_code"]);
          }
        });
      }
    }
  }

  static getValue(item: string) {
    return cc.sys.localStorage.getItem(item);
  }

  static setValue(item: string, value: string) {
    cc.sys.localStorage.setItem(item, value);
  }

  static getItem(item: string): number {
    return Number(Profile.getValue(item) || 0);
  }

  static setItem(item: string, val: number) {
    Profile.setValue(item, val.toString());
  }

  static get lang(): Lang {
    return Profile.getValue(LANGUAGE);
  }

  static fromJsonUsingParse(parseStoredProfile: string) {
    // load from Parse Student (logged in)
    let parsedStoredProfile = JSON.parse(parseStoredProfile || "{}");
    const currentStudentProfile = UtilLogger.currentProfile();
    cc.sys.localStorage.setItem(
      currentStudentProfile,
      JSON.stringify(parsedStoredProfile)
    );
  }

  static toJson() {
    if (CC_JSB) {
      const currentStudentProfile = UtilLogger.currentProfile();
      const profileFile = `${currentStudentProfile}.json`;
      cc.log(
        "writing profile information to ",
        profileFile,
        JSON.stringify(this._profile)
      );
      UtilLogger.logProfile(JSON.stringify(this._profile), profileFile);
    }
  }

  static get lastWorld(): number {
    return this.getItem(Config.getInstance().course.id + WORLD);
  }

  static set lastWorld(newVal: number) {
    this.setItem(Config.getInstance().course.id + WORLD, newVal);
    this.setItem(Config.getInstance().course.id + LEVEL, 0);
    this.toJson();
  }

  static get lastLevel(): number {
    return this.getItem(Config.getInstance().course.id + LEVEL);
  }

  static set lastLevel(newVal) {
    if (this.lastLevel < newVal) {
      this.setItem(Config.getInstance().course.id + LEVEL, newVal);
      this.toJson();
    }
  }

  static isGameCompleted(world: number, level: number, game: string): boolean {
    return (
      this.getItem(
        Config.getInstance().course.id + "_" + world + "_" + level + "_" + game
      ) == 1
    );
  }

  static setGameCompleted(
    world: number,
    level: number,
    game: string,
    completed: boolean = true
  ) {
    this.setItem(
      Config.getInstance().course.id + "_" + world + "_" + level + "_" + game,
      completed ? 1 : 0
    );
    this.toJson();
  }

  static async teacherPostLoginActivity(objectId: string) {
    const currentUser: User = User.createUserOrFindExistingUser({
      id: objectId,
    });
    User.setCurrentUser(currentUser);
    return currentUser;
  }
}
