import { Container } from '@pixi/display';

export type TransitionOnCompleteHandler = () => void;

export abstract class Transition extends Container {
  constructor(protected onComplete: TransitionOnCompleteHandler) {
    super();
  }

  abstract update(rootStage: Container): void;
}
