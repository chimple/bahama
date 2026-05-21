
const { ccclass, property } = cc._decorator;
import { HELP_BTN } from "../../../common/scripts/answer-grid";
import CountingAnswer, { VALIDATE_RESULT } from "../../../common/scripts/counting-answer";
import Game from "../../../common/scripts/game";
import Config from "../../../common/scripts/lib/config";
import catchError from "../../../common/scripts/lib/error-handler";
import { Util } from "../../../common/scripts/util";

export interface CalculatorConfig {
    level: string,
    worksheet: string,
    problemCount: string,
    number1: string,
    addition: string,
    subtraction: string,
    number2: string,
    result: string,
    regrouping: string,
    numberpads: string[]
}

@ccclass
export default class Calculator extends Game {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Prefab)
    drawingDot: cc.Prefab = null;

    @property(cc.Prefab)
    drawingAreaPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    countingAnswerPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    labelPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    layoutPrefab: cc.Prefab = null;

    @property
    text: string = 'hello';

    protected highlightNode: cc.Node = null;
    drawing;
    last_location;
    startLocation: cc.Vec2 = cc.v2(0, 0);
    adjustCords: cc.Vec2 = cc.v2(0, 0);
    isOneTouched: boolean = false;
    private _countingAnswer: cc.Node = null;
    private _currentConfig: CalculatorConfig = null;
    private _drawingAreaNode: cc.Node = null;
    private _graphicsNode: cc.Node = null;
    private _layout: cc.Node = null;
    firstNumber: Number = 30;
    secondNumber: Number = 10;
    resultNumber: Number = 20;
    isPlusSign: boolean = false;
    problemCount: Number = 5;
    clearTime;
    rowData;
    private _answeredCorrectly: boolean = false;


    // LIFE-CYCLE CALLBACKS:
    @catchError()
    onLoad() {

        Util.loadi18NMapping(() => {
            this.node.getChildByName("writeLabel").getComponent(cc.Label).string = Util.i18NText("");
        });


        this._currentConfig = this.processConfiguration(Config.getInstance().data[0]);

        this.loadData();

        this._graphicsNode = cc.instantiate(this.drawingDot);
        this._graphicsNode.name = "canvas"
        this.node.addChild(this._graphicsNode);

        this.last_location = new cc.Vec2(0, 0);

        this.node.getChildByName("clearDraw").getComponent(cc.Button).node.on("click", this.clearDrawing, this)

        /// get data here
        ///////////////////
        this._layout = cc.instantiate(this.layoutPrefab);
        this.node.getChildByName("layoutFolder").addChild(this._layout);
        this.setUpLayout();
        this._drawingAreaNode.on("touchstart", this.onTouchStart, this);
        this._drawingAreaNode.on("touchmove", this.onTouchMove, this);
        this._drawingAreaNode.on("touchend", this.onTouchEnd, this);
        let temp = this.problemCount.valueOf();
        this.node.on(VALIDATE_RESULT, (event) => {
            event.stopPropagation();
            const data = event.getUserData();
            if (data.result == this.resultNumber && !this._answeredCorrectly) {
                let startIndex3 = 4 - this.resultNumber.toString().trim().length + 1
                for (let i = 0; i < this.resultNumber.toString().trim().length; i++) {
                    // instantiate label preabaf
                    let resultLabelPrefab = cc.instantiate(this.labelPrefab);
                    resultLabelPrefab.getComponent(cc.Label).string = this.resultNumber.toString().trim().charAt(i);
                    resultLabelPrefab.name = i + "";

                    this.node.getChildByName("answersLabel").getChildByName("answer_1").getChildByName("" + (i + startIndex3)).addChild(resultLabelPrefab)
                }
                // this.node.getChildByName("answersLabel").getChildByName("answer").getComponent(cc.Label).string = this.resultNumber + ""
                // this.node.emit('nextProblem');
                temp -= 1;
                this._answeredCorrectly = true;
                this.problemCount = temp;
                this.node.emit('nextProblem');
                this.node.emit('correct');
                this._countingAnswer.getComponent(CountingAnswer).isValidResult = true;
                // if (this.problemCount < 2) {
                //     console.log("Not a problem!!!");
                //     this.node.emit('nextProblem');
                // }
                // this.clearTime = setTimeout(() => {
                // this.loadData()
                // this.setUpQuestionArea(this.rowData);
                // this.clearDrawing();
                // }, 1000)

            } else {
                if (!this._answeredCorrectly) {
                    console.log("You r wrong .right is >> " + this.resultNumber);
                    this.node.emit('wrong');
                    this._countingAnswer.getComponent(CountingAnswer).clearDigits(false);
                }
            }
            console.log(data.result + " ::: ")
        });

        this.node.on(HELP_BTN, (event) => {
            event.stopPropagation();
            const data = event.getUserData();
            console.log(data, " [] ", data.helpNodes);
            this.showHelp(this.helpIterator(data.helpNodes))
        })

        // 

    }
    @catchError()
    private helpIterator(helpNodes: cc.Node[]) {
        return helpNodes[Symbol.iterator]();
    }
    @catchError()
    showHelp(helpIterator, playAudio: boolean = true) {
        let nextItem = helpIterator.next();
        if (!nextItem.done) {
            Util.showHelp(nextItem.value, nextItem.value, () => {
                this.showHelp(helpIterator, false);
            }, playAudio);
        }

    }
    @catchError()
    loadData() {
        const row = Config.getInstance().data[0]
        this.rowData = row;
        this.setUpQuestionArea(row);
        this.clearDrawing();
    }

    private processConfiguration(data: any[] = []): CalculatorConfig | null {
        const configurations: any[] = [].concat(...data);
        let [level,
            worksheet,
            problemCount,
            number1,
            addition,
            subtraction,
            number2,
            result,
            regrouping,
            numberpads] = configurations;
        numberpads = numberpads.split(',');
        return {
            level,
            worksheet,
            problemCount,
            number1,
            addition,
            subtraction,
            number2,
            result,
            regrouping,
            numberpads
        };
    }
    @catchError()
    setUpQuestionArea(row) {
        let firstOperand = (row[3] + "").indexOf(",")
        let tempFirst;
        if (firstOperand != -1) {
            tempFirst = (row[3] + "").split(",")
            this.firstNumber = this.selectRandomOne(tempFirst)
        }
        firstOperand = (row[3] + "").indexOf("-")
        if (firstOperand != -1) {
            tempFirst = (row[3] + "").split("-")
            this.firstNumber = this.generateRandomNumbers(tempFirst[0], tempFirst[1]);
        }
        if ((row[3] + "").length == 1)
            this.firstNumber = parseInt(tempFirst[0]);

        console.log(this.firstNumber.toString().trim().length, " <<< Str length ", this.firstNumber.toString().trim());
        // 4 - total labels expected , 

        // 6 second number
        let secondOperand = (row[6] + "").indexOf(",")
        let tempSecond;
        if (secondOperand != -1) {
            tempSecond = (row[6] + "").split(",")
            this.secondNumber = this.selectRandomOne(tempSecond)
        }
        secondOperand = (row[6] + "").indexOf("-")
        if (secondOperand != -1) {
            tempSecond = (row[6] + "").split("-")
            this.secondNumber = this.generateRandomNumbers(tempSecond[0], tempSecond[1]);
        }
        if ((row[6] + "").length == 1)
            this.secondNumber = parseInt(tempSecond[0]);


        // 4 isplus sign
        if (row[4] == "TRUE") {
            this.isPlusSign = true;
        }

        if (Number(this.secondNumber) > Number(this.firstNumber) && !this.isPlusSign) {
            // swap it
            this.secondNumber = Number(this.firstNumber) + Number(this.secondNumber);
            this.firstNumber = Number(this.secondNumber) - Number(this.firstNumber);
            this.secondNumber = Number(this.secondNumber) - Number(this.firstNumber);
        }
        let startIndex = 4 - this.firstNumber.toString().trim().length + 1
        for (let i = 0; i < this.firstNumber.toString().trim().length; i++) {
            // instantiate label preabaf
            let tempLabelPrefab = cc.instantiate(this.labelPrefab);
            tempLabelPrefab.getComponent(cc.Label).string = this.firstNumber.toString().trim().charAt(i);
            tempLabelPrefab.name = "" + i;
            // add to layout
            this.node.getChildByName("answersLabel").getChildByName("firstNum_1").getChildByName("" + (i + startIndex)).addChild(tempLabelPrefab)
        }

        // instantiate symbol on first place label preabaf
        let operatorLabelPrefab = cc.instantiate(this.labelPrefab);
        operatorLabelPrefab.getComponent(cc.Label).string = this.isPlusSign ? "+" : "-";
        operatorLabelPrefab.name = this.isPlusSign ? "plus" : "minus";

        this.node.getChildByName("answersLabel").getChildByName("secondNum_1").getChildByName("" + (4 - this.secondNumber.toString().trim().length)).addChild(operatorLabelPrefab)
        let startIndex2 = 4 - this.secondNumber.toString().trim().length + 1
        for (let i = 0; i < this.secondNumber.toString().trim().length; i++) {
            // instantiate label preabaf
            let tempLabelPrefab = cc.instantiate(this.labelPrefab);
            tempLabelPrefab.getComponent(cc.Label).string = this.secondNumber.toString().trim().charAt(i);
            tempLabelPrefab.name = "" + i;
            // add to layout
            this.node.getChildByName("answersLabel").getChildByName("secondNum_1").getChildByName("" + (i + startIndex2)).addChild(tempLabelPrefab)
        }
        // plus or minus
        if (this.isPlusSign) {
            this.resultNumber = Number(this.firstNumber) + Number(this.secondNumber);
        } else {
            this.resultNumber = Number(this.firstNumber) - Number(this.secondNumber);
        }

        // this.node.getChildByName("answersLabel").getChildByName("firstNum").getComponent(cc.Label).string = this.firstNumber + ""
        // this.node.getChildByName("answersLabel").getChildByName("secondNum").getComponent(cc.Label).string = this.isPlusSign ? "+" + this.secondNumber + "" : "-" + this.secondNumber + ""
        // this.node.getChildByName("answersLabel").getChildByName("answer").getComponent(cc.Label).string = ""
    }
    @catchError()
    setUpLayout() {
        this._drawingAreaNode = cc.instantiate(this.drawingAreaPrefab);
        this._layout.addChild(this._drawingAreaNode);
        this._countingAnswer = cc.instantiate(this.countingAnswerPrefab);
        this._countingAnswer.getComponent(CountingAnswer).numberpads = this._currentConfig.numberpads;
        this._countingAnswer.getComponent(CountingAnswer).result = "" + this.resultNumber;
        this._countingAnswer.getComponent(CountingAnswer).delay = 0;
        this._layout.addChild(this._countingAnswer);
    }
    @catchError()
    clearDrawing() {
        if (this.drawing != undefined)
            this.drawing.clear();
    }
    @catchError()
    onTouchStart(touch: cc.Touch) {
        const location = touch.getLocation();
        if (touch.getID() == 0) {
            this.startLocation.x = this.node.getParent().convertToNodeSpaceAR(location).x - this.adjustCords.x;
            this.startLocation.y = this.node.getParent().convertToNodeSpaceAR(location).y - this.adjustCords.y;
        }
        cc.log("on touch start!!! " + this.node.getParent().convertToNodeSpaceAR(location));
    }
    @catchError()
    generateRandomNumbers(start, end) {
        return Math.floor(Math.random() * (+end - +start)) + +start;
    }
    @catchError()
    selectRandomOne(arr) {
        const randomSelect = this.generateRandomNumbers(0, arr.length);
        return arr[randomSelect];
    }
    @catchError()
    onTouchMove(touch: cc.Touch) {

        if (touch.getID() == 0) {
            const location = touch.getLocation();
            const nodeSpaceLocation = this.node.getParent().convertToNodeSpaceAR(location);
            let tempCord = nodeSpaceLocation.x - this.adjustCords.x
            let tempCordY = nodeSpaceLocation.y - this.adjustCords.y
            cc.log("on move!!! " + tempCordY);
            if (this.calculateMagnitute(nodeSpaceLocation, this.last_location) > 10 && tempCord > -460 && tempCord < -50 && tempCordY > -250 && tempCordY < 250) {
                // if (this.calculateMagnitute(nodeSpaceLocation, this.last_location) > 10 && nodeSpaceLocation.x < (-40) && nodeSpaceLocation.x > -472 / 1 && nodeSpaceLocation.y > -512 / 2 && nodeSpaceLocation.y < 512 / 2) {
                console.log("Prefab Spawned!!!")
                this.drawing = this.node.getChildByName("canvas").getChildByName("graphicsNode").getComponent(cc.Graphics);
                this.drawing.lineWidth = 6;
                this.drawing.moveTo(this.startLocation.x, this.startLocation.y);
                this.drawing.lineTo(nodeSpaceLocation.x - this.adjustCords.x, nodeSpaceLocation.y - this.adjustCords.y);
                this.drawing.strokeColor = cc.Color.BLACK;
                this.drawing.stroke();


                this.last_location = nodeSpaceLocation;
                this.startLocation.x = nodeSpaceLocation.x - this.adjustCords.x;
                this.startLocation.y = nodeSpaceLocation.y - this.adjustCords.y;
            }
        }

    }
    @catchError()
    onTouchEnd(touch: cc.Touch) {
        cc.log("on touch end!!!");

    }
    @catchError()
    calculateMagnitute(location1, location2) {
        const deltaX = location1.x - location2.x;
        const deltaY = location1.y - location2.y;

        const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        // console.log(magnitude);
        return magnitude
    }
    @catchError()
    start() {
    }

    // update (dt) {}
    @catchError()
    onDestroy() {
        clearTimeout(this.clearTime);
    }
}
