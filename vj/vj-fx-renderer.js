import THREE from 'three';
import ShaderLib from './shaders/shader_lib';
import Shaders from './shaders/shaders';
import EaseNumbers from './utils/ease-numbers';

//import FxComposer from './vj-fx-layer';
import ControlPerameters from './vj-control-perameters';
//import ServerServise from 'serverService';
import FxLayer from './vj-fx-layer';
//import BlendModes from './vj-fx-layer';
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

/*
OPTIONS
record
*/
class Renderer {
	constructor(parentEl, options = {}) {
		this.options = options

		this.time = 0;
		this.renderer = new THREE.WebGLRenderer({
			antialias: false,
			preserveDrawingBuffer: options.record || false
		});

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
			textures[0][0],
			this.renderer,
			this.camera, {
				index:0,
				width: VIDEO_WIDTH,
				texture:textures[0][1],
				height: VIDEO_HEIGHT
			});

		this.layer2 = new FxLayer(
			textures[1][0],
			this.renderer,
			this.camera, {
				index:1,
				texture:textures[1][1],
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

		this.fbo = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
		this.fbo.texture.minFilter = THREE.LinearFilter;
		this.fbo.texture.magFilter = THREE.LinearFilter;

		var renderPass = new THREE.RenderPass(this.scene, this.camera);
		var effectCopy = new THREE.ShaderPass(Shaders.copy, this.camera);
		this.composer = new THREE.EffectComposer(this.renderer, this.fbo);

		this.blendPass = new THREE.ShaderPass(Shaders.blendMoon, this.camera);
    	this.blendPass.uniforms['blendMode'].value = 15;
    	this.blendPass.uniforms['background'].value = this.layer2.fbo;
    	this.blendPass.uniforms['foreground'].value = this.layer1.fbo;

    	this.composer.addPass(renderPass);
	    this.composer.addPass(this.blendPass);
	    //this.composer.addPass(this.shapePass);
	    //  this.composer.addPass(this.rayPass);
	    //this.composer.addPass(this.textPass);
	    this.composer.addPass(effectCopy);

		// let chroma = ShaderLib['blendMoon']();
		// let shader = chroma['shader'];
		// this.uniforms = chroma['uniforms'];
		// //this.uniforms['uMixRatio'].value = 0.8;
		// //this.uniforms['uThreshold'].value = 0.15;
		// this.uniforms['blendMode'].value = 15;
		// this.uniforms['background'].value = this.layer2.fbo;
		// this.uniforms['foreground'].value = this.layer1.fbo;
		// //this.uniforms['tTwo'].value = this.shapeLayer.fbo;
		// //this.uniforms['tMix'].value = this.shapeLayer.fbo;

		// let parameters = {
		// 	fragmentShader: shader.fragmentShader,
		// 	vertexShader: shader.vertexShader,
		// 	uniforms: this.uniforms
		// };

		// let videoMaterial = new THREE.ShaderMaterial(parameters);
		let videoMaterial = new THREE.MeshBasicMaterial({
	      map: this.fbo
	      //color:0xff0000
	    });

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
		this._controlBlendUniforms();
		//this._audioUniforms();
		this._threeRender();
		this.time++;
	}

	_controlBlendUniforms(){
		for (var i = 0; i < this.controlKeysLength; i++) {
			let _key = this.controlKeys[i]
			let _newVal = this.controls[_key].value
			let _val = this.blendPass.uniforms[_key].value
			if(_val !== _newVal && _newVal !== undefined){
				console.log("renderer" , _key );
				this.blendPass.uniforms[_key].value = _newVal
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

		if(this.options.record){
			this.renderer.setSize(VIDEO_WIDTH, VIDEO_HEIGHT);	
		}else{
			this.renderer.setSize(cameraWidth, cameraHeight);	
		}
	}

	_threeRender() {
		this.layer1.render();
		this.layer2.render();
		this.composer.render();
		//this.rayPass.uniforms['u_time'].value = this.time;
		this.renderer.render(this.scene, this.camera, null, true);
	}

	get canvas(){
		return this.renderer.domElement 
	}
}

export default Renderer
