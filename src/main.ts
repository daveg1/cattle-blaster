import "./style.css";
import * as THREE from "three";
import { createRenderer } from "./utils/create-renderer";
import { GameScene } from "./game-scene";
import { playSFX } from "./utils/play-sfx";

const startButton = document.querySelector(
  "#start-button"
) as HTMLButtonElement;

const state: {
  goAgain: boolean;
  hideStartButton: boolean;
  clock: THREE.Clock;
  gameScene?: GameScene;
} = {
  goAgain: false,
  hideStartButton: false,
  clock: new THREE.Clock(),
};

// UI event listeners
startButton.addEventListener("click", () => {
  playSFX("ricochet");
  setTimeout(() => {
    state.gameScene?.startGame();
    state.hideStartButton = true;
    updateStartButton();
  }, 500);
});

function updateStartButton() {
  startButton.hidden = state.hideStartButton;
  startButton.textContent = state.goAgain ? "Play again" : "Start";
}

function updateLoop() {
  if (!state.gameScene) {
    return;
  }

  // Show start button if game ended
  if (state.gameScene?.hasGameEnded && state.hideStartButton) {
    state.hideStartButton = false;
    state.goAgain = true;
    updateStartButton();
  }

  // Delta time
  const dt = state.clock.getDelta();

  // Update current scene
  state.gameScene?.update(dt);

  window.requestAnimationFrame(updateLoop);
}

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const renderer = createRenderer(canvas);
// const models = Promise.all([cowLoader, gunLoader, floorLoader])

state.gameScene = new GameScene(canvas, renderer);

updateLoop();
