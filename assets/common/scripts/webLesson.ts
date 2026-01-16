import { Util } from "./util";
import Config, { Lang } from "./lib/config";
import Profile, { LANGUAGE } from "./lib/profile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WebLesson extends cc.Component {
  onLoad() {
    const params = new URLSearchParams(window.location.search);
    Config.isMicroLink = true;
    const lang = params.get("lang");
    if (lang == Lang.HINDI) Profile.setValue(LANGUAGE, Lang.HINDI);
    else if (lang == Lang.KANNADA) Profile.setValue(LANGUAGE, Lang.KANNADA);
    else if (lang == Lang.MARATHI) Profile.setValue(LANGUAGE, Lang.MARATHI);
    else Profile.setValue(LANGUAGE, Lang.ENGLISH);

    const input = {
      courseid: params.get("courseid"),
      coursename: params.get("coursename"),
      chapterid: params.get("chapterid"),
      chaptername: params.get("chaptername"),
      lessonid: params.get("lessonid"),
      lessonname: params.get("lessonname"),
      studentid: params.get("studentid"),
      studentname: params.get("studentname"),
      classid: params.get("classid"),
      schoolid: params.get("schoolid"),

      assignmentid: params.get("assignmentid"),
      webclass: params.get("webclass"),
      test: params.get("test"),
      mlpartnerid: params.get("mlPartnerId"),
      mlclassid: params.get("mlClassId"),
      mlstudentid: params.get("mlStudentId"),
      end: params.get("end"),
    };
    Util.loadDirectLessonWithLink(input, this.node);
  }
}
