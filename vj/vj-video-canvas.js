const W = 640;
const H = 360;
const BUFFER_LENGTH = 50;
const REWIND_RECOVER = 200;

import ControlPerameters from './vj-control-perameters';

class VideoCanvas {

    constructor(el, options) {
        this.controls = ControlPerameters.sources[options.index].canvas
        this.options = options;
        this.videoElement = el;
        this.videoWidth;
        this.videoHeight;
        this.fboWidth;
        this.fboHeight;
        this.windowW = window.innerWidth;
        this.windowH = window.innerHeight;
        this.containerRatio = W / H;

        this.rewindId;
        this.rewindValue = null
        this.frames = []
        this.totalFrames = 0

        this.counter = 0

        this.options.videoStartedSignal.add(this._setCanvasResolution.bind(this));

        this._init();

        this.started = false
    }

    _setCanvasResolution() {
        this.videoWidth = this.videoElement.videoWidth || W;
        this.videoHeight = this.videoElement.videoHeight || H;

        let elRatio = this.videoWidth / this.videoHeight;
        let scale, x, y;

        // define scale
        if (this.containerRatio > elRatio) {
            scale = W / this.videoWidth;
        } else {
            scale = H / this.videoHeight;
        }
        // define position
        if (this.containerRatio === elRatio) {
            x = y = 0;
        } else {
            x = (W - this.videoWidth * scale) * 0.5 / scale;
            y = (H - this.videoHeight * scale) * 0.5 / scale;
        }

        this.fboWidth = this.videoWidth * scale;
        this.fboHeight = this.videoHeight * scale;

        this.frameBuffer.width = this.fboWidth;
        this.frameBuffer.height = this.fboHeight;

        this.started = true
    }


    _createCanvas(w, h) {
        var c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
    }

    _init() {
        this.frameBuffer = this._createCanvas(W, H);
        if (this.options.verbose) {
            document.body.appendChild(this.frameBuffer)
        }
        this.bufferCtx = this.frameBuffer.getContext("2d");
    }

    update() {
        if (!this.started ) {
            return
        }

        if(!this.rewindId){
	        this.bufferCtx.clearRect(0, 0, this.windowW, this.windowH);
	        this.bufferCtx.drawImage(this.videoElement, 0, 0, this.videoWidth, this.videoHeight, 0, 0, this.fboWidth, this.fboHeight);
	        if (this.options.rewindable && this.counter % 2 === 0) {
	            var data = this.bufferCtx.getImageData(0, 0, this.fboWidth, this.fboHeight);
	            this.frames.push(data);
	            this.totalFrames = this.frames.length;

	            if (this.totalFrames >= BUFFER_LENGTH) {
	                var f = this.frames.shift();
	                f = null;
	            }
	        }
        }

        let _newRewindVal = this.controls.rewind.value
        if (this.rewindValue !== _newRewindVal) {
            this.rewind(_newRewindVal)
            this.rewindValue = _newRewindVal
        }
        this.counter++
    }

    rewind(v) {
        if (this.rewindId) {
            clearTimeout(this.rewindId);
        }
        if (!this.videoElement.paused) {
            this.videoElement.pause();
        }
        var start = 1.0;
        var frame = Math.floor(v * ((this.frames.length - 1) * start));
        this.bufferCtx.clearRect(0, 0, this.windowW, this.windowH);
        //this.bufferCtx.drawImage(this.videoElement, 0, 0, this.videoWidth, this.videoHeight, 0, 0, this.fboWidth, this.fboHeight);
        this.bufferCtx.putImageData(this.frames[frame], 0, 0);

        this.rewindId = setTimeout(() => {
            clearTimeout(this.rewindId);
            this.rewindId = null;
            this.videoElement.play();
        }, REWIND_RECOVER);
    }

    getCanvas() {
        return this.frameBuffer;
    }

    onResize(w, h) {
        this.windowW = w;
        this.windowH = h;
    }
};
export default VideoCanvas;