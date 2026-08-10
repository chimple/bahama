import { ASSET_LOAD_METHOD, firebaseConfigWeb, FIREBASE_SCHOOL_ID, FIREBASE_SECTION_ID, FIREBASE_STUDENT_ID, Mode, Student } from "./lib/constants";
import Profile, { CURRENTMODE, Last5LessonsItem, LessonProgressClass, User } from "./lib/profile";
import { AcceptTeacherRequest, CustomAuthInfo } from "./services/ServiceApi";
import { ACCEPT_TEACHER_REQUEST } from "../../chimple";
import Config from "./lib/config";

const LOGGER_CLASS = "org/chimple/bahama/logger/ChimpleLogger";

const LOGGER_METHOD = "logEvent";
const LOGGER_METHOD_SIGNATURE = "(Ljava/lang/String;)V";

const SET_USER_ID_METHOD = "setUserIdEvent";
const SET_USER_ID_SIGNATURE = "(Ljava/lang/String;)V";

const SET_USER_PROPERTY_METHOD = "setUserPropertiesEvent";
const SET_USER_PROPERTY_SIGNATURE = "(Ljava/lang/String;Ljava/lang/String;)V";

const PROFILE_METHOD = "logProfile";
const PROFILE_METHOD_SIGNATURE = "(Ljava/lang/String;Ljava/lang/String;)V";

const DOWNLOAD_FILE_METHOD = "downloadFile";
const DOWNLOAD_FILE_METHOD_SIGNATURE =
    "(Ljava/lang/String;Ljava/lang/String;)V";

const FILE_EXISTS_IN_PUBLIC_DIRECTORY_METHOD = "isFileExistsInPublicDirectory";
const FILE_EXISTS_IN_PUBLIC_DIRECTORY_METHOD_SIGNATURE = "(Ljava/lang/String;)Z";

const FILE_EXISTS_METHOD = "isFileExists";
const FILE_EXISTS_METHOD_SIGNATURE = "(Ljava/lang/String;)Z";

const CHECK_URL_DOWNLOADED_METHOD = "checkIfUrlDownloaded";
const CHECK_URL_DOWNLOADED_METHOD_SIGNATURE =
    "(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;";

const IS_NETWORK_AVAILABLE_METHOD = "isNetworkAvailable";
const IS_NETWORK_AVAILABLE_METHOD_SIGNATURE = "()Z";

const GET_STORAGE_DIRECTORY = "getStorageDirectory";
const GET_STORAGE_DIRECTORY_METHOD_SIGNATURE = "()Ljava/lang/String;";

const CURRENT_PROFILE_METHOD = "currentStudentId";
const CURRENT_PROFILE_METHOD_SIGNATURE = "()Ljava/lang/String;";

const GET_COUNTRY_CODE_METHOD = "getCountryCode";
const GET_COUNTRY_CODE_METHOD_SIGNATURE = "()Ljava/lang/String;";

const DEVICE_ID_METHOD = "getDeviceId";
const DEVICE_ID_METHOD_SIGNATURE = "()Ljava/lang/String;";

const LAUNCH_YOUTUBE_METHOD = "launchYoutube";
const LAUNCH_YOUTUBE_METHOD_SIGNATURE = "(Ljava/lang/String;)V";

const REQUEST_OTP_METHOD = "requestOtp";
const REQUEST_OTP_METHOD_SIGNATURE = "(Ljava/lang/String;)V";

const VERIFY_OTP_METHOD = "verifyOtp";
const VERIFY_OTP_METHOD_SIGNATURE = "(Ljava/lang/String;)V";

const SYNC_FMC_METHOD = "syncFmcForUsers";
const SYNC_FMC_METHOD_SIGNATURE = "(Ljava/lang/String;)V";

const SUBSCRIBE_TOPIC_METHOD = "subscribeToTopic";
const SUBSCRIBE_TOPIC_METHOD_SIGNATURE = "(Ljava/lang/String;)V";

const INITIALIZED = "init";
const INITIALIZED_MEHTOD_SIGNATURE = "()V";

const LOGIN_METHOD = "login";
const LOGIN_METHOD_SIGNATURE = "(Ljava/lang/String;Ljava/lang/String;)V";

