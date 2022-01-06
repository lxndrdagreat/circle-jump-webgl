export enum KeyboardEventType {
    KEY_DOWN = 'KEY_DOWN',
    KEY_UP = 'KEY_UP'
  }
  
  export enum MouseEventType {
    MOUSE_MOVE = 'MOUSE_MOVE'
  }

  export enum CommonKeys {
      ArrowLeft = 'arrowleft',
      ArrowRight = 'arrowRight',
      ArrowUp = 'arrowup',
      ArrowDown = 'arrowdown',
      Enter = 'Enter',
      Space = ' '
  }
  
  export const AlphaNumericCharacters: Readonly<string[]> =
    'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
  
  export class InputSystem {
    private static _instance: InputSystem;
    private pressedKeys = new Map<string, boolean>();
    private newPressedKeys: string[] = [];
    private newReleasedKeys: string[] = [];
    private _mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  
    constructor(bindElement: HTMLElement | Window = window) {
      // Set up input bindings
      bindElement.addEventListener('keydown', (event: Event) => {
        this._handleKeyboardEvent(
          event as KeyboardEvent,
          KeyboardEventType.KEY_DOWN
        );
      });
  
      bindElement.addEventListener('keyup', (event: Event) => {
        this._handleKeyboardEvent(
          event as KeyboardEvent,
          KeyboardEventType.KEY_UP
        );
      });
  
      bindElement.addEventListener('mousemove', (event: Event) => {
        if ((event.target as HTMLElement).nodeName !== 'CANVAS') {
          return;
        }
        this._handleMouseEvent(event as MouseEvent, MouseEventType.MOUSE_MOVE);
      });
    }
  
    static get shared(): InputSystem {
      if (!InputSystem._instance) {
        InputSystem._instance = new InputSystem();
      }
      return InputSystem._instance;
    }
  
    flush(): void {
      this.newPressedKeys = [];
      this.newReleasedKeys = [];
    }
  
    private _handleKeyboardEvent(
      event: KeyboardEvent,
      kind: KeyboardEventType
    ): void {
      if (kind === KeyboardEventType.KEY_DOWN) {
        // If key is newly pressed...
        if (
          this.keyUp(event.key.toUpperCase()) &&
          this.newPressedKeys.indexOf(event.key.toUpperCase()) < 0
        ) {
          this.newPressedKeys.push(event.key.toUpperCase());
        }
        this.pressedKeys.set(event.key.toUpperCase(), true);
      } else {
        if (
          this.keyDown(event.key.toUpperCase()) &&
          this.newReleasedKeys.indexOf(event.key.toUpperCase()) < 0
        ) {
          this.newReleasedKeys.push(event.key.toUpperCase());
        }
        this.pressedKeys.set(event.key.toUpperCase(), false);
      }
    }
  
    private _handleMouseEvent(event: MouseEvent, _kind: MouseEventType): void {
      const canvas = event.target as HTMLCanvasElement;
      this._mousePosition = {
        x: Math.round(event.clientX - canvas.getBoundingClientRect().left),
        y: Math.round(event.clientY - canvas.getBoundingClientRect().top)
      };
    }
  
    /*
     * Returns true if the given key was newly pressed (since the last frame)
     */
    keyPressed(key: string): boolean {
      return this.newPressedKeys.indexOf(key.toUpperCase()) >= 0;
    }
  
    /*
     * Returns true if the given key was newly released (since the last frame)
     */
    keyReleased(key: string): boolean {
      return this.newReleasedKeys.indexOf(key.toUpperCase()) >= 0;
    }
  
    /*
     * Is the given key currently down (pressed)
     */
    keyDown(key: string): boolean {
      return (
        this.pressedKeys.has(key.toUpperCase()) &&
        this.pressedKeys.get(key.toUpperCase()) === true
      );
    }
  
    /*
     * Is the given key currently up (not pressed)
     */
    keyUp(key: string): boolean {
      return !this.keyDown(key.toUpperCase());
    }
  
    getNewKeys(): string[] {
      return this.newPressedKeys;
    }
  
    get mousePosition(): Readonly<{ x: number; y: number }> {
      return this._mousePosition;
    }
  }
  