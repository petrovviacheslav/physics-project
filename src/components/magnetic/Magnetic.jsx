
import ManipulationMagneticForm from "./ManipulationMagneticForm";
import {useEffect, useState} from "react";
import * as THREE from "three";
import {default_scene} from "../../util/settingsScene";
import DataTable from "../dataTable/DataTable";


const Magnetic = () => {

    const [scene, setScene] = useState(new THREE.Scene());
    const [camera, setCamera] = useState(new THREE.PerspectiveCamera(20, 1, 0.1, 1000));
    const [renderer, setRenderer] = useState(new THREE.WebGLRenderer());

    useEffect(() => {
        default_scene(scene, renderer, camera);

        document.title = "Магнитное поле";
    })

    return (
        <div className="magnetic">
            <h1>Магнитное поле</h1>
            <div className="container">
                <div className="render_place"></div>
                <div className="form_base">
                    <ManipulationMagneticForm scene={scene} camera={camera} renderer={renderer}/>
                </div>
            </div>

            <DataTable scene={scene} camera={camera} renderer={renderer} divideVelocity={1e-1}/>
        </div>
    )
}

export default Magnetic;