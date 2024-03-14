import * as THREE from "three";
import { OBJLoader } from "three/addons";

const loader = new OBJLoader().setPath("models/");

export class GunFactory {
  static #object: THREE.Object3D | null = null;

  static get object() {
    return this.#object;
  }

  static async create(scene: THREE.Scene) {
    if (this.#object) {
      return this.#object;
    }

    const texture = new THREE.TextureLoader().load("textures/shotgun.png");
    texture.colorSpace = THREE.SRGBColorSpace;

    // Load gun model and texture
    // FYI: front-face of gun is on its side...
    const model = await loader.loadAsync("shotgun.obj");
    model.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const c = child as THREE.Mesh;
        const material = c.material as THREE.MeshStandardMaterial;
        material.map = texture;
      }
    });

    // ... so we rotate it and use a group later to counter-rotate so it properly faces forward
    model.rotateY(-Math.PI / 2);

    // Create a group to hold the gun
    const group = new THREE.Group();

    // Rotate 180 to face into the scene (along negative z)
    group.rotateY(Math.PI);

    // The group is now the gun - position that instead
    group.position.x = 5.8;
    group.position.y = 1;
    group.position.z = 7;

    // Add the gun to the group
    group.add(model);

    // Group into the scene
    scene.add(group);
    this.#object = group;

    return group;
  }
}
