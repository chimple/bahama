import Config from "../../../common/scripts/lib/config";
import MoveChoice from "./move-choice";
import MoveDrop from "./move-drop";
import { Util } from "../../../common/scripts/util";
import Drag from "../../../common/scripts/drag";
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import Layout = cc.Layout;
import { MOVE_MATCH, MOVE_NOT_MATCH } from "../../../common/scripts/helper";
import Game from "../../../common/scripts/game";

export const GAME_VOICE = "games/lettertracing/sounds";
const BLANK_DOMINO = "dominodiceblank_movingobjects";
const EQUAL_SIGN = "=";
const QUESTION_MARK = "?";

interface SumTogetherConfig {
  level: string;
  workSheet: string;
  problemNo: string;
  op: string;
  lhs: string;
  rhs: string;
}

enum OperationType {
  minus = "-",
  plus = "+",
}

class Queue<T> {
  _store: T[] = [];

  push(val: T) {
    this._store.push(val);
  }

  pop(): T | undefined {
    return this._store.shift();
  }
}

@ccclass
export class SumTogether extends Game {
  @property(cc.Prefab)
  progressMonitorPrefab: cc.Prefab = null;

  @property(cc.Node)
  optionsLayout: cc.Node = null;

  @property(cc.Node)
  equationLayout: cc.Node = null;

  @property(cc.Node)
  choicesLayout: cc.Node = null;

  @property(cc.Prefab)
  numberLabel: cc.Prefab = null;

  @property(cc.Prefab)
  dropLabel: cc.Prefab = null;

  @property(cc.Prefab)
  domino0: cc.Prefab = null;

  @property(cc.Prefab)
  domino1: cc.Prefab = null;

  @property(cc.Prefab)
  domino2: cc.Prefab = null;

  @property(cc.Prefab)
  domino3: cc.Prefab = null;

  @property(cc.Prefab)
  domino4: cc.Prefab = null;

  @property(cc.Prefab)
  domino5: cc.Prefab = null;

  @property(cc.Prefab)
  domino6: cc.Prefab = null;

  @property(cc.Prefab)
  domino7: cc.Prefab = null;

  @property(cc.Prefab)
  domino8: cc.Prefab = null;

  @property(cc.Prefab)
  domino9: cc.Prefab = null;

  @property(cc.Prefab)
  domino10: cc.Prefab = null;

  @property(cc.Prefab)
  dogPrefab: cc.Prefab = null;

  private _currentConfig: SumTogetherConfig = null;
  private _dropNode: cc.Node = null;
  private _answer: number = 0;
  private _operations: Queue<Function> = null;
  private _helpDragNode = null;
  private _helpShown: boolean = false;

  protected onLoad(): void {
    let manager = cc.director.getCollisionManager();
    manager.enabled = true;
    Drag.letDrag = true;

    this._operations = new Queue<Function>();

    this.optionsLayout.width = cc.winSize.width;

    this._currentConfig = this.processConfiguration(
      Config.getInstance().data[0]
    );
    if (this._currentConfig !== null) {
      // FIX: Removed console.log of config to save memory

      this.createOptions();
      this.createEquation();

      this._operations.push(this.renderLHS);
      this._operations.push(this.speakLHS);
      this._operations.push(this.displayLHS);
      this._operations.push(this.displayOperator);
      this._operations.push(this.renderRHS);
      this._operations.push(this.speakRHS);
      this._operations.push(this.displayRHS);
      this._operations.push(this.displayEquals);
      this._operations.push(this.createChoices);

      this.node.on(MOVE_MATCH, (event) => {
        event.stopPropagation();
        this.disableTouchOnChoices();
        this.node.emit("correct");
        this.scheduleOnce(() => {
          this.node.emit("nextProblem");
        });
      });

      this.node.on(MOVE_NOT_MATCH, (event) => {
        event.stopPropagation();
        const data = event.getUserData();
        // FIX: Safety check
        if (data && data.choice) {
          const moveChoice: MoveChoice = data.choice.getComponent(MoveChoice);
          if (moveChoice) moveChoice.dragInProgress = false;
        }
        this.node.emit("wrong");
      });

      this.processOperations();
    }
  }

  createOptions() {
    this.createDogs(
      Number(this._currentConfig.lhs),
      Number(this._currentConfig.rhs),
      this._currentConfig.op
    );
  }

