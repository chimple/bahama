import Config from "../../../common/scripts/lib/config";
import { Util } from "../../../common/scripts/util";
import catchError from "../../../common/scripts/lib/error-handler";
import Game from "../../../common/scripts/game";
// import Assemble from "../../platform/scripts/assemble";
const { ccclass, property } = cc._decorator;

@ccclass
export default class NimbleTable extends Game {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Prefab)
    choicesPrefab: cc.Prefab = null;

    @property({
        type: cc.AudioClip
    })
    correctAudio: cc.AudioClip = null;

    @property({
        type: cc.AudioClip
    })
    wrongAudio: cc.AudioClip = null;

    @property
    text: string = 'hello';
    firstValue: string;
    secondValue: string;
    mathSign: string;
    rightAnswer: string;
    examples: Array<string>;
    firstData: string;
    secondData: string;
    thirdData: string;
    game: string;
    gameConfigs: string;
    worksheet: number;
    problem: number;
    gameLevel: number;
    totalProblems: number;
    arr_name: string[][] = [];
    currentProblem: number = 0;
    totalNextQues: number = 4;
    totalExamplesCount: number;
    wrongAnimationTimer;
    checkLasts: boolean = false;
    private _totalCount: string = null;
    nextProblemTimeout;
    nextProblemTimeout2;
    isInitial: boolean = true;

    // LIFE-CYCLE CALLBACKS:
    @catchError()
    nextProblem() {
        this.currentProblem++;
        if (this.arr_name[this.currentProblem][5] == "") {  //end of game, call nextProblem
            this.node.emit('nextProblem')
        }
        else {
            // delete previous examples
            this.node.getChildByName("examples").getChildByName("layoutExamples").removeAllChildren();
            this.makeScreen();
        }

        // if (this.currentProblem + 5 > 15) {
        //     this.node.getChildByName("nextQues").getChildByName("transparentBg").getChildByName("containerNode").removeChild(this.node.getChildByName("nextQues").getChildByName("transparentBg").getChildByName("containerNode").getChildByName("" + (this.totalNextQues)));
        //     this.totalNextQues--;
        //     this.checkLasts = true;
        //     for (let i = 0; i < this.totalNextQues; i++) {
        //         const element = this.arr_name[i + this.currentProblem + 1]
        //         let questionString = "";
        //         this.node.getChildByName("nextQues").getChildByName("transparentBg").getChildByName("containerNode").getChildByName("" + (i + 1)).getComponent(cc.Label).string = questionString + element[4] + " " + element[6] + " " + element[5] + " = " + "?";
        //     }
        // }


    }

    @catchError()
    makeNimbleTableData(array: string[]): string[][] {
        let result = [];
        let dataRowsCount = 0;
        for (let i = 3; i < array.length; i += 7) {
            dataRowsCount++;
            let k = i;
            let temp = ["1", "1", "1", "1"];
            temp.push(array[k + 3])
            temp.push(array[k + 4])
            temp.push(array[k + 5])
            temp.push(array[k + 6])
            for (let c = 0, d = +array[k]; c < 15; c++, d += +array[k + 2]) {
                if (d <= +array[k + 1]) {
                    temp.push(d.toString());
                }
                else {
                    temp.push("");
                }
            }
            result.push(temp);
        }
        //dummy
        for (let i = 1; i <= dataRowsCount; i++) {
            result.push(["1", "1", i.toString(), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        }
        return result;
    }

    @catchError()
    onLoad() {
        let config = Config.getInstance();
        // single row data in arr_name
        // exp. - arr_name[1] means 2nd row of
        // selected level
        //old
        // this.arr_name = config.data
        // console.log(this.arr_name);
        //new
        let result = this.makeNimbleTableData(Config.i.data[0]);
        console.log("data came", result)
        this.arr_name = result;
        this.makeScreen();
    }

    @catchError()
    private makeScreen() {
        this.examples = [];
        const el = this.arr_name[this.currentProblem];
        this.firstValue = el[4]; // 4 - first value
        this.secondValue = el[5];
        this.mathSign = el[6] === '*' ? 'x' : el[6];
        this.rightAnswer = el[7];
        const tempString = "";
        var answerNode: cc.Node = null;
        this._totalCount = this.rightAnswer;
        if (this.firstValue != "")
            this.node.getChildByName("questionboard_quickfacts").getChildByName("question").
                getComponent(cc.Label).string = tempString + this.firstValue + " " + this.mathSign + " " +
                this.secondValue + " = ?";

        // putting examples or choices there // keyboard
        for (let i = 8; i <= 22; i++) {
            if (el[i] != "") {
                this.totalExamplesCount = i;
                this.examples.push(el[i]);
                const choices = cc.instantiate(this.choicesPrefab);
                choices.getChildByName("Background").getChildByName("Label").getComponent(cc.Label).string = el[i];
                if (el[i] === this.rightAnswer && choices != null) {
                    answerNode = choices;
                }
                this.node.getChildByName("examples").getChildByName("layoutExamples").addChild(choices);
                choices.name = "2_" + i;
                choices.getComponent(cc.Button).node.on("click", this.callback, this);
                choices.getComponent(cc.Animation).play('popup');
            }
        }

        if (this.isInitial) {
            this.isInitial = false;
            try {
                Util.showHelp(answerNode, answerNode);
            } catch (e) { }
        }

        for (let i = 0; i < 4; i++) {          // extra 4 to show
            const el = this.arr_name[i + this.currentProblem + 1];
            let labelNode = this.node.getChildByName("nextQues").getChildByName("transparentBg").getChildByName("containerNode").getChildByName("" + (i + 1));
            if (el[5] != "") {
                let questionString = "";
                labelNode.getComponent(cc.Label).string = questionString + el[4] + " " + this.mathSign + " " + el[5] + " = " + "?";
            }
            else {
                labelNode.getComponent(cc.Label).string = "";
            }
        }
    }

    @catchError()
    callback(event) {
        let buttonValue = this.node.getChildByName("examples").getChildByName("layoutExamples").getChildByName(event.node.name).getChildByName("Background").getChildByName("Label").getComponent(cc.Label).string
        if (buttonValue == this.rightAnswer) {
            // play right audio
            this.node.emit('correct');

            // Util.play(this.correctAudio, false);
            // disapear animation node for every tile
            for (let i = 8; i <= this.totalExamplesCount; i++) {
                this.node.getChildByName("examples").getChildByName("layoutExamples").getChildByName("2_" + i).getComponent(cc.Animation).play('correct');
                // disable clicks on button so it 
                // wont animate further
                this.node.getChildByName("examples").getChildByName("layoutExamples").getChildByName("2_" + i).getComponent(cc.Button).node.off("click", this.callback, this);
            }


            this.nextProblemTimeout = setTimeout(() => {
                const tempString = "";
                this.node.getChildByName("questionboard_quickfacts").getChildByName("question").
                    getComponent(cc.Label).string = tempString + this.firstValue + " " + this.mathSign + " " +
                    this.secondValue + " = " + this.rightAnswer;
                let timeFactor = 0.5
                let nextProblemAnimation = cc.moveBy(timeFactor, 0, 132);
                let questionUpAction = cc.moveBy(timeFactor / 3, 2, 50);
                Util.speakEquation([String(this._totalCount)], (index) => { });

                this.nextProblemTimeout2 = setTimeout(() => {
                    this.node.getChildByName("questionboard_quickfacts").getChildByName("question").runAction(cc.sequence(questionUpAction, cc.callFunc(() => {
                        this.node.getChildByName("questionboard_quickfacts").getChildByName("question").
                            getComponent(cc.Label).string = ""
                        this.node.getChildByName("questionboard_quickfacts").getChildByName("question").position = new cc.Vec3(-7, -70);
                    })));

                    this.node.getChildByName("nextQues").getChildByName("transparentBg").getChildByName("containerNode").runAction(
                        cc.sequence(nextProblemAnimation, cc.callFunc(() => {
                            this.nextProblem();
                            this.node.getChildByName("nextQues").getChildByName("transparentBg").getChildByName("containerNode").position = new cc.Vec3(12, 50);
                        }))
                    );
                }, 3000);
            }, 300);

        } else {
            this.node.emit('wrong');
            // Util.play(this.wrongAudio, false);
            this.node.getChildByName("examples").getChildByName("layoutExamples").getChildByName(event.node.name).getComponent(cc.Animation).play('wrong');
            setTimeout(() => {
                this.wrongAnimationTimer = this.node.getChildByName("examples").getChildByName("layoutExamples").getChildByName(event.node.name).removeAllChildren();
            }, 300);
        }
    }

    @catchError()
    onDestroy() {
        clearTimeout(this.wrongAnimationTimer);
        clearTimeout(this.nextProblemTimeout);
        clearTimeout(this.nextProblemTimeout2);
    }
}
