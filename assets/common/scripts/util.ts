import ChimpleLabel from "./chimple-label";
import Help from "./help";
import {
  DEFAULT_FONT_COLOR,
  LETTER_VOICE,
  NUMBER_VOICE,
  PHONIC_VOICE,
} from "./helper";
import LessonController from "./lessonController";
import Config, { StartAction } from "./lib/config";
import { ASSET_LOAD_METHOD, COURSES_URL } from "./lib/constants";
import Profile, { LANGUAGE, SFX_OFF, User } from "./lib/profile";
import UtilLogger from "./util-logger";
import Friend from "./friend";
import Overflow = cc.Label.Overflow;
import HorizontalAlign = cc.Label.HorizontalAlign;
import VerticalAlign = cc.Label.VerticalAlign;
import { AssignHomeWorkInfo } from "./services/parseApi";
import Loading from "./loading";
import { ParseImageDownloader } from "./services/ParseImageDownloader";
import { Chapter, Course, Lesson } from "./lib/convert";

export const INVENTORY_DATA = [
  [
    "hat1-hat1",
    "hat1-hat2",
    "hat1-hat3",
    "hat1-hat4",
    "hat1-hat5",
    "hat1-hat6",
    "hat1-hat7",
    "hat1-hat8",
    "hat1-hat9",
    "hat1-hat10",
  ],
  [
    "handacc-hand1",
    "handacc-hand2",
    "handacc-hand3",
    "handacc-hand4",
    "handacc-hand5",
    "handacc-hand6",
    "handacc-hand7",
    "handacc-hand8",
  ],
  [
    "glassacc-glass1",
    "glassacc-glass2",
    "glassacc-glass3",
    "glassacc-glass4",
    "glassacc-glass5",
    "glassacc-glass6",
    "glassacc-glass7",
    "glassacc-glass8",
    "glassacc-glass9",
    "glassacc-glass10",
  ],
  // ["shoes", "right_shoe-shoe1", "right_shoe-shoe2", "right_shoe-shoe3", "right_shoe-shoe4", "right_shoe-shoe5", "right_shoe-shoe6", "right_shoe-shoe7", "right_shoe-shoe8", "right_shoe-shoe9", "right_shoe-shoe10"],
  [
    "left_shoe-shoe1",
    "left_shoe-shoe2",
    "left_shoe-shoe3",
    "left_shoe-shoe4",
    "left_shoe-shoe5",
    "left_shoe-shoe6",
    "left_shoe-shoe7",
    "left_shoe-shoe8",
    "left_shoe-shoe9",
    "left_shoe-shoe10",
  ],
  [
    "neck_acc-neck1",
    "neck_acc-neck2",
    "neck_acc-neck3",
    "neck_acc-neck4",
    "neck_acc-neck5",
    "neck_acc-neck6",
    "neck_acc-neck7",
    "neck_acc-neck8",
    "neck_acc-neck9",
    "neck_acc-neck10",
  ],
];

export const INVENTORY_SAVE_CONSTANTS = [
  "hat1",
  "handacc",
  "glassacc",
  "left_shoe",
  "neck_acc",
];
export const INVENTORY_ANIMATIONS = ["hat", "hand", "glass", "leg", "neck"];
export const INVENTORY_ICONS = {
  hat1: "rewards/hat_icons/",
  handacc: "rewards/hand_icons/",
  glassacc: "rewards/glass_icons/",
  left_shoe: "rewards/shoe_icons/",
  neck_acc: "rewards/neck_icons/",
};

export interface MicroLink {
  courseid: string;
  coursename: string;
  chapterid: string;
  chaptername: string;
  lessonid: string;
  lessonname: string;
  studentid: string;
  studentname: string;
  classid: string;
  schoolid: string;

  assignmentid?: string;
  mlpartnerid?: string;
  mlclassid?: string;
  mlstudentid?: string;
  webclass?: string;
  test?: string;
  end?: string;
}

export const REWARD_TYPES = [
  "character",
  "background",
  "achievement",
  "inventory",
  "lesson",
];
export const REWARD_CHARACTERS = [
  "chimp",
  "bear",
  "camel",
  "cat",
  "dog",
  "duck",
  "hippo",
  "horse",
  "koala",
  "rabbit",
  "tiger",
];
export const REWARD_BACKGROUNDS = [
  "camp",
  "underwater",
  "beach",
  "forest",
  "city",
  "desert",
  "fair",
  "garden",
  "mountain",
  "snow",
  "village",
];
export const NUMBER_NAME = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];
export const STICKER_BOOK = [
  "rewardsticker0000",
  "rewardsticker0001",
  "rewardsticker0002",
  "rewardsticker0003",
  "rewardsticker0004",
  "rewardsticker0005",
  "rewardsticker0006",
  "rewardsticker0007",
  "rewardsticker0008",
  "rewardsticker0009",
];
export const STICKER_REWARDS = [
  [
    "icecreamset_part1",
    "icecreamset_part2",
    "icecreamset_part3",
    "icecreamset_part4",
    "icecreamset_part5",
    "icecreamset_part6",
  ],
  [
    "bulldozer_part1",
    "bulldozer_part2",
    "bulldozer_part3",
    "bulldozer_part4",
    "bulldozer_part5",
    "bulldozer_part6",
  ],
  [
    "astronaut_part1",
    "astronaut_part2",
    "astronaut_part3",
    "astronaut_part4",
    "astronaut_part5",
    "astronaut_part6",
  ],
  [
    "house_part1",
    "house_part2",
    "house_part3",
    "house_part4",
    "house_part5",
    "house_part6",
  ],
  [
    "rocket_part1",
    "rocket_part2",
    "rocket_part3",
    "rocket_part4",
    "rocket_part5",
    "rocket_part6",
  ],
  [
    "taxi_part1",
    "taxi_part2",
    "taxi_part3",
    "taxi_part4",
    "taxi_part5",
    "taxi_part6",
  ],
  [
    "frock_part1",
    "frock_part2",
    "frock_part3",
    "frock_part4",
    "frock_part5",
    "frock_part6",
  ],
  [
    "guitar_part1",
    "guitar_part2",
    "guitar_part3",
    "guitar_part4",
    "guitar_part5",
    "guitar_part6",
  ],
  [
    "seasonset_part1",
    "seasonset_part2",
    "seasonset_part3",
    "seasonset_part4",
    "seasonset_part5",
    "seasonset_part6",
  ],
  [
    "shirt_part1",
    "shirt_part2",
    "shirt_part3",
    "shirt_part4",
    "shirt_part5",
    "shirt_part6",
  ],
];

