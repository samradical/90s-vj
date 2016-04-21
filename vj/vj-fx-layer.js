import THREE from 'three';
import FxComposer from './vj-fx-composer';
import Shaders from './shaders/shaders';

import ControlPerameters from './vj-control-perameters';

const FPS = 30;

class FxLayer {
    constructor(source, renderer, camera, options = {}) {
        options = options || {};
        this.counter = 0;
        let VIDEO_WIDTH = options.width || 640;
        let VIDEO_HEIGHT = options.height || 360;
        this.effectsControl = ControlPerameters.sources[options.index]
            // Setup scene
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0xffffff));

        let renderTargetParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false
        };

        this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
        this.fbo.texture.minFilter = THREE.LinearFilter;
        this.fbo.texture.magFilter = THREE.LinearFilter;

        this.texture = new THREE.Texture(source);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;

        let videoMaterial = new THREE.MeshBasicMaterial({
            map: this.texture
        });

        var planeGeometry = new THREE.PlaneBufferGeometry(VIDEO_WIDTH, VIDEO_HEIGHT, 2, 2);
        this._mesh = new THREE.Mesh(planeGeometry, videoMaterial);
        this.scene.add(this._mesh);

        var renderPass = new THREE.RenderPass(this.scene, camera);
        var effectCopy = new THREE.ShaderPass(Shaders.copy, camera);

        this.color = new THREE.ShaderPass(Shaders.color);
        this.color.uniforms['tDiffuse'].value = this.fbo;

        this.color.uniforms['uSaturation'].value = this.effectsControl.color.uSaturation
        this.color.uniforms['uBrightness'].value = this.effectsControl.color.uBrightness
        this.color.uniforms['uContrast'].value = this.effectsControl.color.uContrast
        this.color.uniforms['uHue'].value = this.effectsControl.color.uHue

        this.colorKeys = Object.keys(this.effectsControl.color);
        this.uniformsLength = this.colorKeys.length

        this.composer = new THREE.EffectComposer(renderer, this.fbo);
        this.composer.addPass(renderPass);
        this.composer.addPass(this.color);
        this.composer.addPass(effectCopy);
        //this.fx = new FxComposer(this.scene, camera, renderer, this._mesh, this.fbo);
    }

    render(rtt) {
        if (this.counter % 2 === 0) {
            for (var i = 0; i < this.uniformsLength; i++) {
                let _key = this.colorKeys[i];
                let _value = this.color.uniforms[_key].value
                let _newValue = this.effectsControl.color[_key].value
                if(_value !== _newValue && _newValue !== undefined){
                    this.color.uniforms[_key].value = _newValue
                }
            }
            this.texture.needsUpdate = true;
        } else {
            this.texture.needsUpdate = false;
        }
        //this.fx.render();
        this.composer.render();
        this.counter++;
    }


    resize(w, h, vW, vH, scale) {
        let x = (w - vW * scale) * 0.5 / scale;
        let y = (h - vH * scale) * 0.5 / scale;
        this._mesh.scale.x = this._mesh.scale.y = scale;
        this._mesh.position.x = x;
        this._mesh.position.y = y * -1.;
        this.fbo.setSize(w, h);
    }
};

export default FxLayer;