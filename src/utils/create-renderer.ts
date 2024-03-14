import * as THREE from "three";

export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // antialias: true, // MSAA
  });

  renderer.setPixelRatio(1);
  renderer.setSize(1, 1, false); // important to set third arg as false as it prevents overwriting the CSS

  // Make sure colours look right
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.0;
  THREE.ColorManagement.enabled = true;

  return renderer;
}