const LOGOUT_METHOD = "logout";
const LOGOUT_METHOD_SIGNATURE = "()V";

const FIND_SCHOOL_METHOD = "findSchool";
const FIND_SCHOOL_METHOD_SIGNATURE = "(Ljava/lang/String;)Ljava/lang/String;";

const FETCH_SECTIONS_METHOD = "fetchSectionsForSchool";
const FETCH_SECTIONS_METHOD_SIGNATURE = "(Ljava/lang/String;)Ljava/lang/String;";

const FETCH_STUDENTS_METHOD = "fetchStudentsForSchoolAndSection";
const FETCH_STUDENTS_METHOD_SIGNATURE = "(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;";

const FETCH_CURRENT_USER_METHOD = "fetchStudentById";
const FETCH_CURRENT_USER_METHOD_SIGNATURE = "(Ljava/lang/String;)Ljava/lang/String;";

const SYNC_PROFILE_METHOD = "syncProfile";
const SYNC_PROFILE_METHOD_SIGNATURE = "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V";

const HISTORICAL_PROGRESS_METHOD = "historyProgress";
const HISTORICAL_PROGRESS_METHOD_SIGNATURE = "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V";

const LOG_DAILY_METHOD = "logToDailyFile";
const LOG_DAILY_METHOD_SIGNATURE = "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V";

const USER_ID = "userId";
const DEVICE_ID = "deviceId";
const TIMESTAMP = "timeStamp";
const SCORE = "score";
const COURSE = "course";
const ASSIGNMENTIDS = 'assignmentIds'
const DATE = 'date'

export default class UtilLogger {
    private static _storageDirectory = null;
    private static _currentUserId = null;
    private static _currentDeviceId = null;
    private static _isfireBaseInitialized: boolean = false;
    private static firebase: any;
    private static score: number;

