import * as THREE from 'three';

const raycaster = new THREE.Raycaster();

export function raycast(
  x: number,
  y: number,
  canvas: HTMLCanvasElement,
  camera: THREE.Camera
) {
  const rect = canvas.getBoundingClientRect();
  const coords = { x: x - rect.left, y: y - rect.top };

  // Pixel coords to 0-1 range;
  coords.x = coords.x / rect.width;
  coords.y = coords.y / rect.height;

  // Flip yaxis
  coords.y = 1 - coords.y;

  // Normalise to -1 to 1 range
  coords.x = coords.x * 2.0 - 1.0;
  coords.y = coords.y * 2.0 - 1.0;

  const ndcCoords = new THREE.Vector2(coords.x, coords.y);
  raycaster.setFromCamera(ndcCoords, camera);

  return raycaster;
}
