import Config, { Lang, LANG_CONFIGS } from "./common/scripts/lib/config";
import Profile, {
  CURRENTMODE,
  Gender,
  User,
} from "./common/scripts/lib/profile";
import {
  Mode,
  IS_REMEMBER_TOGGLE_ON,
  REMEMBERED_USER,
} from "./common/scripts/lib/constants";
import UtilLogger from "./common/scripts/util-logger";
import { Util } from "./common/scripts/util";
import {
  APIMode,
  ServiceConfig,
} from "./common/scripts/services/ServiceConfig";
import { AcceptTeacherRequest } from "./common/scripts/services/ServiceApi";

const { ccclass, property } = cc._decorator;

export const CHIMPLE_MODE = "CHIMPLE_MODE";
export const DEPLOY_MODE = "DEPLOY_MODE";

export const BASE: string = "BASE";
export const HOME: string = "HOME";
export const SCHOOL: string = "SCHOOL";
export const REGISTER: string = "REGISTER";
export const NONE: string = "NONE";

export const REJECT_TEACHER_REQUEST: string = "reject_teacher_request";
export const ACCEPT_TEACHER_REQUEST: string = "accept_teacher_request";
export const ACCEPT_TEACHER_REQUEST_LINKED_USED: string =
  "accept_teacher_request_used";
export const TEACHER_ADDED: string = "teacher_added";
export const RECEIVED_TEACHER_REQUEST: string = "received_teacher_request";
export const MICROLINK = "microlink";
export const TEACHER_ID_KEY = "id";
export const TEACHER_NAME_KEY = "name";
export const TEACHER_SECTION_ID = "sectionid";
export const TEACHER_ADD_STUDENT_ID = "studentid";
export const ASSIGN_HOMEWORK: string = "assign_homework";
export const ASSIGNMENT_ID_KEY_FOR_ASSIGN_HW = "aid";
export const STUDENT_ASSIGNMENT_ID_KEY = "sid";
export const TEACHER_ID_KEY_FOR_ASSIGN_HW = "tid";
export const CHAPTER_ID_KEY_FOR_ASSIGN_HW = "cid";
export const LESSON_ID_KEY_FOR_ASSIGN_HW = "lid";

export const LANDING_SCENE = "private/school/scenes/landing";
export const HOME_SCENE = "menu/home/scenes/home";
export const START_SCENE = "menu/start/scenes/start";

class UpdateConfig {
  storagePath: string = null;
  manifestUrl: string = null;
}

export enum UpdateEvent {
  Checking,
  Updating,
  UpdateDone,
  Done,
  Error,
}

export const PROJECT_MANIFEST = "project.manifest";
export const DO_HOT_UPDATE = false;

export let RECEIVED_TEACHER_REQUESTS: boolean = false;

//@ts-ignore
cc.deep_link = function (url) {
  cc.log("deep link called with url:" + url);
  if (url !== null && url.includes("://chimple.cc/")) {
    let messageType: string = null;
    let splits = url.split("://chimple.cc/");
    if (splits !== null && splits.length === 2) {
      let elements = splits[1].split("?");
      if (elements && elements.length === 2) {
        messageType = elements.splice(0, 1)[0];
        if (
          messageType.includes(RECEIVED_TEACHER_REQUEST) ||
          messageType.includes(MICROLINK)
        ) {
          const items = elements[0].split(/[&=]+/);
          let data = Object.assign({});
          if (items !== null && items.length % 2 === 0) {
            let all_keys = items;
            let all_values = [];
            for (let i = 0; i < items.length; i++) {
              all_values.push(all_keys.splice(i + 1, 1)[0]);
            }
            let mappings = all_keys.map(function (e, i) {
              return [e, all_values[i]];
            });

            mappings.forEach((arr) => {
              if (arr && arr.length === 2) {
                data[arr[0].toLowerCase()] = arr[1];
              }
            });
          }
          if (messageType.includes(MICROLINK)) {
            Config.isMicroLink = true;
            const jsonMessages: any[] = Util.removeDuplicateMessages(
              data,
              messageType
            );
            cc.sys.localStorage.setItem(
              messageType,
              JSON.stringify(jsonMessages)
            );
          }
          try {
            cc.log("RECEIVED_TEACHER_REQUEST", JSON.stringify(data));
            const jsonMessages: any[] = Util.removeDuplicateMessages(
              data,
              messageType
            );
            if (messageType.includes(RECEIVED_TEACHER_REQUEST)) {
              UtilLogger.logChimpleEvent(RECEIVED_TEACHER_REQUEST, data);
              cc.sys.localStorage.setItem(
                messageType,
                JSON.stringify(jsonMessages)
              );
              RECEIVED_TEACHER_REQUESTS = true;
            }
          } catch (e) {}
        }
        cc.log(
          "saved into local storage:" + cc.sys.localStorage.getItem(messageType)
        );
      }
    }
  }
};

