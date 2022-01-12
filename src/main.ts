import './style.css';
import './stars.css';
import { autoDetectRenderer, Container, Ticker } from 'pixi.js';
import { CommonKeys, InputSystem } from './systems/input.system';
import { Transition } from './transition';
import { Jumper } from './jumper';
import Circle, { CircleJumperState } from './circle';
import { randomInt, SimpleVector2, Vector2 } from './utils';
import { EventSystem } from './systems/event.system';
import { loadGameAssets } from './loading';
import ui from './ui-utils';
import { Trail } from './trail';
import { TimersSystem } from './systems/timers.system';

enum GameState {
  TapToStart,
  Playing
}

document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector<HTMLDivElement>('#app')!;

  const renderer = autoDetectRenderer({
    antialias: false,
    autoDensity: true,
    backgroundAlpha: 0,
    width: 480,
    height: 854
  });

  const stage = new Container();
  const playLayer = new Container();
  let activeTransition: Transition | null = null;

  const startPosition = new Vector2(240, 700);
  let cameraTargetPosition = new Vector2();
  let jumper: Jumper;
  let score = 0;
  let trail: Trail;
  let gameState: GameState = GameState.TapToStart;

  loadGameAssets().then(() => {
    stage.addChild(playLayer);

    // replace loading with scene
    while (wrapper.lastChild) {
      wrapper.removeChild(wrapper.lastChild);
    }
    wrapper.appendChild(renderer.view);

    function onJumperCaptured(eventArgs: [Circle]): void {
      const [circle] = eventArgs;
      const { x, y } = circle.position;
      cameraTargetPosition.x = -240 + x;
      cameraTargetPosition.y = -700 + y;
      spawnCircle();
      score += 1;
      ui.setScore(score);
    }
    EventSystem.shared.connect('JumperCaptured', onJumperCaptured);

    function onCircleOutOfOrbits([circle]: [Circle]): void {
      if (circle !== jumper.attachedTo) {
        return;
      }
      // kill the jumper
      newGame();
    }
    EventSystem.shared.connect('OutOfOrbits', onCircleOutOfOrbits);

    function newGame(): void {
      // cleanup / re-init
      score = 0;
      ui.setScore(0);
      playLayer.removeChildren();
      TimersSystem.shared.stopAll();
      gameState = GameState.TapToStart;
      ui.setShowStart(true);
    }

    function startGame(): void {
      jumper = new Jumper();
      jumper.position.set(startPosition.x, startPosition.y);
      cameraTargetPosition.x = -240 + startPosition.x;
      cameraTargetPosition.y = -700 + startPosition.y;
      playLayer.pivot.set(cameraTargetPosition.x, cameraTargetPosition.y);
      playLayer.addChild(jumper);
      trail = new Trail(jumper.position);
      playLayer.addChild(trail);
      spawnCircle(startPosition, 50);
      gameState = GameState.Playing;
      ui.setShowStart(false);
    }

    function spawnCircle(position?: SimpleVector2, radius?: number): Circle {
      position = position || {
        x: (jumper.attachedTo?.position.x || 0) + randomInt(-150, 150),
        y: (jumper.attachedTo?.position.y || 0) + randomInt(-550, -300)
      };
      const newCircle = Circle.spawn(position, radius);
      playLayer.addChild(newCircle);
      return newCircle;
    }

    newGame();
    wrapper.classList.add('ready');

    // Start the game loop
    Ticker.shared.add(() => {
      const delta = Ticker.shared.elapsedMS * 0.001;

      TimersSystem.shared.processTimers(delta);

      if (activeTransition) {
        activeTransition.update(stage);
      } else if (gameState === GameState.TapToStart) {
        if (
          InputSystem.shared.keyPressed(CommonKeys.Space) ||
          InputSystem.shared.mouseClicked
        ) {
          startGame();
        }
      } else if (gameState === GameState.Playing && jumper) {
        jumper.update(delta);
        trail.addPoint(jumper.position);

        for (const circle of playLayer.children.filter(
          (child) => child instanceof Circle
        ) as Circle[]) {
          circle.update(delta);
          if (
            !jumper.attachedTo &&
            circle.jumperState === CircleJumperState.Awaiting
          ) {
            circle.checkJumperCollision(jumper);
          }
        }

        // ease camera
        const cameraMovement = 1000 * delta;
        const cameraPos = new Vector2(
          playLayer.pivot.x,
          playLayer.pivot.y
        ).moveTowards(cameraTargetPosition, cameraMovement);
        playLayer.pivot.set(cameraPos.x, cameraPos.y);

        if (
          InputSystem.shared.keyPressed(CommonKeys.Space) ||
          InputSystem.shared.mouseClicked
        ) {
          jumper.jump();
        }

        // check boundary for game over
        if (
          jumper.position.x < playLayer.pivot.x ||
          jumper.position.x > renderer.width + playLayer.pivot.x ||
          jumper.position.y < playLayer.pivot.y ||
          jumper.position.y > renderer.height + playLayer.pivot.y
        ) {
          newGame();
        }
      }

      renderer.render(stage);

      InputSystem.shared.flush();
    });
  });

  // TODO: remove for production
  /* @ts-ignore */
  (function () {
    var script = document.createElement('script');
    script.onload = function () {
      // @ts-ignore
      var stats = new Stats();
      document.body.appendChild(stats.dom);
      requestAnimationFrame(function loop() {
        stats.update();
        requestAnimationFrame(loop);
      });
    };
    script.src = '//mrdoob.github.io/stats.js/build/stats.min.js';
    document.head.appendChild(script);
  })();
});