  createEquation() {
    this.equationLayout.width = cc.winSize.width;
    this.equationLayout.addChild(
      this.createLabel(
        this._currentConfig.lhs,
        "L" + this._currentConfig.lhs,
        true
      )
    );
    this.equationLayout.addChild(
      this.createLabel(this._currentConfig.op, this._currentConfig.op, true)
    );
    this.equationLayout.addChild(
      this.createLabel(
        this._currentConfig.rhs,
        "R" + this._currentConfig.rhs,
        true
      )
    );
    this.equationLayout.addChild(
      this.createLabel(EQUAL_SIGN, EQUAL_SIGN, true)
    );
    this.equationLayout.addChild(this.createDropNode(QUESTION_MARK));
  }

  createDropNode(name: string, shrink: boolean = false) {
    this._dropNode = cc.instantiate(this.dropLabel);
    this._dropNode.opacity = 0;
    const moveDropComponent = this._dropNode.getComponent(MoveDrop);
    this._dropNode.group = "drop";
    this._dropNode.name = `domino${this._answer}`;
    const child = this._dropNode.getChildByName("label");
    const label = child.getComponent(cc.Label);
    const outLine = child.addComponent(cc.LabelOutline);
    outLine.width = 2;

    label.string = name;
    if (shrink) {
      label.fontSize = 60;
      this._dropNode.width = child.width;
    }
    return this._dropNode;
  }

  renderLHS() {
    this.unHideDogs(0, Number(this._currentConfig.lhs) - 1);
  }

  displayLHS() {
    let node = this.equationLayout.getChildByName(
      "L" + this._currentConfig.lhs
    );
    if (node) node.opacity = 255;
  }

  displayRHS() {
    let node = this.equationLayout.getChildByName(
      "R" + this._currentConfig.rhs
    );
    if (node) node.opacity = 255;
  }

  displayEquals() {
    let node = this.equationLayout.getChildByName(EQUAL_SIGN);
    if (node) node.opacity = 255;
    Util.speakEquation([EQUAL_SIGN], (index) => {});
  }

  displayOperator() {
    let node = this.equationLayout.getChildByName(this._currentConfig.op);
    if (node) node.opacity = 255;
    Util.speakEquation([this._currentConfig.op], (index) => {});
  }

  renderRHS() {
    switch (this._currentConfig.op) {
      case OperationType.minus:
        this.changeColors(
          Number(this._currentConfig.lhs) - Number(this._currentConfig.rhs),
          Number(this._currentConfig.rhs) +
            Number(this._currentConfig.lhs) -
            Number(this._currentConfig.rhs)
        );
        break;
      case OperationType.plus:
        this.unHideDogs(
          Number(this._currentConfig.lhs),
          Number(this._currentConfig.lhs) + Number(this._currentConfig.rhs) - 1,
          true
        );
        break;
    }
  }

  changeColor(n: cc.Node, color: cc.Color) {
    // FIX: REMOVED console.log(n). This was causing the stack overflow/crash.
    if (!n) return;
    const node = n.getChildByName("dominodice_movingobjects");
    if (node) node.color = color;
  }

  changeColors(fromIndex: number, toIndex: number) {
    const nodes: cc.Node[] = this.optionsLayout.children.filter(
      (c, i) => i >= fromIndex && i <= toIndex
    );
    nodes.forEach((n, i) => {
      this.changeColor(n, cc.Color.RED);
    });
  }

  processOperations() {
    this.scheduleOnce(() => {
      this.executePop();
    }, 0.5);
  }

  executePop() {
    const func: Function = this._operations.pop();
    if (!!func) {
      func.apply(this);
      this.scheduleOnce(() => {
        this.processOperations();
      }, 0);
    }
  }

  createDogs(lhsCount: number, rhsCount: number, operation: string) {
    for (let i = 1; i <= lhsCount; i++) {
      this.createDog(i);
    }

    switch (operation) {
      case OperationType.minus:
        break;
      case OperationType.plus:
        for (let i = 1; i <= rhsCount; i++) {
          this.createDog(i);
        }
        break;
    }
  }

  createDog(i: number) {
    const dName: string = `${"domino0"}`;
    const domino: cc.Node = cc.instantiate(this[dName]);
    domino.y = 30;
    domino.opacity = 0;
    domino.scale = 0.8;
    this.optionsLayout.addChild(domino);
  }

  unHideDogs(fromIndex: number, toIndex: number, changeColor: boolean = false) {
    const nodes: cc.Node[] = this.optionsLayout.children.filter(
      (c, i) => i >= fromIndex && i <= toIndex
    );

    nodes.forEach((n, i) => {
      if (changeColor) this.changeColor(n, cc.Color.GREEN);
      // FIX: Use modern tween if possible, or standard way
      cc.tween(n)
        .to(0.5 + 0.5 * i, { opacity: 255 }, { easing: "quadOut" })
        .start();
    });
  }

