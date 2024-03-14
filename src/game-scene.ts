import * as THREE from "three";
import { OrbitControls } from "three/addons";
import { CowFactory } from "./objects/cow-factory";
import { playSFX } from "./utils/play-sfx";
import { FloorFactory } from "./objects/floor-factory";
import { raycast } from "./utils/raycast";
import { GunFactory } from "./objects/gun-loader";

// Model Farm Animal Pack by Quaternius via Poly Pizza

export class GameScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  private canvasSize: THREE.Vector2;
  private renderSize: THREE.Vector2;
  // What the gun raycast hits - plane that faces the gun
  private mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1));

  private bgMusic?: HTMLAudioElement;

  readonly #KILL_DEPTH = -1;
  readonly #SCORE_TO_WIN = 15;
  #score = 0;
  #hasGameStarted = false;
  #hasGameEnded = false;

  get hasGameEnded() {
    return this.#hasGameEnded;
  }

  constructor(
    private canvas: HTMLCanvasElement,
    private renderer: THREE.WebGLRenderer
  ) {
    this.canvasSize = new THREE.Vector2();
    this.renderSize = new THREE.Vector2();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight
    );
    this.camera.position.set(5.8, 2.6, 9.2);
    this.camera.rotation.set(0, 0, 0);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(6.1, 1.1, 0);
    this.controls.update();
    this.controls.enabled = false;

    const sun = new THREE.DirectionalLight(undefined, Math.PI); // undo physically correct changes
    sun.position.copy(new THREE.Vector3(0.75, 1, 0.5).normalize());
    const ambient = new THREE.AmbientLight(undefined, 0.25);
    this.scene.add(sun);
    this.scene.add(ambient);

    // Create floors
    FloorFactory.create(this.scene);

    // Create gun
    GunFactory.create(this.scene);

    this.renderer.setClearColor(0x000, 0);

    // Handle shooting logic
    document.body.addEventListener(
      "pointermove",
      this.handlePointerMove.bind(this)
    );
    document.body.addEventListener(
      "pointerdown",
      this.handlePointerDown.bind(this)
    );
  }

  private handlePointerMove(e: PointerEvent) {
    const raycaster = raycast(e.clientX, e.clientY, this.canvas, this.camera);

    // This was key! Ray has to hit something, so we make a plane for it to hit
    // intersectPlane gives us a point on that plane which the ray hits, then we look at it!
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(this.mousePlane, target);

    GunFactory.object?.lookAt(target);
  }

  private handlePointerDown(e: PointerEvent) {
    if (this.#hasGameEnded) {
      return;
    }

    playSFX("shoot", { volume: 0.4 });

    const raycaster = raycast(e.x, e.y, this.canvas, this.camera);
    const intersections = raycaster.intersectObjects(CowFactory.objects);

    if (intersections[0]) {
      const didHit = CowFactory.killIfHits(intersections[0].object);

      if (didHit) {
        this.#score++;
        this.updateScore();
      }
    }

    if (this.#score === this.#SCORE_TO_WIN) {
      this.winGame();
    }
  }

  update(dt: number) {
    this.controls.update();

    if (this.#hasGameEnded) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // Hide render logic
    this.updateCanvas();

    if (this.#hasGameStarted) {
      // Make cows descend
      for (let i = CowFactory.objects.length; i--; ) {
        const cow = CowFactory.objects[i];
        cow.position.y -= 1 * dt;

        if (cow.position.y <= this.#KILL_DEPTH) {
          this.loseGame();
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  private updateCanvas() {
    // Update canvas size
    this.canvasSize.set(
      this.canvas.parentElement!.clientWidth,
      this.canvas.parentElement!.clientHeight
    );

    // Check if we need to resize the renderer to match canvas size
    if (!this.renderSize.equals(this.canvasSize)) {
      this.renderSize.copy(this.canvasSize);
      this.renderer.setSize(this.renderSize.x, this.renderSize.y, false);

      this.camera.aspect = this.renderSize.x / this.renderSize.y;
      this.camera.updateProjectionMatrix();
    }
  }

  private updateScore() {
    const scoreElem = document.getElementById("game-score") as HTMLElement;
    scoreElem.textContent = `Score: ${this.#score}`;
  }

  startGame() {
    // Reset state
    this.#hasGameStarted = true;
    this.#hasGameEnded = false;
    this.#score = 0;

    (document.getElementById("game-won") as HTMLElement).hidden = true;
    (document.getElementById("game-lost") as HTMLElement).hidden = true;

    // Clear existing objects
    if (CowFactory.objects.length) {
      CowFactory.clear(this.scene);
    }

    // Create 10 cows
    for (let i = 0; i < 10; i++) {
      CowFactory.create(this.scene);
    }

    playSFX("jeehaw", { volume: 0.6 });
    this.bgMusic = playSFX("music", { loop: true, volume: 1.0 });
  }

  private endGame() {
    this.#hasGameEnded = true;
    this.bgMusic?.pause();
    this.bgMusic!.currentTime = 0;
  }

  private winGame() {
    this.endGame();

    const message = document.getElementById("game-won") as HTMLElement;
    message.hidden = false;

    playSFX("heeyaw", { volume: 0.7 });
    setTimeout(() => playSFX("pardner", { volume: 0.7 }), 2000);
  }

  private loseGame() {
    this.endGame();

    playSFX("wet-fart", { volume: 0.5 });
    setTimeout(() => {
      playSFX("prayin", { volume: 0.2 });
    }, 500);

    const message = document.getElementById("game-lost") as HTMLElement;
    message.hidden = false;
  }
}