export const SUBPACKAGES = "subpackages";

const numberMappings = {
  "+": "plus",
  "-": "minus",
  "&": "and",
  "=": "equals",
  x: "times",
};

export const enum TouchEvents {
  TOUCH_START = "touchstart",
  TOUCH_END = "touchend",
  TOUCH_MOVE = "touchmove",
  TOUCH_CANCEL = "touchCancel",
}

const DOWNLOAD_STARTED = "DOWNLOAED_STARTED";
const DOWNLOAD_SUCCESS = "DOWNLOAD_SUCCESS";
const DOWNLOAD_FAILED = "DOWNLOAD_FAILED";

export class Util {
  private static _i18NMap = new Map();
  private static _resources: string[] = [];
  static bundles: Map<string, cc.AssetManager.Bundle> = new Map();
  private static helpAudioId: number = -1;
  static chimp: dragonBones.ArmatureDisplay = null;

  public static shuffle<T>(arr): T[] {
    let ctr = arr.length;
    let temp;
    let index;
    while (ctr > 0) {
      index = Math.floor(Math.random() * ctr);
      ctr--;
      temp = arr[ctr];
      arr[ctr] = arr[index];
      arr[index] = temp;
    }
    return arr;
  }

  public static shuffleByMapSortMap<T>(unshuffled): T[] {
    return unshuffled
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);
  }

  public static randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  public static pickRandomElements(array, howManyElements: number) {
    const resultArray = [];
    for (let i = 0; i < howManyElements; i++) {
      let shuffledArray = Util.shuffle(array);
      let index = Math.floor(Math.random() * shuffledArray.length);
      resultArray.push(shuffledArray.splice(index, 1));
    }
    return resultArray;
  }

  public static initText(
    parentNode: cc.Node,
    textFont: cc.Font,
    text: string = "",
    fontSize: string = "10",
    fontColor: string = null,
    showLabel: boolean = true,
    adj: cc.Vec2 = new cc.Vec2(0, 0),
    horizontalAlign = HorizontalAlign.CENTER,
    verticalAlign = VerticalAlign.CENTER,
    anchorPoint: cc.Vec2 = new cc.Vec2(0.5, 0.5),
    outlineEnable: boolean = false,
    outlineWidth: number = 0
  ): cc.Node {
    const qLabelNode = new cc.Node(text);
    const label = qLabelNode.addComponent(ChimpleLabel);
    label.string = showLabel ? text : "";
    label.overflow = Overflow.NONE;
    let defaultFontColor: cc.Color = DEFAULT_FONT_COLOR;
    if (!!fontColor) {
      defaultFontColor = defaultFontColor.fromHEX(fontColor);
    }
    qLabelNode.color = defaultFontColor;
    const fSize: number = parseInt(fontSize);
    label.fontSize = fSize;
    label.horizontalAlign = horizontalAlign;
    label.verticalAlign = verticalAlign;
    label.lineHeight = fSize + 100;
    qLabelNode.setAnchorPoint(anchorPoint);
    // @ts-ignore
    qLabelNode.position = new cc.Vec2(adj.x, adj.y); // to align text with middle since in bigger font size it aligns down
    if (outlineEnable) {
      const outLine = qLabelNode.addComponent(cc.LabelOutline);
      outLine.width = outlineWidth;
    }
    parentNode.addChild(qLabelNode);
    return qLabelNode;
  }

  public static isBetweenRange(input: number, min: number, max: number) {
    return input >= min && input <= max;
  }

  public static chunk<T>(array: T[], chunkSize: number): T[] {
    const R = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      R.push(array.slice(i, i + chunkSize));
    }
    return R;
  }

  public static chunkByIncreaseSize<T>(
    array: T[],
    startChunkSize: number,
    increment: number
  ): T[] {
    const R = [];
    let chunkSize = startChunkSize;
    let counter = 1;
    for (let i = 0; i < array.length; i = chunkSize + counter * increment) {
      R.push(array.slice(i, i + chunkSize + counter * increment));
      counter++;
    }
    return R;
  }

  public static speakEquation(
    nums: Array<string>,
    callbackOnEnd: (index: number) => void
  ) {
    var index: number = 0;
    const audios = nums.map((val: string) => {
      let num: string =
        val in numberMappings ? numberMappings[val] : "d_" + val;
      num = !num.endsWith(".mp3") ? num + ".mp3" : num;
      return Config.dir + Profile.lang + "-help/" + NUMBER_VOICE + num;
    });
    this.speakOneByOne(audios, 0, callbackOnEnd);
  }

  public static speakOneByOne(
    audios: Array<string>,
    index: number,
    callbackOnEnd: (index: number) => void
  ) {
    this.speak(audios[index], () => {
      callbackOnEnd(index);
      if (++index < audios.length) {
        this.speakOneByOne(audios, index, callbackOnEnd);
      }
    });
  }

  public static speak(audio: string, callback: Function) {
    Util.load(
      audio,
      (err, clip) => {
        this.speakClip(clip, callback);
      },
      true
    );
  }

  public static loadAudioFromInternet(audio: string, callback: Function) {
    cc.assetManager.loadRemote(audio, (err, clip) => {
      if (clip && !err) {
        console.log("if (clip && !err) {", clip);
        //@ts-ignore
        this.speakClip(clip, callback);
      }
    });
  }

  public static speakClip(clip: cc.AudioClip, callback: Function) {
    if (clip != null) {
      if (Array.isArray(clip) && clip.length === 0) {
        callback();
      } else {
        const audioId = Util.play(clip, false);
        if (audioId != -1) {
          cc.audioEngine.setFinishCallback(audioId, callback);
        } else {
          callback();
        }
      }
    } else {
      callback();
    }
  }

  public static speakMusic(audio: string, callback: Function) {
    Util.load(
      audio,
      (err, clip) => {
        if (clip != null) {
          if (Array.isArray(clip) && clip.length === 0) {
            callback();
          } else {
            const audioId = cc.audioEngine.playMusic(clip, false);
            cc.audioEngine.setFinishCallback(audioId, callback);
          }
        } else {
          callback();
        }
      },
      true
    );
  }

  public static loadNumericSound(text: string, callBack: Function) {
    let fileName = `d_${text.toLowerCase()}`;
    fileName = fileName.endsWith(".mp3") ? fileName : fileName + ".mp3";
    const location = Config.dir + Profile.lang + "-help/" + NUMBER_VOICE;
    const fullFilePath = location + fileName;

    Util.load(
      fullFilePath,
      (err, clip) => {
        if (!err && clip !== null) {
          callBack(clip);
        } else {
          callBack(null);
        }
      },
      true
    );
  }

  public static loadsPhonicsOrLetter(audio: string, callback: Function) {
    audio = audio.replace(".m4a", "");
    audio = audio.endsWith(".mp3") ? audio : audio + ".mp3";
    const phonicsLoc = Config.dir + PHONIC_VOICE + audio;
    Util.load(
      phonicsLoc,
      (err, clip) => {
        if (!err && clip != null) {
          callback(clip);
        } else if (err != null) {
          const letterLoc = Config.dir + LETTER_VOICE + audio;
          Util.load(
            letterLoc,
            (err, clip) => {
              if (!err && clip != null) {
                callback(clip);
              } else if (err != null) {
                callback(null);
              }
            },
            true
          );
        }
      },
      true
    );
  }

  public static loadsLetter(audio: string, callback: Function) {
    audio = audio.replace(".m4a", "");
    audio = audio.endsWith(".mp3") ? audio : audio + ".mp3";
    const letterLoc = Config.dir + LETTER_VOICE + audio;
    Util.load(
      letterLoc,
      (err, clip) => {
        if (!err && clip != null) {
          callback(clip);
        } else if (err != null) {
          this.loadGameSound(audio, callback);
        }
      },
      true
    );
  }

  public static loadGameSound(path: string, callBack: Function) {
    const filePath = path.startsWith(Config.dir)
      ? path
      : Config.i.course.type != "literacy"
      ? Config.dir + `${Profile.lang}-help/${Config.i.game}/${path}`
      : Config.dir + `${Config.i.currentGameLessonId}/res/${path}`;
    const fullFilePath =
      filePath + (path.endsWith(".mp3") || path.endsWith(".m4a") ? "" : ".mp3");
    Util.load(
      fullFilePath,
      (err, clip) => {
        if (err) {
          cc.log(err);
        }
        if (!err && clip !== null) {
          callBack(clip);
        } else {
          callBack(null);
        }
      },
      true
    );
  }

  public static loadGameAudioOrPhonics(audio: string, callback: Function) {
    audio = audio.replace(".m4a", "");
    audio = !audio.endsWith(".mp3") ? audio + ".mp3" : audio;
    const phonicsLoc = Config.dir + PHONIC_VOICE + audio;
    Util.load(
      phonicsLoc,
      (err, clip) => {
        if (err != null && clip == null) {
          this.playGameSound(audio, callback);
        } else if (!err && clip != null) {
          callback(clip);
        } else {
          this.loadGameSound(audio, callback);
        }
      },
      true
    );
  }

  public static loadTexture(
    path: string,
    callBack: Function,
    needsRelease: boolean = true
  ) {
    path =
      path.endsWith(".png") || path.endsWith(".jpg") ? path : path + ".png";
    const fullFilePath = path.startsWith(Config.dir)
      ? path
      : Config.dir + `${Config.i.currentGameLessonId}/res/${path}`;
    Util.load(
      fullFilePath,
      (err, texture) => {
        if (!!texture && !err) {
          callBack(texture, err);
        } else if (err) {
          callBack(null);
        }
      },
      needsRelease
    );
  }

  public static flattenDeep<T>(arr) {
    return arr.reduce(
      (acc, val) =>
        Array.isArray(val)
          ? acc.concat(this.flattenDeep(val))
          : acc.concat(val),
      []
    );
  }

  public static randomElements(array, n) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, n);
    return selected;
  }

  public static takePictureFromCamera(callback) {
    jsb.reflection.callStaticMethod(
      "org/cocos2dx/javascript/AppActivity",
      "openCamera",
      "()V"
    );
    let checkCount = 10;
    let result = null;
    // return callback with image path
    return (async () => {
      while (checkCount > 0 && result == null) {
        result = await Util.checkCameraResult();
        checkCount--;
      }
      callback(result);
    })();
  }

  private static checkCameraResult(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(function () {
        let result = jsb.reflection.callStaticMethod(
          "org/cocos2dx/javascript/AppActivity",
          "checkCameraResult",
          "()Ljava/lang/String;"
        );
        resolve(result);
        console.log("Returned promise");
      }, 6000);
    });
  }

  public static shareText(text: string): void {
    try {
      if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
        return jsb.reflection.callStaticMethod(
          "org/chimple/bahama/AppActivity",
          "shareText",
          "(Ljava/lang/String;)V",
          text
        );
      }
    } catch (e) {}
  }

  public static getRandomPosition(array, removeTaken) {
    let randomIndex;
    let coordinates;
    randomIndex = Util.randomBetween(0, array.length - 1);
    coordinates = array[randomIndex];
    if (removeTaken) {
      array.splice(randomIndex, 1);
    }
    return coordinates;
  }

  public static generatePositionsArray(maxX, maxY, safeRadius, irregularity) {
    let positionsArray = [];
    let r, c;
    let rows;
    let columns;
    rows = Math.floor(maxY / safeRadius);
    columns = Math.floor(maxX / safeRadius);
    for (r = 1; r <= rows; r += 1) {
      for (c = 1; c <= columns; c += 1) {
        positionsArray.push({
          x:
            Math.round((maxX * c) / columns) +
            Util.randomBetween(irregularity * -1, irregularity) -
            maxX / 2 -
            50,
          y:
            Math.round((maxY * r) / rows) +
            Util.randomBetween(irregularity * -1, irregularity) -
            maxY / 2,
        });
      }
    }
    return positionsArray;
  }

  public static speakLetter(audio: string, callback: Function) {
    const letterLoc = Config.dir + LETTER_VOICE + audio;
    Util.load(
      letterLoc,
      (err, clip) => {
        if (!err && clip != null) {
          const audioId = Util.play(clip, false);
          if (audioId !== -1) {
            cc.audioEngine.setFinishCallback(audioId, callback);
          } else {
            callback();
          }
          cc.audioEngine.setFinishCallback(audioId, callback);
        } else if (err != null) {
          callback();
        }
      },
      true
    );
  }

  public static speakPhonicsOrLetter(audio: string, callback: Function) {
    audio = audio.replace(".m4a", "");
    audio = !audio.endsWith(".mp3") ? audio + ".mp3" : audio;
    const phonicsLoc = Config.dir + PHONIC_VOICE + audio;
    Util.load(
      phonicsLoc,
      (err, clip) => {
        if (!err && clip != null) {
          const audioId = Util.play(clip, false);
          if (audioId !== -1) {
            cc.audioEngine.setFinishCallback(audioId, callback);
          } else {
            this.speakLetter(audio, callback);
          }
          cc.audioEngine.setFinishCallback(audioId, callback);
        } else if (err != null) {
          this.speakLetter(audio, callback);
        }
      },
      true
    );
  }

  public static speakGameAudioOrPhonics(audio: string, callback: Function) {
    audio = audio.replace(".m4a", "");
    audio = !audio.endsWith(".mp3") ? audio + ".mp3" : audio;
    const phonicsLoc = Config.dir + PHONIC_VOICE + audio;
    Util.load(
      phonicsLoc,
      (err, clip) => {
        if (err != null && clip == null) {
          this.playGameSound(audio, callback);
        } else if (!err && clip != null) {
          const audioId = Util.play(clip, false);
          if (audioId !== -1) {
            cc.audioEngine.setFinishCallback(audioId, callback);
          } else {
            this.playGameSound(audio, callback);
          }
          cc.audioEngine.setFinishCallback(audioId, callback);
        }
      },
      true
    );
  }

  public static playGameSound(nameOfSound, callback: Function) {
    Util.loadGameSound(nameOfSound, function (clip) {
      if (clip != null) {
        const audioId = Util.play(clip, false);
        if (audioId != -1) {
          cc.audioEngine.setFinishCallback(audioId, () => {
            callback();
          });
        }
      } else {
        callback();
      }
    });
  }

  public static speakLettersOrWords(audio: string, callback: Function) {
    audio = audio.replace(".m4a", "");
    audio = !audio.endsWith(".mp3") ? audio + ".mp3" : audio;
    const letterLoc = Config.dir + LETTER_VOICE + audio;
    Util.loadGameSound(letterLoc, (clip) => {
      let audioId = -1;
      if (clip != null) {
        audioId = cc.audioEngine.play(clip, false, 1);
      }
      if (audioId >= 0) {
        cc.audioEngine.setFinishCallback(audioId, callback);
      } else {
        const wordLoc = Config.dir + Config.i.course.id + "/res/" + audio;
        Util.loadGameSound(wordLoc, (clip) => {
          if (clip != null) {
            audioId = cc.audioEngine.play(clip, false, 1);
          }
          if (audioId >= 0) {
            cc.audioEngine.setFinishCallback(audioId, callback);
          } else if (callback != null) {
            callback();
          }
        });
      }
    });
  }

  public static freeResources() {
    for (let i = this._resources.length - 1; i >= 0; i--) {
      try {
        cc.log("free resource ---->:", this._resources[i]);
        cc.resources.release(this._resources[i]);
      } catch (e) {}
      this._resources.splice(i, 1);
    }
    cc.log("resources left: --->", this._resources.length);
  }

  public static load(
    res: string,
    callback: Function,
    needsRelease: boolean = true
  ) {
    //loading if Profile.lang-help is not loaded
    if (!Util.bundles.get(Profile.lang + "-help")) {
      cc.assetManager.loadBundle(Profile.lang + "-help", (err, bundle) => {
        Util.bundles.set(Profile.lang + "-help", bundle);
      });
    }
    const resArray = res.split("/");
    const courseName = resArray[0];
    const lessonName = resArray[1];
    const resDir = resArray.slice(2).join("/");
    const resName = resDir.split(".")[0];
    const ext = resDir.split(".")[1];
    let bundle = this.bundles.get(
      lessonName == "course" ? courseName : lessonName
    );
    console.log(
      "Config.i.course.isCourseMapped ",
      Config.i.course?.isCourseMapped
    );
    if (!bundle && Config.i.course?.isCourseMapped) {
      console.log("LessonController.bundles", LessonController.bundles); // undefined
      LessonController.bundles.forEach((element) => {
        console.log("bundles ", element.name, this.bundles.get(element.name));
        bundle = this.bundles.get(element.name);
        if (ext === "mp3" || ext === "m4a") {
          bundle.load(resName, cc.AudioClip, function (err, asset) {
            if (err) {
              cc.log(JSON.stringify(err));
            }
            callback(err, asset);
          });
        } else if (ext === "png" || ext === "jpg") {
          bundle.load(resName, cc.Texture2D, function (err, asset) {
            if (err) {
              cc.log(JSON.stringify(err));
            }
            callback(err, asset);
          });
        } else {
          bundle.load(resName, (err, asset) => {
            if (err) {
              cc.log(JSON.stringify(err));
            }
            callback(err, asset);
          });
        }
      });
    }
    console.log("resArray", resArray); // sl_en1_mp,sl_en1_mp0000,res,sl_en1_mp0000.json
    console.log("courseName", courseName); // sl_en1_mp
    console.log("lessonName", lessonName); // sl_en1_mp0000
    console.log("resDir", resDir); // res/sl_en1_mp0000.json
    console.log("resName", resName); // res/sl_en1_mp0000
    console.log("bundle", bundle, Profile.lang + "-help"); // undefined
    console.log("this.bundles", this.bundles); // undefined
    if (ext === "mp3" || ext === "m4a") {
      bundle.load(resName, cc.AudioClip, function (err, asset) {
        if (err) {
          cc.log(JSON.stringify(err));
        }
        callback(err, asset);
      });
    } else if (ext === "png" || ext === "jpg") {
      bundle.load(resName, cc.Texture2D, function (err, asset) {
        if (err) {
          cc.log(JSON.stringify(err));
        }
        callback(err, asset);
      });
    } else {
      bundle.load(resName, (err, asset) => {
        if (err) {
          cc.log(JSON.stringify(err));
        }
        callback(err, asset);
      });
    }
  }

  public static removeAlli18NMapping() {
    Util._i18NMap.clear();
  }

  public static loadi18NMapping(callBack: Function) {
    let jsonFile = "lang/" + Profile.lang + "/i18n";
    cc.resources.load(jsonFile, (err, jsonAsset) => {
      if (!err && !!jsonAsset) {
        const data =
          jsonAsset instanceof cc.JsonAsset ? jsonAsset.json : jsonAsset;
        if (!!data) {
          Object.keys(data).forEach((key) => {
            let value = data[key];
            Util._i18NMap.set(key.toLowerCase(), value);
          });
        }
        callBack();
      } else {
        callBack();
      }
    });
  }

  public static loadDirectLessonWithLink(data: MicroLink, node: cc.Node) {
    const config = Config.i;
    config.loadSingleCourseJson(data.courseid, () => {
      // config.course = config.curriculum.get(data.courseid)
      // config.chapter = config.course.chapters.find((c) => c.id == data.chapterid)
      // config.lesson = config.chapter.lessons.find((l) => l.id == data.lessonid)

      config.course = {
        chapters: [],
        id: data.courseid,
        name: data.coursename,
        lang: data.courseid == "maths" ? "en" : data.courseid,
        type: data.courseid == "maths" ? "maths" : "literacy",
        levels: [],
        isCourseMapped: false,
      } as Course; //config.curriculum.get(data.courseid)

      config.chapter = {
        id: data.chapterid,
        lessons: [],
        name: data.chaptername,
        image: "string",
        color: "string",
        course: config.course,
      } as Chapter;

      config.lesson = {
        id: data.lessonid,
        image: "string",
        name: data.lessonname,
        open: true,
        type: "string",
        skills: [],
        color: "string",
        chapter: config.chapter,
        assignmentId: data.assignmentid,
        mlPartnerId: data.mlpartnerid,
        mlClassId: data.mlclassid,
        mlStudentId: data.mlstudentid,
        orig_chapter_id: undefined,
        orig_course_id: undefined,
        orig_lesson_id: undefined,
      } as Lesson;

      config.lesson.assignmentId = data.assignmentid || null;
      config.lesson.mlPartnerId = data.mlpartnerid || null;
      config.lesson.mlClassId = data.mlclassid || null;
      config.lesson.mlStudentId = data.mlstudentid || null;
      config.microLinkData = data;
      LessonController.preloadLesson(node, (err: Error) => {
        if (err) {
          console.log(err);
        } else {
          Config.loadScene("common/scenes/lessonController");
        }
      });
    });
  }

  public static loadLesson(
    lesson: Lesson,
    loading: cc.Node,
    thisNode: cc.Node
  ) {
    const config = Config.i;
    config.course = lesson.chapter.course;
    config.chapter = lesson.chapter;
    config.lesson = lesson;
    loading.getComponent(Loading).allowCancel = true;
    loading.active = true;
    LessonController.preloadLesson(thisNode, (err: Error) => {
      if (err) {
        loading
          .getComponent(Loading)
          .addMessage(
            Util.i18NText(
              "Error downloading content. Please connect to internet and try again"
            ),
            true,
            true
          );
      } else {
        if (loading && loading.activeInHierarchy) {
          config.pushScene("common/scenes/lessonController");
        }
      }
    });
  }

  public static i18NText(key: string) {
    if (typeof key === "string") {
      return Util._i18NMap.has(key.toLowerCase())
        ? Util._i18NMap.get(key.toLowerCase())
        : key;
    }
    return key;
  }

  public static i18NNumberConvert(
    lbString: string,
    startWithDigit: boolean = true
  ) {
    let regExCondition = startWithDigit
      ? /^\d/.test(lbString)
      : /\d/.test(lbString);
    if (regExCondition) {
      let numbers: string[] = lbString.split("");
      numbers = numbers.map((n) => Util.i18NText(n));
      console.log("converted ", Util.i18NText(numbers.join("")));
      return Util.i18NText(numbers.join(""));
    } else {
      return lbString;
    }
  }

  public static showHelp(
    from: cc.Node,
    to: cc.Node,
    callBack: Function = null,
    playAudio: boolean = true,
    showHelpHand: boolean = false
  ) {
    const config = Config.getInstance();
    const lessonNode = cc.Canvas.instance.node;
    if (playAudio) {
      LessonController.friend.speakHelp();
    }
    if ((config.problem == 1 || showHelpHand) && from != null && to != null) {
      cc.resources.load("prefabs/help", function (err, prefab) {
        if (!err) {
          const help = cc.instantiate(prefab);
          // @ts-ignore
          const helpComp = help.getComponent(Help);
          if (helpComp != null) {
            helpComp.initNodes(from, to, callBack);
          } else {
            if (callBack != null) callBack();
          }
          // @ts-ignore
          lessonNode.addChild(help);
        } else {
          if (callBack != null) callBack();
        }
      });
    } else {
      if (callBack != null) callBack();
    }
  }

  public static computeTimeDiff(
    append: string,
    startDate: Date = new Date(),
    endDate: Date = new Date()
  ) {
    let diff = endDate.getTime() - startDate.getTime();
    cc.log(`${append} -> computeTimeDiff in milliseconds ${diff}`);
  }

  public static *shuffleGenerator(array) {
    let i = array.length;
    while (i--) {
      yield array.splice(Math.floor(Math.random() * (i + 1)), 1)[0];
    }
  }

  public static loadFriend(callback: Function, char = null) {
    if (char == null) {
      const user = User.getCurrentUser();
      char = user ? user.currentCharacter : "chimp";
    }
    cc.resources.load("prefabs/friend/" + char, (err, prefab) => {
      if (err != null) cc.log(err);
      const friendNode = prefab != null ? cc.instantiate(prefab) : null;
      if (callback != null) callback(friendNode);
    });
  }

  public static loadAccessoriesAndEquipAcc(
    accessoriesNode: cc.Node,
    friendNode: cc.Node
  ): dragonBones.ArmatureDisplay {
    if (User.getCurrentUser()) {
      accessoriesNode.x = 10 * cc.winSize.width;
      let accArmature: dragonBones.ArmatureDisplay;
      for (let i = 0; i < INVENTORY_DATA.length; i++) {
        accArmature = accessoriesNode.children[i].getComponent(
          dragonBones.ArmatureDisplay
        );
        for (let j = 0; j < INVENTORY_DATA[i].length; j++) {
          accArmature.armatureName = INVENTORY_DATA[i][j].split("-")[1];
        }
      }
      Util.equipAcc(friendNode);
      return accArmature;
    } else {
      accessoriesNode.active = false;
    }
  }

  public static equipAcc(friendNode: cc.Node) {
    let factory = dragonBones.CCFactory.getInstance();
    let _armature = friendNode.getComponent(Friend).db.armature();
    INVENTORY_SAVE_CONSTANTS.forEach((key) => {
      let characterAndSlot = User.getCurrentUser().currentCharacter.concat(
        "-",
        key
      );
      var newHatName = User.getCurrentUser().inventory[characterAndSlot];
      if (newHatName != undefined && !!_armature) {
        _armature.getSlot(key).childArmature =
          factory.buildArmature(newHatName);
        if (key === "left_shoe") {
          _armature.getSlot("right_shoe").childArmature =
            factory.buildArmature(newHatName);
        }
      }
    });
  }

  public static playSfx(
    audioClip: cc.AudioClip,
    isMusic: boolean = false,
    loop: boolean = false
  ): number {
    if (Profile.getItem(SFX_OFF) == 0) {
      try {
        return isMusic
          ? cc.audioEngine.playMusic(audioClip, loop)
          : cc.audioEngine.playEffect(audioClip, loop);
      } catch (e) {}
    }
    return -1;
  }

  public static stopHelpAudio() {
    try {
      cc.audioEngine.stopEffect(this.helpAudioId);
      if (this.chimp) this.chimp.playAnimation("idle", 1);
    } catch (e) {
      cc.log(e);
    }
    return this.helpAudioId;
  }

  public static play(audioClip: cc.AudioClip, loop: boolean = false) {
    let audioId = -1;
    try {
      if (audioClip) {
        audioId = cc.audioEngine.playEffect(audioClip, loop);
      }
    } catch (e) {
      cc.log(e);
    }
    return audioId;
  }

  public static getSubpackages(): Array<string> {
    const subpackages = JSON.parse(cc.sys.localStorage.getItem(SUBPACKAGES));
    return subpackages ? subpackages : [];
  }

  public static addSubpackage(subpackage: string) {
    const subpackages = this.getSubpackages();
    subpackages.push(subpackage);
    cc.sys.localStorage.setItem(SUBPACKAGES, JSON.stringify(subpackages));
  }

  public static downloadIfNeeded(
    node: cc.Node,
    course: string,
    lesson: string,
    callbackOnExists: Function
  ) {
    const storageDir = course;
    const manifestPath = storageDir + "/" + lesson;
    const testFile = manifestPath + "/res/" + lesson + ".json";

    if (
      cc.sys.isNative &&
      cc.sys.os == cc.sys.OS_ANDROID &&
      ASSET_LOAD_METHOD === "file" &&
      !jsb.fileUtils.isFileExist(testFile)
    ) {
      UtilLogger.downloadFile(`${COURSES_URL}${manifestPath}.zip`, storageDir);
      const callback = () => {
        cc.log(
          `calling checkIfUrlDownloaded ${COURSES_URL}${manifestPath}.zip`
        );
        const isFileDownloaded = UtilLogger.checkIfUrlDownloaded(
          `${COURSES_URL}${manifestPath}.zip`,
          storageDir
        );
        if (
          isFileDownloaded == DOWNLOAD_FAILED ||
          isFileDownloaded == DOWNLOAD_SUCCESS
        ) {
          cc.director.getScheduler().unschedule(callback, node);
          if (isFileDownloaded == DOWNLOAD_SUCCESS) {
            Util.addSubpackage(manifestPath);
            callbackOnExists(true);
          } else {
            callbackOnExists(false);
          }
        }
      };
      cc.director.getScheduler().schedule(callback, node, 1);
    } else {
      callbackOnExists(true);
    }
  }

  public static assignHomework(
    chapterId: string,
    lessonId: string,
    schoolId: string,
    sectionId: string,
    subjectId: string,
    studentId: string = null
  ) {
    let updateInfo: AssignHomeWorkInfo = {
      chapterId: chapterId,
      lessonId: lessonId,
      kind: "AssignHomeWork",
      schoolId: schoolId,
      studentId: studentId,
      subjectId: subjectId,
      sectionId: sectionId,
    };
    return updateInfo;
  }

  public static removeDuplicateMessages(data: any, messageType: string): any[] {
    const messages = cc.sys.localStorage.getItem(messageType) || "[]";
    let jsonMessages: any[] = JSON.parse(messages);
    if (!!data) {
      jsonMessages.push(data);
    }
    cc.log("requests", JSON.stringify(jsonMessages));
    return jsonMessages;
  }

  public static unlockNextReward(): string {
    const user = User.getCurrentUser();
    const unlockedRewards = user.unlockedRewards;
    const nextCharIndex = REWARD_CHARACTERS.findIndex(
      (char) => !unlockedRewards[`${REWARD_TYPES[0]}-${char}`]
    );

    if (nextCharIndex == 0) {
      //first inventory of first character
      const split = INVENTORY_DATA[0][0].split("-");
      user.unlockRewardsForItem(
        `${REWARD_TYPES[0]}-${REWARD_CHARACTERS[0]}`,
        1
      );
      user.currentCharacter = REWARD_CHARACTERS[0];
      user.updateInventory(`${REWARD_CHARACTERS[0]}-${split[0]}`, split[1]);
      user.unlockRewardsForItem(
        `${REWARD_TYPES[3]}-${REWARD_CHARACTERS[0]}-${INVENTORY_DATA[0][0]}`,
        1
      );
      return `${REWARD_TYPES[3]}-${REWARD_CHARACTERS[0]}-${INVENTORY_DATA[0][0]}`;
    } else {
      const currentCharIndex =
        nextCharIndex == -1 ? REWARD_CHARACTERS.length - 1 : nextCharIndex - 1;
      const currentChar = REWARD_CHARACTERS[currentCharIndex];
      var remainingInventory: string[] = [];
      INVENTORY_DATA.forEach(
        (val) => (remainingInventory = remainingInventory.concat(val))
      );
      const allInventoryCount = remainingInventory.length;
      remainingInventory = remainingInventory.filter(
        (val) =>
          !(`${REWARD_TYPES[3]}-${currentChar}-${val}` in unlockedRewards)
      );
      if (remainingInventory.length == 0) {
        if (currentCharIndex + 1 < REWARD_CHARACTERS.length) {
          //finished all inventory for current char. unlock next char
          // user.currentCharacter = REWARD_CHARACTERS[currentCharIndex + 1]
          user.unlockRewardsForItem(
            `${REWARD_TYPES[0]}-${REWARD_CHARACTERS[currentCharIndex + 1]}`,
            1
          );
          return `${REWARD_TYPES[0]}-${
            REWARD_CHARACTERS[currentCharIndex + 1]
          }`;
        } else {
          //ran out of rewards
          return null;
        }
      } else {
        if (
          remainingInventory.length < allInventoryCount / 2 &&
          !(
            `${REWARD_TYPES[1]}-${REWARD_BACKGROUNDS[currentCharIndex]}` in
            unlockedRewards
          )
        ) {
          // we have unlocked half inventory for char. now unlock background
          // user.currentBg = REWARD_BACKGROUNDS[currentCharIndex]
          user.unlockRewardsForItem(
            `${REWARD_TYPES[1]}-${REWARD_BACKGROUNDS[currentCharIndex]}`,
            1
          );
          return `${REWARD_TYPES[1]}-${REWARD_BACKGROUNDS[currentCharIndex]}`;
        } else {
          // give an inventory for current character
          const inventoryItem =
            remainingInventory[
              Math.floor(Math.random() * remainingInventory.length)
            ];
          const split = inventoryItem.split("-");
          // user.updateInventory(`${REWARD_CHARACTERS[currentCharIndex]}-${split[0]}`, split[1]);
          user.unlockRewardsForItem(
            `${REWARD_TYPES[3]}-${REWARD_CHARACTERS[currentCharIndex]}-${inventoryItem}`,
            1
          );
          return `${REWARD_TYPES[3]}-${REWARD_CHARACTERS[currentCharIndex]}-${inventoryItem}`;
        }
      }
    }
  }

  static preloadStartScene(node: cc.Node, loading: cc.Node) {
    const loadingComp = loading.getComponent(Loading);
    loadingComp.allowCancel = false;

    loading.active = true;
    Config.i.loadCourseJsons(User.getCurrentUser(), node, () => {
      cc.assetManager.loadBundle("menu", (err, loadedBundle) => {
        Config.i.startAction = StartAction.Start;
        loadedBundle.preloadScene("menu/start/scenes/start", (err) => {
          Config.i.pushScene("menu/start/scenes/start", "menu", null);
        });
      });
    });
  }

  static loadImage(photoNode: cc.Node, imageUrl: string, saveAs: string) {
    ParseImageDownloader.loadImageForSchool(imageUrl, saveAs, (texture) => {
      if (!!texture && photoNode) {
        let spriteFrame: cc.SpriteFrame = new cc.SpriteFrame(texture);
        const photo: cc.Node = photoNode.getChildByName("photo");
        if (photo) {
          const maskNode: cc.Node = photo.getChildByName("mask");
          if (maskNode) {
            const image: cc.Node = maskNode.getChildByName("image");
            image.getComponent(cc.Sprite).spriteFrame = spriteFrame;
          }
        }
      }
    });
  }

  public static getHash(input) {
    let hash = 0,
      len = input ? input.length : 0;
    for (let i = 0; i < len; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0; // to 32bit integer
    }
    return hash;
  }

  public static resizeSprite(
    sprite: cc.Sprite,
    width: number,
    height: number,
    max: number = 1
  ) {
    const { scale, size } = Util.minScale(sprite, width, height, max);
    sprite.node.width = scale * size.width;
    sprite.node.height = scale * size.height;
  }

  public static minScale(
    sprite: cc.Sprite,
    width: number,
    height: number,
    max: number = 1
  ) {
    const size = sprite.spriteFrame.getOriginalSize();
    const xScale = width / size.width;
    const yScale = height / size.height;
    const scale = Math.min(xScale, yScale, max);
    return { scale, size };
  }

  public static setBackground(bgprefabName: string, node: cc.Node) {
    cc.resources.load(`backgrounds/prefabs/${bgprefabName}`, (err, sp) => {
      let bgPrefabInstance = cc.instantiate(sp);
      // @ts-ignore
      bgPrefabInstance.y = 0;
      // @ts-ignore
      bgPrefabInstance.x = 0;
      // @ts-ignore
      node.addChild(bgPrefabInstance);
    });
  }
}