  speakLHS() {
    Util.speakEquation([String(this._currentConfig.lhs)], (index) => {});
  }

  speakRHS() {
    Util.speakEquation([String(this._currentConfig.rhs)], () => {});
  }

  private disableTouchOnChoices() {
    this.choicesLayout.children.forEach((c) => {
      c.getComponent(MoveChoice).disableTouch();
    });
  }

  private createChoices() {
    this.choicesLayout.width = cc.winSize.width;
    for (let i = 0; i <= 9; i++) {
      const dName: string = `${"domino" + i}`;
      const domino: cc.Node = cc.instantiate(this[dName]);
      domino.opacity = 255;
      domino.width = 95;
      domino.height = 178;
      this.choicesLayout.addChild(domino);
      domino.children.forEach((c) => {
        if (c.name === BLANK_DOMINO) {
          const autoDragComponent = domino.getComponent(MoveChoice);
          autoDragComponent.value = i;
          autoDragComponent.parent = this.node;
          const labelNode: cc.Node = this.createLabel(String(i));
          labelNode.name = "number" + String(i);
          if (Number(this._answer) === i) this._helpDragNode = labelNode;
          c.addChild(labelNode);
          labelNode.opacity = 0;
          autoDragComponent.label = labelNode.getComponent(cc.Label);
          const outLine = labelNode.addComponent(cc.LabelOutline);
          outLine.width = 2;
          autoDragComponent.moveDropNode = this._dropNode;
        }
      });
    }

    this.scheduleOnce(() => {
      this.showDominos();
    }, 1);
  }

  protected showDominos() {
    // FIX: Optimized loop to prevent layout thrashing
    this.choicesLayout.children.forEach((domino, i) => {
      cc.tween(domino)
        .to(0.05 + 0.05 * i, { opacity: 255 }, { easing: "quadOut" })
        .to(0.05, { scaleX: 0 }, { easing: "quadOut" })
        .call(() => {
          domino.children.forEach((c) => {
            if (c.name !== BLANK_DOMINO) {
              c.opacity = 0;
              c.active = false;
            } else {
              c.opacity = 255;
              const labelNode = c.getChildByName(`number${i}`);
              if (labelNode) {
                labelNode.active = true;
                labelNode.opacity = 255;
              }
            }
          });
        })
        .to(0.05, { scaleX: 1 }, { easing: "quadOut" })
        .call(() => {
          // FIX: Only update layout type once at end of animations if possible, or perform check
          const layout = this.choicesLayout.getComponent(cc.Layout);
          if (layout && layout.type !== Layout.Type.NONE) {
            layout.type = Layout.Type.NONE;
          }

          if (this._dropNode) this._dropNode.opacity = 255;

          if (i === this.choicesLayout.childrenCount - 1) {
            this.scheduleOnce(() => {
              if (!this._helpShown && this._helpDragNode) {
                this._helpShown = true;
                Util.showHelp(this._helpDragNode, this._helpDragNode);
              }
            }, 1);
          }
        })
        .start();
    });
  }

  private computeAnswer(lhs: string, rhs: string, op: string) {
    switch (op) {
      case OperationType.minus:
        this._answer = Number(lhs) - Number(rhs);
        break;
      case OperationType.plus:
        this._answer = Number(lhs) + Number(rhs);
        break;
    }
  }

  private processConfiguration(data: any[] = []): SumTogetherConfig | null {
    const configurations: any[] = [].concat(...data);
    let [level, workSheet, problemNo, op, lhs, rhs] = configurations;
    this.computeAnswer(lhs, rhs, op);
    return {
      level,
      workSheet,
      problemNo,
      op,
      lhs,
      rhs,
    };
  }

  createLabel(
    name: string,
    changeName: string = null,
    hide: boolean = false,
    shrink: boolean = false
  ): cc.Node {
    const labelNode = cc.instantiate(this.numberLabel);
    const child = labelNode.getChildByName("label");
    const label = child.getComponent(cc.Label);
    if (!!changeName) {
      labelNode.name = changeName;
    }

    if (hide) {
      labelNode.opacity = 0;
    }

    const outLine = child.addComponent(cc.LabelOutline);
    outLine.width = 2;

    label.string = name;
    if (shrink) {
      label.fontSize = 60;
      labelNode.width = child.width;
    }
    return labelNode;
  }
}