@ccclass
export default class Chimple extends cc.Component {
  @property(cc.Label)
  status: cc.Label = null;

  @property(cc.ProgressBar)
  fileProgress: cc.ProgressBar = null;

  @property({
    type: cc.Asset,
  })
  manifest: cc.Asset = null;

  async onLoad() {
    if (cc.sys.isNative)
      jsb.fileUtils.setSearchPaths([
        jsb.fileUtils.getWritablePath() + "HotUpdateSearchPaths",
        "@assets/",
      ]);
    const capacitor = (window as any).Capacitor;
    if (
      capacitor &&
      typeof capacitor.getPlatform === "function" &&
      capacitor.getPlatform() === "android"
    ) {
      cc.log("platform is android");
    }
    const params = location.href.split("?")[1]?.split("&") ?? [];
    const urlParams = {};
    for (let param of params) {
      urlParams[param.split("=")[0]] = param.split("=")[1];
    }
    cc.log("urlParams", urlParams);
    if (
      urlParams["courseid"] != null &&
      urlParams["chapterid"] != null &&
      urlParams["lessonid"] != null
    ) {
      const input = {
        courseid: urlParams["courseid"],
        chapterid: urlParams["chapterid"],
        lessonid: urlParams["lessonid"],
      };
      console.log("input", input);
      Config.isMicroLink = true;
      Util.loadDirectLessonWithLink(input, this.node);
      Util.loadi18NMapping(() => {});
      return;
    }
    // if (CC_JSB) {
    //     // @ts-ignore
    //     cc.assetManager.cacheManager.cachedFiles.forEach((val, key) => {
    //         cc.log('removeCache: ' + key)
    //         // @ts-ignore
    //         cc.assetManager.cacheManager.removeCache(key)
    //     })
    // }
    cc.debug.setDisplayStats(false);
    ServiceConfig.getInstance(APIMode.FIREBASE);
    cc.macro.ENABLE_MULTI_TOUCH = false;
    UtilLogger.initPluginFirebase();
    Util.loadi18NMapping(() => {});

    const lang = Profile.lang || Lang.ENGLISH;
    const langConfig = LANG_CONFIGS.get(lang);
    if (langConfig) Config.i.loadFontDynamically(langConfig.font);
    UtilLogger.init();

    const teachersAdded: AcceptTeacherRequest[] = JSON.parse(
      cc.sys.localStorage.getItem(TEACHER_ADDED) || "[]"
    );
    if (teachersAdded && teachersAdded.length > 0) {
      teachersAdded.forEach((t) =>
        UtilLogger.logChimpleEvent(TEACHER_ADDED, t)
      );
    }

    if (!cc.sys.isNative || !DO_HOT_UPDATE) {
      this.selectModes();
      return;
    }
    const updates = [
      {
        storagePath: "HotUpdateSearchPaths",
        manifestUrl: this.manifest.nativeUrl,
      },
    ];
    const subpackages = Util.getSubpackages().map((val) => {
      return {
        storagePath: subpackages + "/" + val,
        manifestUrl: val + "/project.manifest",
      };
    });
    // updates.push(...subpackages) //TODO do this in background
    var doRestart = false;
    cc.log("Hot Update");
    this.oneByOne(updates, 0, (index: number, restart: boolean) => {
      doRestart = doRestart || restart;
      if (index == updates.length - 1) {
        if (doRestart) {
          cc.audioEngine.stopAll();
          if (CC_JSB) {
            // @ts-ignore
            cc.assetManager.cacheManager.cachedFiles.forEach((val, key) => {
              cc.log("removeCache: " + key);
              // if(val!= null && val.bundle == 'en0000')
              // @ts-ignore
              cc.assetManager.cacheManager.removeCache(key);
            });
          }
          cc.game.restart();
        } else {
          this.selectModes();
        }
      }
    });
  }

