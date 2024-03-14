import * as THREE from "three";

export class FloorFactory {
  static readonly #objects: THREE.Object3D[] = [];

  static get objects() {
    return this.#objects;
  }

  static async create(scene: THREE.Scene) {
    const texture = new THREE.TextureLoader().load("textures/dirt.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.FrontSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    const w = 50.0;
    const h = 0.1;
    const b = 20.0;
    mesh.position.x = w / 6;
    mesh.position.y = -1;
    mesh.position.z = b / 4;
    mesh.scale.set(w, h, b);

    scene.add(mesh);
    this.#objects.push(mesh);

    return mesh;
  }
}
