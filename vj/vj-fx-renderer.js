import THREE from 'three';
import ShaderLib from './shaders/shader_lib';
import Shaders from './shaders/shaders';
import EaseNumbers from './utils/ease-numbers';

//import FxComposer from './vj-fx-layer';
import ControlPerameters from './vj-control-perameters';
//import ServerServise from 'serverService';
 import FxLayer from './vj-fx-layer';
// import MoonLayer from './vj-moon-layer';
// import ShapeLayer from './vj-shape-layer';
// import TextCanvas from './vj-text-layer';


import {
	createShaderPass
}
from './vj-shader-pass';

const VIDEO_WIDTH = 853;
const VIDEO_HEIGHT = 480;
//const FXComposer = require('three-fx-composer').FXComposer(THREE)

class Renderer {
	constructor(parentEl) {
		this.time = 0;
		this.renderer = new THREE.WebGLRenderer({
			antialias: false
		});
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		parentEl.appendChild(this.renderer.domElement);

		this._init();
	}

	_init() {
		this.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerHeight / 2, window.innerHeight * 0.5, window.innerHeight * -0.5, 0, 1000);
		this.scene = new THREE.Scene();
		this.scene.add(new THREE.AmbientLight(0xffffff));

		this.beatEase = EaseNumbers.addNew(0, 0.1);

	}

	setTextures(textures) {

		this.layer1 = new FxLayer(
			textures[0],
			this.renderer,
			this.camera, {
				index:0,
				width: VIDEO_WIDTH,
				height: VIDEO_HEIGHT
			});

		this.layer2 = new FxLayer(
			textures[1],
			this.renderer,
			this.camera, {
				index:1,
				width: VIDEO_WIDTH,
				height: VIDEO_HEIGHT
			});

		//this.layer2 = new MoonLayer(this.renderer, this.camera);
		let renderTargetParameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: false
		};

		// this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
		// this.fbo.texture.minFilter = THREE.LinearFilter;
		// this.fbo.texture.magFilter = THREE.LinearFilter;

		var renderPass = new THREE.RenderPass(this.scene, this.camera);
		var effectCopy = new THREE.ShaderPass(Shaders.copy, this.camera);

		let chroma = ShaderLib['blendMoon']();
		let shader = chroma['shader'];
		this.uniforms = chroma['uniforms'];
		//this.uniforms['uMixRatio'].value = 0.8;
		//this.uniforms['uThreshold'].value = 0.15;
		this.uniforms['blendMode'].value = 15;
		this.uniforms['background'].value = this.layer2.fbo;
		this.uniforms['foreground'].value = this.layer1.fbo;
		//this.uniforms['tTwo'].value = this.shapeLayer.fbo;
		//this.uniforms['tMix'].value = this.shapeLayer.fbo;

		let parameters = {
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: this.uniforms
		};

		let videoMaterial = new THREE.ShaderMaterial(parameters);

		let quadgeometry = new THREE.PlaneBufferGeometry(VIDEO_WIDTH, VIDEO_HEIGHT, 2, 2);
		this.mesh = new THREE.Mesh(quadgeometry, videoMaterial);
		this.scene.add(this.mesh);

		this.controls = ControlPerameters.renderer
		this.controlKeys = Object.keys(ControlPerameters.renderer)
		this.controlKeysLength = this.controlKeys.length

		this.onWindowResize();
	}

	setBlendOpacity(o) {
		//this.mixPass.uniforms['blendOpacity'].value = o;
	}

	update() {
		this._controlUniforms();
		//this._audioUniforms();
		this._threeRender();
		this.time++;
	}

	_controlUniforms(){
		for (var i = 0; i < this.controlKeysLength; i++) {
			let _key = this.controlKeys[i]
			let _newVal = this.controls[_key].value
			let _val = this.uniforms[_key].value
			if(_val !== _newVal && _newVal !== undefined){
				this.uniforms[_key].value = _newVal
			}
		}
	}

	onWindowResize(w, h) {
		var w = w || window.innerWidth;
		var h = h || window.innerHeight;
		var a = h / w;
		var cameraWidth, cameraHeight;
		var scale;
		if (a < VIDEO_HEIGHT / VIDEO_WIDTH) {
			scale = w / VIDEO_WIDTH;
		} else {
			scale = h / VIDEO_HEIGHT;
		}
		cameraHeight = VIDEO_HEIGHT * scale;
		cameraWidth = VIDEO_WIDTH * scale;
		this.camera.left = cameraWidth / -2;
		this.camera.right = cameraWidth / 2;
		this.camera.top = cameraHeight / 2;
		this.camera.bottom = cameraHeight / -2;
		this.camera.updateProjectionMatrix();
		this.layer1.resize(w, h, VIDEO_WIDTH, VIDEO_HEIGHT, scale);
		this.layer2.resize(w, h, VIDEO_WIDTH, VIDEO_HEIGHT, scale);
		this.mesh.scale.x = this.mesh.scale.y = scale;
		this.renderer.setSize(cameraWidth, cameraHeight);
	}

	_threeRender() {
		this.layer1.render();
		this.layer2.render();
		//this.composer.render();
		//this.rayPass.uniforms['u_time'].value = this.time;
		this.renderer.render(this.scene, this.camera, null, true);
	}
}

export default Renderer
