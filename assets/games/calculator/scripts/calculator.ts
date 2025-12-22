const { ccclass, property } = cc._decorator;
import { HELP_BTN } from "../../../common/scripts/answer-grid";
import CountingAnswer, {
  VALIDATE_RESULT,
} from "../../../common/scripts/counting-answer";
import Game from "../../../common/scripts/game";
import Config from "../../../common/scripts/lib/config";
import catchError from "../../../common/scripts/lib/error-handler";
import { Util } from "../../../common/scripts/util";

export interface CalculatorConfig {
  level: string;
  worksheet: string;
  problemCount: string;
  number1: string;
  addition: string;
  subtraction: string;
  number2: string;
  result: string;
  regrouping: string;
  numberpads: string[];
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
  text: string = "hello";

  protected highlightNode: cc.Node = null;

  // FIX: Type defined to prevent 'any' overhead
  drawing: cc.Graphics = null;

  last_location: cc.Vec2 = new cc.Vec2(0, 0);
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
      let lblNode = this.node.getChildByName("writeLabel");
      if (lblNode)
        lblNode.getComponent(cc.Label).string = Util.i18NText("Write here");
    });

    this._currentConfig = this.processConfiguration(
      Config.getInstance().data[0]
    );

    this.loadData();

    this._graphicsNode = cc.instantiate(this.drawingDot);
    this._graphicsNode.name = "canvas";
    this.node.addChild(this._graphicsNode);

    // FIX: Cache the Graphics component HERE.
    // Doing this inside touchMove causes memory leaks.
    let gfxNode = this._graphicsNode.getChildByName("graphicsNode");
    if (gfxNode) {
      this.drawing = gfxNode.getComponent(cc.Graphics);
    } else {
      this.drawing = this._graphicsNode.getComponent(cc.Graphics);
    }

    // Set properties once
    if (this.drawing) {
      this.drawing.lineWidth = 6;
      this.drawing.strokeColor = cc.Color.BLACK;
      this.drawing.lineJoin = cc.Graphics.LineJoin.ROUND;
      this.drawing.lineCap = cc.Graphics.LineCap.ROUND;
    }

    this.last_location = new cc.Vec2(0, 0);

    this.node
      .getChildByName("clearDraw")
      .getComponent(cc.Button)
      .node.on("click", this.clearDrawing, this);

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
        let startIndex3 = 4 - this.resultNumber.toString().trim().length + 1;
        for (let i = 0; i < this.resultNumber.toString().trim().length; i++) {
          let resultLabelPrefab = cc.instantiate(this.labelPrefab);
          resultLabelPrefab.getComponent(cc.Label).string = this.resultNumber
            .toString()
            .trim()
            .charAt(i);
          resultLabelPrefab.name = i + "";

          this.node
            .getChildByName("answersLabel")
            .getChildByName("answer_1")
            .getChildByName("" + (i + startIndex3))
            .addChild(resultLabelPrefab);
        }
        temp -= 1;
        this._answeredCorrectly = true;
        this.problemCount = temp;
        this.node.emit("nextProblem");
        this.node.emit("correct");
        this._countingAnswer.getComponent(CountingAnswer).isValidResult = true;
      } else {
        if (!this._answeredCorrectly) {
          console.log("You r wrong .right is >> " + this.resultNumber);
          this.node.emit("wrong");
          this._countingAnswer.getComponent(CountingAnswer).clearDigits(false);
        }
      }
      console.log(data.result + " ::: ");
    });

    this.node.on(HELP_BTN, (event) => {
      event.stopPropagation();
      const data = event.getUserData();
      console.log(data, " [] ", data.helpNodes);
      this.showHelp(this.helpIterator(data.helpNodes));
    });
  }

  @catchError()
  private helpIterator(helpNodes: cc.Node[]) {
    return helpNodes[Symbol.iterator]();
  }
  @catchError()
  showHelp(helpIterator, playAudio: boolean = true) {
    let nextItem = helpIterator.next();
    if (!nextItem.done) {
      Util.showHelp(
        nextItem.value,
        nextItem.value,
        () => {
          this.showHelp(helpIterator, false);
        },
        playAudio
      );
    }
  }
  @catchError()
  loadData() {
    const row = Config.getInstance().data[0];
    this.rowData = row;
    this.setUpQuestionArea(row);
    this.clearDrawing();
  }

  private processConfiguration(data: any[] = []): CalculatorConfig | null {
    const configurations: any[] = [].concat(...data);
    let [
      level,
      worksheet,
      problemCount,
      number1,
      addition,
      subtraction,
      number2,
      result,
      regrouping,
      numberpads,
    ] = configurations;

    if (numberpads && typeof numberpads === "string") {
      numberpads = numberpads.split(",");
    } else {
      numberpads = [];
    }

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
      numberpads,
    };
  }
  @catchError()
  setUpQuestionArea(row) {
    let firstOperand = (row[3] + "").indexOf(",");
    let tempFirst;
    if (firstOperand != -1) {
      tempFirst = (row[3] + "").split(",");
      this.firstNumber = this.selectRandomOne(tempFirst);
    }
    firstOperand = (row[3] + "").indexOf("-");
    if (firstOperand != -1) {
      tempFirst = (row[3] + "").split("-");
      this.firstNumber = this.generateRandomNumbers(tempFirst[0], tempFirst[1]);
    }
    if ((row[3] + "").length == 1)
      this.firstNumber = parseInt(tempFirst ? tempFirst[0] : row[3]);

    console.log(
      this.firstNumber.toString().trim().length,
      " <<< Str length ",
      this.firstNumber.toString().trim()
    );

    let secondOperand = (row[6] + "").indexOf(",");
    let tempSecond;
    if (secondOperand != -1) {
      tempSecond = (row[6] + "").split(",");
      this.secondNumber = this.selectRandomOne(tempSecond);
    }
    secondOperand = (row[6] + "").indexOf("-");
    if (secondOperand != -1) {
      tempSecond = (row[6] + "").split("-");
      this.secondNumber = this.generateRandomNumbers(
        tempSecond[0],
        tempSecond[1]
      );
    }
    if ((row[6] + "").length == 1)
      this.secondNumber = parseInt(tempSecond ? tempSecond[0] : row[6]);

    if (row[4] == "TRUE") {
      this.isPlusSign = true;
    }

    if (
      Number(this.secondNumber) > Number(this.firstNumber) &&
      !this.isPlusSign
    ) {
      this.secondNumber = Number(this.firstNumber) + Number(this.secondNumber);
      this.firstNumber = Number(this.secondNumber) - Number(this.firstNumber);
      this.secondNumber = Number(this.secondNumber) - Number(this.firstNumber);
    }
    let startIndex = 4 - this.firstNumber.toString().trim().length + 1;
    for (let i = 0; i < this.firstNumber.toString().trim().length; i++) {
      let tempLabelPrefab = cc.instantiate(this.labelPrefab);
      tempLabelPrefab.getComponent(cc.Label).string = this.firstNumber
        .toString()
        .trim()
        .charAt(i);
      tempLabelPrefab.name = "" + i;
      this.node
        .getChildByName("answersLabel")
        .getChildByName("firstNum_1")
        .getChildByName("" + (i + startIndex))
        .addChild(tempLabelPrefab);
    }

    let operatorLabelPrefab = cc.instantiate(this.labelPrefab);
    operatorLabelPrefab.getComponent(cc.Label).string = this.isPlusSign
      ? "+"
      : "-";
    operatorLabelPrefab.name = this.isPlusSign ? "plus" : "minus";

    this.node
      .getChildByName("answersLabel")
      .getChildByName("secondNum_1")
      .getChildByName("" + (4 - this.secondNumber.toString().trim().length))
      .addChild(operatorLabelPrefab);
    let startIndex2 = 4 - this.secondNumber.toString().trim().length + 1;
    for (let i = 0; i < this.secondNumber.toString().trim().length; i++) {
      let tempLabelPrefab = cc.instantiate(this.labelPrefab);
      tempLabelPrefab.getComponent(cc.Label).string = this.secondNumber
        .toString()
        .trim()
        .charAt(i);
      tempLabelPrefab.name = "" + i;
      this.node
        .getChildByName("answersLabel")
        .getChildByName("secondNum_1")
        .getChildByName("" + (i + startIndex2))
        .addChild(tempLabelPrefab);
    }
    if (this.isPlusSign) {
      this.resultNumber = Number(this.firstNumber) + Number(this.secondNumber);
    } else {
      this.resultNumber = Number(this.firstNumber) - Number(this.secondNumber);
    }
  }
  @catchError()
  setUpLayout() {
    this._drawingAreaNode = cc.instantiate(this.drawingAreaPrefab);
    this._layout.addChild(this._drawingAreaNode);
    this._countingAnswer = cc.instantiate(this.countingAnswerPrefab);
    this._countingAnswer.getComponent(CountingAnswer).numberpads =
      this._currentConfig.numberpads;
    this._countingAnswer.getComponent(CountingAnswer).result =
      "" + this.resultNumber;
    this._countingAnswer.getComponent(CountingAnswer).delay = 0;
    this._layout.addChild(this._countingAnswer);
  }
  @catchError()
  clearDrawing() {
    // FIX: Safety check
    if (this.drawing) this.drawing.clear();
  }
  @catchError()
  onTouchStart(touch: cc.Touch) {
    const location = touch.getLocation();
    if (touch.getID() == 0) {
      let nodeSpace = this.node.getParent().convertToNodeSpaceAR(location);
      this.startLocation.x = nodeSpace.x - this.adjustCords.x;
      this.startLocation.y = nodeSpace.y - this.adjustCords.y;
    }
    // FIX: Removed log
    // cc.log("on touch start!!!");
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
    // FIX: Ensure we have the component and correct touch ID
    if (!this.drawing) return;
    if (touch.getID() != 0) return;

    const location = touch.getLocation();
    const nodeSpaceLocation = this.node
      .getParent()
      .convertToNodeSpaceAR(location);

    // FIX: Calculate vars once
    let targetX = nodeSpaceLocation.x - this.adjustCords.x;
    let targetY = nodeSpaceLocation.y - this.adjustCords.y;

    // FIX: REMOVED CONSOLE LOGS HERE (Major Crash Cause)

    if (
      this.calculateMagnitute(nodeSpaceLocation, this.last_location) > 10 &&
      targetX > -460 &&
      targetX < -50 &&
      targetY > -250 &&
      targetY < 250
    ) {
      // FIX: Use cached 'this.drawing' directly
      this.drawing.moveTo(this.startLocation.x, this.startLocation.y);
      this.drawing.lineTo(targetX, targetY);
      this.drawing.stroke();

      this.last_location = nodeSpaceLocation;
      this.startLocation.x = targetX;
      this.startLocation.y = targetY;
    }
  }

  @catchError()
  onTouchEnd(touch: cc.Touch) {
    // cc.log("on touch end!!!");
  }
  @catchError()
  calculateMagnitute(location1, location2) {
    const deltaX = location1.x - location2.x;
    const deltaY = location1.y - location2.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
  @catchError()
  start() {}

  @catchError()
  onDestroy() {
    clearTimeout(this.clearTime);
    this.node.off(VALIDATE_RESULT);
    this.node.off(HELP_BTN);
  }
}
