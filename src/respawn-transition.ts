import { Transition, TransitionOnCompleteHandler } from './transition';
import { Container } from '@pixi/display';
import { Ticker } from '@pixi/ticker';
import { Graphics } from '@pixi/graphics';

const SPEED = 1;

export class RespawnTransition extends Transition {
  private stage: number = 0;
  private timer: number = SPEED;

  constructor(onComplete: TransitionOnCompleteHandler) {
    super(onComplete);

    const g = new Graphics();
    g.beginFill(0x000000);
    g.drawRect(0, 0, 800, 600);
    this.addChild(g);
    this.alpha = 0;
  }

  update(rootStage: Container): void {
    if (!rootStage.children.includes(this)) {
      rootStage.addChild(this);
    }

    if (this.stage < 2) {
      this.timer -= Ticker.shared.deltaMS * 0.001;
      if (this.timer <= 0) {
        this.timer = SPEED;
        this.stage += 1;
        if (this.stage === 1) {
          // move player
        } else if (this.stage === 2) {
          // end
          this.onComplete();
        }
      } else if (this.stage === 0) {
        // fade to black
        this.alpha = 1 - (1.0 / SPEED) * this.timer;
      } else if (this.stage === 1) {
        // fade in
        this.alpha = (1.0 / SPEED) * this.timer;
      }
    }
  }
}
