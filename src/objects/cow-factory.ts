import * as THREE from "three";
import { GLTFLoader } from "three/addons";
import { playSFX } from "../utils/play-sfx";

const loader = new GLTFLoader().setPath("models/");

export class CowFactory {
  static readonly #objects: THREE.Object3D[] = [];

  static get objects() {
    return this.#objects;
  }

  static async create(scene: THREE.Scene) {
    const model = await loader.loadAsync("cow.glb");
    const object = model.scene;
    const scale = 0.3;

    object.scale.set(scale, scale, scale);
    object.position.x = this.randomXPos();
    object.position.y = 5;

    scene.add(object);
    this.#objects.push(object);
  }

  static killIfHits(object: THREE.Object3D): boolean {
    if (!object.name.toLocaleLowerCase().startsWith("cow")) {
      return false;
    }

    // Traverse group tree until we hit the scene
    let obj: THREE.Object3D = object;
    while (obj && obj.name !== "Root_Scene") {
      if (!obj.parent) return false;
      obj = obj.parent;
    }

    obj.position.x = this.randomXPos();
    obj.position.y = 5;

    const sfx = ["moo", "moo2"][Math.floor(Math.random() * 2)];
    playSFX(sfx, { volume: 1 });

    return true;
  }

  static delete(scene: THREE.Scene, object: THREE.Object3D) {
    const index = this.#objects.findIndex((c) => c === object);
    scene.remove(object);
    this.#objects.splice(index, 1);
  }

  static clear(scene: THREE.Scene) {
    this.#objects.forEach((obj) => {
      scene.remove(obj);
    });

    this.#objects.length = 0;
  }

  private static randomXPos() {
    return Math.random() * 15 - 2;
  }
}
