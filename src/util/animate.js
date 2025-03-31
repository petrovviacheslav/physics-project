import {OrbitControls} from "three/addons";

// отрисовка сцены
export function animate(renderer2, scene2, camera2) {
    const renderer = renderer2;
    const scene = scene2;
    const camera = camera2;
    const controls = new OrbitControls(camera, renderer.domElement);

    function animate2() {
        requestAnimationFrame(animate2);
        controls.update();
        renderer.render(scene, camera);
    }

    animate2();
}