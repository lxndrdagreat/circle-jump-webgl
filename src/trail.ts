import {SimpleRope, Container, Point, BLEND_MODES} from 'pixi.js';
import {Loader} from '@pixi/loaders';
import {cubicInterpolation, SimpleVector2, Vector2} from './utils';

export class Trail extends Container {

  private points: Point[] = [];
  private history: [x: number, y: number][] = [];
  private rope: SimpleRope;

  constructor(initialPoint: Point, private ropeSize: number = 100, private historySize: number = 20) {
    super();

    for (let i = 0; i < historySize; ++i) {
      this.history.push([initialPoint.x, initialPoint.y]);
    }
    for (let i = 0; i < ropeSize; ++i) {
      this.points.push(new Point(initialPoint.x, initialPoint.y));
    }

    const texture = Loader.shared.resources['/public/trail.png'].texture!;
    this.rope = new SimpleRope(texture, this.points);
    this.rope.blendMode = BLEND_MODES.ADD;
    this.rope.tint = 0xffff77;
    this.addChild(this.rope);
  }

  addPoint(point: Point | SimpleVector2 | Vector2): void {
    this.history.pop();
    this.history.unshift([
      point.x,
      point.y
    ]);
    // update the rope
    const historyX = this.history.map(h => h[0]);
    const historyY = this.history.map(h => h[1]);
    for (let i = 0; i < this.ropeSize; ++i) {
      const point = this.points[i];
      // Smooth the curve with cubic interpolation to prevent sharp edges.
      const ix = cubicInterpolation(historyX, i / this.ropeSize * this.historySize);
      const iy = cubicInterpolation(historyY, i / this.ropeSize * this.historySize);

      point.x = ix;
      point.y = iy;
    }
  }
}