  selectModes() {
    let mode = parseInt(Profile.getValue(CURRENTMODE));
    const modes: number = mode; //MODE;
    switch (modes) {
      case Mode.Home:
        // send to welcomePage.ts
        Config.i.pushScene(
          "private/home/loginnew/scenes/welcomePage",
          "private",
          null,
          true
        );
        break;
      case Mode.School:
        if (cc.sys.localStorage.getItem(REMEMBERED_USER) != null)
          Config.i.pushScene(
            "private/school/scenes/currentLoggedUser",
            "private",
            null,
            true
          );
        else
          Config.i.pushScene(
            "private/school/scenes/sectionList",
            "private",
            null,
            true
          );
        break;
      default:
        Config.i.pushScene(
          "private/home/loginnew/scenes/welcomeScene",
          "private",
          null,
          true
        );
    }
  }

  public static navigateToHome() {
    Config.i.pushScene(
      "private/home/loginnew/scenes/homeLoginScene",
      "private",
      null,
      true
    );
  }

  private navigateToBase() {
    const existingUsers = User.getUsers();
    if (existingUsers == null || existingUsers.length <= 0) {
      User.createUser("test", "", 5, Gender.GIRL, "test", "armydog");
    }
    User.setCurrentUser(User.getUsers()[0]);
    Config.i.pushScene("menu/start/scenes/start", "menu", null, true);
  }

  oneByOne(
    updates: Array<UpdateConfig>,
    index: number,
    callbackOnEnd: (index: number, restart: boolean) => void
  ) {
    Chimple.doHotUpdate(
      updates[index].storagePath,
      updates[index].manifestUrl,
      null,
      (event, status, percent) => {
        this.status.string = status;
        this.fileProgress.progress = percent;
        if (
          event == UpdateEvent.Done ||
          event == UpdateEvent.UpdateDone ||
          event == UpdateEvent.Error
        ) {
          callbackOnEnd(
            index,
            event == UpdateEvent.UpdateDone &&
              updates[index].storagePath == "HotUpdateSearchPaths"
          );
          if (++index < updates.length) {
            this.oneByOne(updates, index, callbackOnEnd);
          }
        }
      }
    );
  }

