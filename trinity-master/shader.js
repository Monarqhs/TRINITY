import * as THREE from "./Three JS/build/three.module.js";

const vertShader = `
    uniform float amplitude
    attribute vec3 customColor
    attribute vec3 vel
    varying vec3 vNormal
    varying vec3 vColor

    void main() {
        vNormal = normal
        vColor = customColor

        vec3 newPosition = position + vel * amplitude

        gl_position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 )
    }
`

const fragShader = `
    varying vec3 vNormal;
    varying vec3 vColor;

    void main() {
        const float ambient = 0.4; 
        vec3 light = vec3( 1.0 ); 
        light = normalize( light );

        float directional = max( dot( vNormal, light ), 0.0 );

        gl_Fragcolor = vec4(( directional + ambient ) * vcolor, 1.0 );
    }
`
const uniforms = {
    amplitude: { value: 0.0}
}

export { vertShader, fragShader, uniforms }