    public static logEvent(eventInfo: object) {
        try {
            if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
                eventInfo[`${USER_ID}`] = this.currentProfile() || "";
                eventInfo[`${DEVICE_ID}`] = this.currentDeviceId() || "";
                eventInfo[`${TIMESTAMP}`] = new Date().getTime();
                cc.log("logging event", JSON.stringify(eventInfo));
                if (ASSET_LOAD_METHOD != "file") {
                    jsb.reflection.callStaticMethod(
                        LOGGER_CLASS,
                        LOGGER_METHOD,
                        LOGGER_METHOD_SIGNATURE,
                        JSON.stringify(eventInfo)
                    );
                }
            }
            this.logEventToFireBase(eventInfo);
        } catch (e) {
        }
    }

    public static setUserIdEvent(userId: string) {
        try {
            if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
                cc.log("setUserId event", userId);

                jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    SET_USER_ID_METHOD,
                    SET_USER_ID_SIGNATURE,
                    userId
                );

            }
        } catch (e) {
        }
    }

    public static setUserPropertiesEvent(key: string, value) {
        try {
            if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
                cc.log("setUserPropertiesEvent event", key, ":", value);

                jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    SET_USER_PROPERTY_METHOD,
                    SET_USER_PROPERTY_SIGNATURE,
                    key,
                    value
                );

            }
        } catch (e) {
        }
    }

    public static logEventToFireBaseWithKey(key: string, data: object) {
        cc.log(
            "logging firebase event",
            key,
            " with content",
            JSON.stringify(data)
        );

        if ("undefined" != typeof sdkbox) {
            // @ts-ignore
            sdkbox.firebase.Analytics.logEvent(key, data);
        }

        if (cc.sys.isBrowser) {
            cc.log("[CUBA debug] firebase analytics event", key, {
                projectId: firebaseConfigWeb.projectId,
                databaseURL: firebaseConfigWeb.databaseURL,
                appId: firebaseConfigWeb.appId,
                measurementId: firebaseConfigWeb.measurementId,
            });
            if (!UtilLogger._isfireBaseInitialized) {
                (async () => {
                    UtilLogger._isfireBaseInitialized = true;
                    await UtilLogger.importFirebaseForWeb();
                    if (UtilLogger.firebase) {
                        cc.log("[CUBA debug] initializing Firebase web", {
                            authDomain: firebaseConfigWeb.authDomain,
                            databaseURL: firebaseConfigWeb.databaseURL,
                            projectId: firebaseConfigWeb.projectId,
                            storageBucket: firebaseConfigWeb.storageBucket,
                            messagingSenderId: firebaseConfigWeb.messagingSenderId,
                            appId: firebaseConfigWeb.appId,
                            measurementId: firebaseConfigWeb.measurementId,
                        });
                        UtilLogger.firebase.initializeApp(firebaseConfigWeb);
                        UtilLogger.firebase.analytics();
                        UtilLogger.firebase.analytics().logEvent(key, data);
                        cc.log("[CUBA debug] firebase analytics logEvent queued", key);
                    }
                })();
            } else {
                if (UtilLogger.firebase) {
                    UtilLogger.firebase.analytics().logEvent(key, data);
                    cc.log("[CUBA debug] firebase analytics logEvent queued", key);
                } else {
                    cc.warn("[CUBA debug] firebase analytics unavailable", key);
                }
            }
        }
    }

    static async importFirebaseForWeb() {
        // @ts-ignore
        UtilLogger.firebase = await import("firebase/app");
        // @ts-ignore
        await import("firebase/analytics");
    }

    public static logChimpleEvent(name: string, event: any) {
        event[`${USER_ID}`] = this.currentProfile() || "";
        event[`${DEVICE_ID}`] = this.currentDeviceId() || "";
        event[`${TIMESTAMP}`] = new Date().getTime();
        UtilLogger.logEventToFireBaseWithKey(name, event);
    }

    public static logEventToFireBase(eventInfo: any) {
        eventInfo[`${USER_ID}`] = this.currentProfile() || "";
        eventInfo[`${DEVICE_ID}`] = this.currentDeviceId() || "";
        eventInfo[`${TIMESTAMP}`] = new Date().getTime();
        UtilLogger.logEventToFireBaseWithKey("logInfo", eventInfo);
    }

    public static logProfile(profileInfo: string, profileFile: string) {
        try {
            if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
                cc.log("logging profile", profileInfo, " ", profileFile);
                jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    PROFILE_METHOD,
                    PROFILE_METHOD_SIGNATURE,
                    profileInfo,
                    profileFile
                );
            }
        } catch (e) {
        }
    }

    public static currentProfile() {
        this._currentUserId = User.getCurrentUser() ? User.getCurrentUser().id : "";
        return this._currentUserId;
    }

    public static getStorageDirectory() {
        try {
            if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
                this._storageDirectory = jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    GET_STORAGE_DIRECTORY,
                    GET_STORAGE_DIRECTORY_METHOD_SIGNATURE
                );
                cc.log("storage directory:", this._storageDirectory);
            }
        } catch (e) {
        }
        return this._storageDirectory;
    }

    public static currentDeviceId() {
        try {
            if (
                this._currentDeviceId === null &&
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID
            ) {
                this._currentDeviceId = jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    DEVICE_ID_METHOD,
                    DEVICE_ID_METHOD_SIGNATURE
                );
                cc.log("current device Id:", this._currentDeviceId);
            }
        } catch (e) {
        }
        return this._currentDeviceId;
    }

    public static initPluginFirebase() {
        try {
            if ("undefined" == typeof sdkbox) {
                cc.log("sdkbox is undefined");
                return;
            }

            // @ts-ignore
            if ("undefined" == typeof sdkbox.firebase) {
                cc.log("sdkbox.firebase is undefined");
                return;
            }
            // @ts-ignore
            sdkbox.firebase.Analytics.init();
        } catch (e) {
        }
    }

    public static initYoutubePlugin() {
        try {
            if ("undefined" == typeof sdkbox) {
                cc.log("sdkbox is undefined");
                return;
            }

            // @ts-ignore
            if ('undefined' == typeof sdkbox.PluginYoutube) {
                cc.log('sdkbox.PluginYoutube is undefined');
                return;
            }

            // @ts-ignore
            sdkbox.PluginYoutube.init();
        } catch (e) {
        }
    }

    public static downloadFile(url: string, downloadDirectory: string) {
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID &&
                ASSET_LOAD_METHOD === "file"
            ) {
                jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    DOWNLOAD_FILE_METHOD,
                    DOWNLOAD_FILE_METHOD_SIGNATURE,
                    url,
                    downloadDirectory
                );
            }
        } catch (e) {
        }
    }

    public static isFileExistsInPublicDirectory(file: string): boolean {
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID &&
                ASSET_LOAD_METHOD === "file"
            ) {
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    FILE_EXISTS_IN_PUBLIC_DIRECTORY_METHOD,
                    FILE_EXISTS_IN_PUBLIC_DIRECTORY_METHOD_SIGNATURE,
                    file
                );
            }
            return false;
        } catch (e) {
        }
    }

    public static isFileExists(downloadDirectory: string): boolean {
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID &&
                ASSET_LOAD_METHOD === "file"
            ) {
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    FILE_EXISTS_METHOD,
                    FILE_EXISTS_METHOD_SIGNATURE,
                    downloadDirectory
                );
            }
            return false;
        } catch (e) {
        }
    }

    public static init(): void {
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID
            ) {
                cc.log("calling init");
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    INITIALIZED,
                    INITIALIZED_MEHTOD_SIGNATURE
                );
            }
        } catch (e) {
        }
    }

    public static launchYoutube(videoId: string): void {
        cc.log("calling launchYoutube");
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID
            ) {
                cc.log("calling launchYoutube 1111");
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    LAUNCH_YOUTUBE_METHOD,
                    LAUNCH_YOUTUBE_METHOD_SIGNATURE,
                    videoId
                );
            }
        } catch (e) {
        }
    }

    public static checkIfUrlDownloaded(
        url: string,
        downloadDirectory: string
    ): string {
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID &&
                ASSET_LOAD_METHOD === "file"
            ) {
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    CHECK_URL_DOWNLOADED_METHOD,
                    CHECK_URL_DOWNLOADED_METHOD_SIGNATURE,
                    url,
                    downloadDirectory
                );
            }
            return null;
        } catch (e) {
        }
    }

    public static isNetworkAvailable(): boolean {
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID &&
                ASSET_LOAD_METHOD === "file"
            ) {
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    IS_NETWORK_AVAILABLE_METHOD,
                    IS_NETWORK_AVAILABLE_METHOD_SIGNATURE
                );
            }
            return false;
        } catch (e) {
        }
    }

    public static getCountryCode(): string {
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID) {
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    GET_COUNTRY_CODE_METHOD,
                    GET_COUNTRY_CODE_METHOD_SIGNATURE
                );
            }
        } catch (e) {
        }
    }

    public static requestOtp(requestOtpText: string) {
        try {
            if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
                cc.log("Request Otp event", requestOtpText);

                jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    REQUEST_OTP_METHOD,
                    REQUEST_OTP_METHOD_SIGNATURE,
                    requestOtpText
                );

            }
        } catch (e) {
        }
    }

    public static verifyOtp(verifyOtpText: string) {
        try {
            if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
                cc.log("Verify Otp event", verifyOtpText);

                jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    VERIFY_OTP_METHOD,
                    VERIFY_OTP_METHOD_SIGNATURE,
                    verifyOtpText
                );

            }
        } catch (e) {
        }
    }

    public static syncFmcTokenForUsers() {
        const u = User.getUserIds() || [];
        const userIds: string = u.join(",");
        console.log("syncFmcTokenForUsers:" + userIds);
        let mode = parseInt(Profile.getValue(CURRENTMODE));
        try {
            if (mode != Mode.School
                && cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
                cc.log("sync fmc userIds", userIds);

                jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    SYNC_FMC_METHOD,
                    SYNC_FMC_METHOD_SIGNATURE,
                    userIds
                );
            }
        } catch (e) {
            console.log(e);
        }
    }

    public static subscribeToTopic(topicId: string) {
        try {
            let mode = parseInt(Profile.getValue(CURRENTMODE));
            if (mode != Mode.School
                && cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID && topicId && topicId.length > 0) {
                cc.log("subscribe to topic", topicId);

                jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    SUBSCRIBE_TOPIC_METHOD,
                    SUBSCRIBE_TOPIC_METHOD_SIGNATURE,
                    topicId
                );
            }
        } catch (e) {
        }
    }

    public static login(email: string, password: string): void {
        cc.log(`login using email: ${email} and password: ${password}`);
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID
            ) {
                if (email.indexOf("@") === -1) email += '@gmail.com';

                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    LOGIN_METHOD,
                    LOGIN_METHOD_SIGNATURE,
                    email,
                    password
                );
            }
        } catch (e) {
        }
    }

    public static logout(): void {
        // cc.log(`login using email: ${email} and password: ${password}`);
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID
            ) {
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    LOGOUT_METHOD,
                    LOGOUT_METHOD_SIGNATURE
                );
            }
        } catch (e) {
        }
    }

    public static fetchStudents(schoolId: string, sectionId: string): any {
        cc.log(`fetch Students: ${schoolId} and password: ${sectionId}`);
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID
            ) {
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    FETCH_STUDENTS_METHOD,
                    FETCH_STUDENTS_METHOD_SIGNATURE,
                    schoolId,
                    sectionId
                );
            }
        } catch (e) {
        }
    }

    public static fetchStudentById(studentId: string): any {
        cc.log(`fetch Students: ${studentId}`);
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID
            ) {
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    FETCH_CURRENT_USER_METHOD,
                    FETCH_CURRENT_USER_METHOD_SIGNATURE,
                    studentId
                );
            }
        } catch (e) {
        }
    }

    public static findSchool(email: string): any {
        cc.log(`find school using email: ${email}`);
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID
            ) {
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    FIND_SCHOOL_METHOD,
                    FIND_SCHOOL_METHOD_SIGNATURE,
                    email
                );
            }
        } catch (e) {
        }
    }

    public static fetchSections(schoolId: string): any {
        cc.log(`fetch Sections: ${schoolId}`);
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID
            ) {
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    FETCH_SECTIONS_METHOD,
                    FETCH_SECTIONS_METHOD_SIGNATURE,
                    schoolId
                );
            }
        } catch (e) {
        }
    }

    public static historyProgress(chapterId: string, chapterName: string, lessonId: string,
        lessonName: string, progressId: string, school: string,
        section: string, subjectCode: string, score: string, assignmentId: string, name: string, timeSpent: string) {
        cc.log(`historyProgress for: ${chapterId}-${chapterName}-${lessonId}-${progressId}`);
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID
            ) {
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    HISTORICAL_PROGRESS_METHOD,
                    HISTORICAL_PROGRESS_METHOD_SIGNATURE,
                    chapterId,
                    chapterName,
                    lessonId,
                    lessonName,
                    progressId,
                    school,
                    section,
                    subjectCode,
                    score,
                    assignmentId,
                    name,
                    timeSpent
                );
            }
        } catch (e) {
        }
    }

    public static syncProfile(schoolId: string, sectionId: string, studentId: string, profile: string, progressId: string): void {
        cc.log(`syncProfile for: ${schoolId}-${sectionId}-${studentId}-${progressId}`);
        cc.log(`syncProfile in util-logger: mode `, parseInt(Profile.getValue(CURRENTMODE)), Mode.HomeConnect);
        try {
            let mode = parseInt(Profile.getValue(CURRENTMODE));
            console.log("syncProfile in util-logger bool ", mode === Mode.School, mode === Mode.HomeConnect,
                cc.sys.isNative,
                cc.sys.os == cc.sys.OS_ANDROID, (mode === Mode.School || mode === Mode.HomeConnect) &&
                cc.sys.isNative &&
            cc.sys.os == cc.sys.OS_ANDROID)
            if (
                (mode === Mode.School || mode === Mode.HomeConnect) &&
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID
            ) {
                cc.log(`syncProfile in util-logger: mode in if `,
                    schoolId,
                    sectionId,
                    studentId,
                    profile,
                    progressId);
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    SYNC_PROFILE_METHOD,
                    SYNC_PROFILE_METHOD_SIGNATURE,
                    schoolId,
                    sectionId,
                    studentId,
                    profile,
                    progressId
                );
            }
        } catch (e) {
            cc.log("syncProfile in util-logger error ", e)
        }
    }

    public static processLinkStudent(sectionId: string, schoolId: string,
        studentId: string, schoolName: string,
        sectionName: string,
        progressId: string,
        otpCode: string = null,
        profile: any = null) {

        const user = User.getCurrentUser();
        if (user != null && !!profile) {
            for (let key in profile.lessonProgressMap) {
                var _course = profile.lessonProgressMap[key][COURSE]
                if (user.lessonProgressMap.has(key)) {
                    if (user.lessonProgressMap.get(key).score > profile.lessonProgressMap[key][SCORE]) {
                        this.score = user.lessonProgressMap.get(key).score
                    }
                    else {
                        this.score = profile.lessonProgressMap[key][SCORE]
                    }
                }
                else {
                    this.score = profile.lessonProgressMap[key][SCORE]
                }
                var _assignments = profile.lessonProgressMap[key][ASSIGNMENTIDS]
                var _date = profile.lessonProgressMap[key][DATE]
                if (key == _course + '_PreQuiz') {
                    const cpm = user.courseProgressMap.get(_course)
                    cpm.updateChapterId(_course + '00');
                    user.courseProgressMap.get(_course).lessonPlanIndex++
                }
                user.lessonProgressMap.set(key, new LessonProgressClass(this.score, 1, _course, _assignments.toString(), _date));
            }
        }
        if (user != null && !!schoolId && !!sectionId && !!studentId && !user.isConnected) {
            user.sectionId = sectionId;
            user.schoolId = schoolId;
            user.studentId = studentId;
            user.schoolName = schoolName;
            user.sectionName = sectionName;
            user.isConnected = true;
            !!progressId ? User.replaceUserID(user.id, progressId) : '';
            user.id = !!progressId ? progressId : user.id;
            user.storeUser();

            const request: AcceptTeacherRequest = {
                teacherId: user.schoolId,
                sectionId: user.sectionId,
                studentId: user.id,
                studentName: user.name,
                firebaseStudentId: user.studentId,
                otpCode: otpCode
            };
            UtilLogger.logChimpleEvent(ACCEPT_TEACHER_REQUEST, request);
            UtilLogger.subscribeToTopic(`assignment-${user.schoolId}-${user.sectionId}`);
            UtilLogger.subscribeToTopic(`assignment-${user.schoolId}`);
            const key = `teacher_for_student_${user.id}`;
            let teachersForStudent: string[] = JSON.parse(cc.sys.localStorage.getItem(key) || '[]');
            if (teachersForStudent.indexOf(user.sectionName) == -1) {
                teachersForStudent.push(user.sectionName);
            }
            cc.sys.localStorage.setItem(key, JSON.stringify(teachersForStudent));
        }
    }

    public static processNewLinkStudent(customAuthInfo: CustomAuthInfo, otpCode: string) {
        const firebaseUser = customAuthInfo.student;
        const student: Student = {
            age: firebaseUser.age,
            countryCode: firebaseUser.countryCode,
            firebaseId: customAuthInfo.studentId,
            gender: firebaseUser.gender,
            image: firebaseUser.image,
            isSynced: "false",
            link: firebaseUser.link,
            name: firebaseUser.name,
            phoneNumber: firebaseUser.phoneNumber,
            profileInfo: firebaseUser.profile,
            progressId: firebaseUser.progressId,
            schoolId: customAuthInfo.schoolId,
            sectionId: customAuthInfo.sectionId
        }
        const studentJson: string = UtilLogger.fetchStudentById(student.firebaseId);
        cc.log("Student Json ", studentJson);
        const profileExists = !!student?.profileInfo;
        let user: User = null;
        if (!profileExists || !student?.profileInfo?.lessonProgressMap || !student?.profileInfo?.courseProgressMap) {
            cc.log("creating new user:" + user);
            user = User.getCurrentUser();
        } else {
            cc.log("Student Profile exists:" + student.profileInfo);
            user = User.fromJson(JSON.stringify(student.profileInfo));
            const currentuser = User.getCurrentUser();
            if (user != null && !!currentuser && !!currentuser?.lessonProgressMap) {
                UtilLogger.mergeUser(currentuser, user);
            }
            cc.log("getting user from profile json:" + user);
        }
        user.schoolId = student.schoolId
        user.sectionId = student.sectionId;
        user.studentId = student.firebaseId;
        user.imgPath = student.image;
        user.isConnected = true;
        user.schoolName = customAuthInfo.schoolName;
        user.sectionName = customAuthInfo.sectionName;
        cc.log('replacoing the userid..')
        !!customAuthInfo.progressId ? User.replaceUserID(user.id, customAuthInfo.progressId) : '';
        user.id = !!customAuthInfo.progressId ? customAuthInfo.progressId : user.id;
        cc.log('schoolId ', student.schoolId);
        cc.sys.localStorage.setItem(FIREBASE_SCHOOL_ID, student.schoolId)
        cc.sys.localStorage.setItem(FIREBASE_SECTION_ID, student.sectionId)
        cc.sys.localStorage.setItem(FIREBASE_STUDENT_ID, customAuthInfo.studentId)
        console.log('setCurrentUser userid..')
        User.setCurrentUser(user);
        console.log('storeUser userid..')
        user.storeUser();
        // User.syncProfile();
        cc.log('synced profile', User.getCurrentUser().isConnected, User.getCurrentUser().courseProgressMap);
        const request: AcceptTeacherRequest = {
            teacherId: student.schoolId,
            sectionId: student.sectionId,
            studentId: customAuthInfo.progressId,
            studentName: user.name,
            firebaseStudentId: user.studentId,
            otpCode: otpCode
        };
        cc.log('AcceptTeacherRequest', request);
        UtilLogger.logChimpleEvent(ACCEPT_TEACHER_REQUEST, request);
        UtilLogger.subscribeToTopic(`assignment-${student.schoolId}-${student.sectionId}`);
        UtilLogger.subscribeToTopic(`assignment-${student.schoolId}`);
        const key = `teacher_for_student_${user.id}`;
        let teachersForStudent: string[] = JSON.parse(cc.sys.localStorage.getItem(key) || '[]');
        if (teachersForStudent.indexOf(user.sectionName) == -1) {
            teachersForStudent.push(user.sectionName);
        }
        cc.sys.localStorage.setItem(key, JSON.stringify(teachersForStudent));
        cc.log('LOAD prestart scene');
    }

    public static processLoginFail() {
        const mode = parseInt(Profile.getValue(CURRENTMODE))
        cc.log('processLoginFail...');
        if (mode == Mode.HomeConnect) {
            const currentUser = User.getCurrentUser();
            if (!!currentUser) {
                cc.log('processLoginFail... current User', User.toJson(currentUser));
                currentUser.isConnected = false;
                currentUser.storeUser();
            }
            User.getUsers().forEach((user) => {
                const schoolId = cc.sys.localStorage.getItem('SCHOOL_USER');
                if (user?.schoolId === schoolId) {
                    user.isConnected = false;
                    user.storeUser();
                }
            });
        }
    }

    public static mergeUser(fromUser: User, toUser: User): User {
        console.log("mergeing user")
        if (!fromUser || !toUser) return toUser;
        if (!!fromUser.lessonProgressMap) {
            if (!toUser.lessonProgressMap) {
                toUser.lessonProgressMap = fromUser.lessonProgressMap;
            }
            else {
                fromUser.lessonProgressMap.forEach((v, key) => {
                    let score = fromUser.lessonProgressMap.get(key)?.score ?? 0;
                    const _course = fromUser.lessonProgressMap.get(key)?.course;
                    if (toUser.lessonProgressMap.has(key)) {
                        if (toUser.lessonProgressMap.get(key).score > score) {
                            score = toUser.lessonProgressMap.get(key).score;
                        }
                    }
                    const fromAssignments = fromUser.lessonProgressMap.get(key)?.assignmentIds ?? [];
                    const toAssignments = toUser.lessonProgressMap.get(key)?.assignmentIds ?? [];
                    const _assignments = fromAssignments.concat(toAssignments.filter((item) => fromAssignments.indexOf(item) < 0));
                    const _date = fromUser.lessonProgressMap.get(key)?.date;
                    const fromUserAttempts = fromUser.lessonProgressMap.get(key)?.attempts ?? 0;
                    const toUserAttempts = toUser.lessonProgressMap.get(key)?.attempts ?? 0;
                    const attempts = (toUserAttempts >= fromUserAttempts) ? toUserAttempts : fromUserAttempts;
                    toUser.lessonProgressMap.set(key, new LessonProgressClass(score, attempts, _course, _assignments.toString(), _date));
                })
            }
        }
        if (!toUser.courseProgressMap) {
            toUser.courseProgressMap = fromUser.courseProgressMap;
        }
        const unlockedRewards = { ...toUser.unlockedRewards ?? {}, ...fromUser.unlockedRewards ?? {} }
        const unlockedInventory = { ...toUser.unlockedInventory ?? {}, ...fromUser.unlockedInventory ?? {} }
        const currentReward = toUser.currentReward?.concat(fromUser.currentReward?.filter((item) => toUser.currentReward?.indexOf(item) < 0)) ?? []
        const assignments = toUser.assignments?.concat(fromUser.assignments?.filter((item) => toUser.assignments?.indexOf(item) < 0)) ?? []
        const inventory = { ...toUser.inventory ?? {}, ...fromUser.inventory ?? {} }
        const last5Lessons: Map<string, Last5LessonsItem[]> = new Map([...Array.from(fromUser.last5Lessons?.entries()), ...Array.from(toUser.last5Lessons?.entries())]);
        toUser.unlockedRewards = unlockedRewards;
        toUser.unlockedInventory = unlockedInventory;
        toUser.currentReward = currentReward;
        toUser.assignments = assignments;
        toUser.inventory = inventory;
        toUser.last5Lessons = last5Lessons;
        return toUser;
    }

    public static logToDaily(deviceId: string, header: string, event: string) {
        const curDate = new Date();
        const month = curDate.getMonth().toString().length == 1 ? '0' + (curDate.getMonth() + 1).toString() : (curDate.getMonth() + 1).toString();
        const year = curDate.getFullYear();
        const day = curDate.getDate().toString().length == 1 ? '0' + curDate.getDate() : curDate.getDate().toString();

        const lastFileGeneratedName = cc.sys.localStorage.getItem("lastFileGeneratedName") || null;
        let fileName = lastFileGeneratedName == null ? deviceId + "#" + User.createUUID() + "-" + day + month + year + '.txt' : lastFileGeneratedName;
        cc.sys.localStorage.setItem("lastFileGeneratedName", fileName);

        if (UtilLogger.isFileExistsInPublicDirectory("Documents" + "/" + "events" + "/" + "processed" + "/" + fileName)) {
            fileName = deviceId + "#" + User.createUUID() + "-" + day + month + year + '.txt';
            cc.sys.localStorage.setItem("lastFileGeneratedName", fileName);
            cc.log(`Generating new file ${fileName}`);
        }

        cc.log(`logToDaily for: ${event}-${fileName}`);
        try {
            if (
                cc.sys.isNative &&
                cc.sys.os == cc.sys.OS_ANDROID
            ) {
                return jsb.reflection.callStaticMethod(
                    LOGGER_CLASS,
                    LOG_DAILY_METHOD,
                    LOG_DAILY_METHOD_SIGNATURE,
                    header,
                    event,
                    fileName);
            }
        } catch (e) {
        }
    }

    public static getChapterIdForPrequiz(quizScores: number[]): string {
        const config = Config.i;
        const quizChapter = config.course.chapters.find((c) => c.id == config.course.id + '_quiz')
        if (quizChapter) {
            let currentCourse = config.course.chapters.find((c) => c.id != config.course.id + '_quiz')
            let qzId = 0
            for (let index = 0; index + 2 < quizScores.length; index += 3) {
                if (quizScores[index] + quizScores[index + 1] + quizScores[index + 2] >= 2) {
                    currentCourse = config.course.chapters.find((c) => c.id == config.course.levels[qzId])
                } else {
                    break
                }
                qzId++
            }
            return currentCourse.id;
        } else {
            const formulaScore = quizScores.reduce((acc, cur, i, arr): number => {
                const mul = Math.floor(arr.length / 2) - Math.floor(i / 2)
                const neg = cur == 0 ? -0.5 : cur
                return acc + neg * mul
            }, 0)
            const max = quizScores.length / 2 * (quizScores.length / 2 + 1)
            const total = Math.max(0, formulaScore / max)
            const chapters = config.curriculum.get(config.course.id).chapters
            return chapters[Math.floor((chapters.length - 1) * total)].id;
        }
    }
}