  static doHotUpdate(
    storagePath: string,
    manifestUrl: string,
    manifestJson: string,
    callback: Function
  ) {
    const fullStoragePath =
      (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + storagePath;
    const am = new jsb.AssetsManager(
      "",
      fullStoragePath,
      (versionA: string, versionB: string) => {
        return Number(versionA) - Number(versionB);
      }
    );

    am.setVerifyCallback((path, asset) => {
      //todo: seems like always returns true
      // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
      const compressed = asset.compressed;
      // Retrieve the correct md5 value.
      const expectedMD5 = asset.md5;
      // asset.path is relative path and path is absolute.
      const relativePath = asset.path;
      // The size of asset file, but this value could be absent.
      const size = asset.size;
      if (compressed) {
        callback(
          UpdateEvent.Checking,
          "Verification passed : " + relativePath,
          0
        );
        return true;
      } else {
        callback(
          UpdateEvent.Checking,
          "Verification passed : " + relativePath + " (" + expectedMD5 + ")",
          0
        );
        return true;
      }
    });

    callback(
      UpdateEvent.Checking,
      "Hot update is ready, please check or directly update",
      0
    );
    if (cc.sys.os === cc.sys.OS_ANDROID) {
      // Some Android device may slow down the download process when concurrent tasks is too much.
      // The value may not be accurate, please do more test and find what's most suitable for your game.
      // @ts-ignore
      am.setMaxConcurrentTask(2);
      callback(
        UpdateEvent.Checking,
        "Max concurrent tasks count have been limited to 2",
        0
      );
    }

    callback(UpdateEvent.Checking, "Checking or updating ...", 0);
    if (am.getState() === jsb.AssetsManager.State.UNINITED) {
      if (manifestUrl) {
        // Resolve md5 url
        var url = manifestUrl;
        if (cc.loader.md5Pipe) {
          url = cc.loader.md5Pipe.transformURL(url);
        }
        am.loadLocalManifest(url);
      } else {
        const manifest = new jsb.Manifest(manifestJson, fullStoragePath);
        am.loadLocalManifest(manifest, fullStoragePath);
      }
    }
    if (!am.getLocalManifest() || !am.getLocalManifest().isLoaded()) {
      callback(UpdateEvent.Error, "Failed to load local manifest ...", 0);
    }
    am.setEventCallback((event) => {
      switch (event.getEventCode()) {
        case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
          am.setEventCallback(null);
          callback(
            UpdateEvent.Error,
            "No local manifest file found, hot update skipped",
            0
          );
          break;
        case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
        case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
          am.setEventCallback(null);
          callback(
            UpdateEvent.Error,
            "Fail to download manifest file, hot update skipped",
            0
          );
          break;
        case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
          am.setEventCallback(null);
          callback(
            UpdateEvent.Done,
            "Already up to date with the latest remote version",
            0
          );
          break;
        case jsb.EventAssetsManager.NEW_VERSION_FOUND:
          callback(
            UpdateEvent.Checking,
            "New version found, please try to update",
            0
          );
          am.setEventCallback(null);
          if (am) {
            am.setEventCallback((event) => {
              switch (event.getEventCode()) {
                case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                  am.setEventCallback(null);
                  callback(
                    UpdateEvent.Error,
                    "No local manifest file found, hot update skipped",
                    0
                  );
                  break;
                case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                  var msg = event.getMessage();
                  callback(UpdateEvent.Updating, msg, event.getPercentByFile());
                  break;
                case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                  am.setEventCallback(null);
                  callback(
                    UpdateEvent.Error,
                    "No local manifest file found, hot update skipped",
                    0
                  );
                  break;
                case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                  am.setEventCallback(null);
                  callback(
                    UpdateEvent.Done,
                    "Already up to date with the latest remote version",
                    0
                  );
                  break;
                case jsb.EventAssetsManager.UPDATE_FINISHED:
                  am.setEventCallback(null);
                  callback(
                    UpdateEvent.UpdateDone,
                    "Update finished. " + event.getMessage(),
                    1
                  );
                  break;
                case jsb.EventAssetsManager.UPDATE_FAILED:
                  am.setEventCallback(null);
                  callback(
                    UpdateEvent.Error,
                    "Update failed. " + event.getMessage(),
                    0
                  );
                  break;
                case jsb.EventAssetsManager.ERROR_UPDATING:
                  am.setEventCallback(null);
                  callback(
                    UpdateEvent.Error,
                    "Asset update error: " +
                      event.getAssetId() +
                      ", " +
                      event.getMessage(),
                    0
                  );
                  break;
                case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                  am.setEventCallback(null);
                  callback(UpdateEvent.Error, event.getMessage(), 0);
                  break;
                default:
                  break;
              }
            });
            am.update();
          }
          break;
        default:
          return;
      }
    });
    am.checkUpdate();
  }
}
