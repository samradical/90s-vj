'use strict';

import THREE from 'three';
import Signals from 'signals';

const VERBOSE = false;
const BUFFER_MARGIN = 3;
const BUFFER_MARGIN_2 = 0.7;;

class VjMediaSource {
	constructor(el, options = {}) {
		this.options = options;
		this.el = el;
		if (!MediaSource) {
			throw new Error('NO MEDIASOURCE!');
		}
		//booleans
		this.updatedStarted, this.locked, this.starting = true;

		//playback info
		this.segDuration = 0,
			this.totalDuration = 0,
			this.newVoStarted = false,
			this.requestingNewVo = false,
			this.playOffset = 0,
			this.segmentIndex = 0,
			this.totalSegments = 0,
			this.paused = false,
			this.ended = false,
			this.currentCodec = "",
			this.skipCount = 0;
		////-----------------
		//SETUP
		////-----------------
		this._currentVo;
		this.mediaSource;
		this.sourceBuffer;
		this._effects;
		this.currentVideoId;

		this.readySignal = this.options.readySignal || new Signals();
		this.videoStartedSignal = this.options.videoStartedSignal || new Signals();
		this.endingSignal = this.options.endingSignal || new Signals();
		this.endedSignal = this.options.endedSignal || new Signals();

		this.videoElement = el;

		this.onBufferUpdateStartBound = this.onBufferUpdateStart.bind(this);
		this.onBufferUpdateEndBound = this.onBufferUpdateEnd.bind(this);
		this.onInitAddedBound = this._onInitAdded.bind(this);
		this.onTimeUpdateBound = this._onTimeUpdate.bind(this);
		this.onSourceOpenBound = this._onSourceOpen.bind(this);
		this.onSourceErrorBound = this._onSourceError.bind(this);

		this.videoElement.addEventListener("timeupdate", this.onTimeUpdateBound, false);
		this.videoElement.addEventListener("ended", this._onVideoEnded, false);
		this.videoElement.addEventListener("loadeddata", () => {
			if (VERBOSE) {
				console.log("Loaded data");
			}
		});

		this.videoElement.addEventListener("playing", () => {
			if (VERBOSE) {
				console.log("Playing");
			}
		});

		this.videoElement.addEventListener("waiting", () => {
			if (VERBOSE) {
				console.log("waiting");
			}
		});
		this._newMediaSource();
		this.waitingLine = [];
	}

	_newMediaSource() {
		this.starting = true;
		this.mediaSource = new MediaSource();
		let url = URL.createObjectURL(this.mediaSource);
		this.videoElement.src = url;
		this.mediaSource.addEventListener('error', this.onSourceErrorBound, false);
		this.mediaSource.addEventListener('sourceopen', this.onSourceOpenBound, false);
	}

	_onSourceError(e) {}

	_onSourceOpen(e) {
		this.starting = false;
		this.readySignal.dispatch();
		if (this.waitingLine.length) {
			this.addVo(this.waitingLine.pop());
		}
	}

	newBufferSouce(codecs) {
		this.mediaSource.removeEventListener('sourceopen', this.onSourceOpenBound);
		this.currentCodec = codecs;
		this.sourceBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="' + codecs + '"');
		this.sourceBuffer.addEventListener('updatestart', this.onBufferUpdateStartBound);
		this.sourceBuffer.addEventListener('updateend', this.onBufferUpdateEndBound);
	}

	////-----------------
	//VIDEO HANDLERS
	////-----------------

	pause() {
		this.videoElement.pause();
	}

	play() {
		this.videoElement.play();
	}

	_onVideoEnded(e) {
		if (VERBOSE) {
			console.warn('Video Ended');
		}
	}

	_onTimeUpdate() {
		let ct =this.videoElement.currentTime;
		if(ct > this.currentVo.startTime && !this.newVoStarted){
			this.newVoStarted = true;
			this.videoStartedSignal.dispatch(this.currentVo);
		}
		if (ct >= (this.totalDuration - (this.currentVo.duration * BUFFER_MARGIN_2))) {
			if (!this.requestingNewVo) {
				this.requestingNewVo = true;
				if (VERBOSE) {
				console.log(this.id, "Requesting new vo");
				}
				this.endingSignal.dispatch();
			}
		}
		if (ct > this.totalDuration - 0.5) {
			if (!this.ended) {
				this.ended = true;
				this.endedSignal.dispatch();
			}
		}
	}

	////-----------------
	//API
	////-----------------

	setPlaybackRate(rate){
		this.videoElement.playbackRate = rate;
	}

	getReadyState() {
		return this.mediaSource.readyState;
	}

	setCurrentVideoId(id) {
		this.currentVideoId = id;
	}

	getCurrentVideoId(id) {
		return this.currentVideoId;
	}

	addVo(currentVo) {
		if (VERBOSE) {
			console.log("CurrentCodec: ", this.currentCodec, "new codec:", currentVo.codecs, this.sourceBuffer);
		}

		if (this.currentCodec !== currentVo.codecs) {
			console.warn('The codecs arnt equal');
			if (this.sourceBuffer) {
				//this.waitingLine.unshift(currentVo);
				//this._resetMediasource();
				//this._newMediaSource();
				this._readyToAdd(currentVo);
			} else {
				this.newBufferSouce(currentVo.codecs);
				this._readyToAdd(currentVo);
			}
		} else {
			if (!this.sourceBuffer) {
				this.newBufferSouce(currentVo.codecs);
			}
			this._readyToAdd(currentVo);
		}
	}

	_readyToAdd(currentVo) {
		this.setCurrentVideoId(currentVo.id);
		this._addSegment(currentVo);
		this.videoElement.play();
		this.mediaSource.duration = this.totalDuration;
	}

	////-----------------
	//BUFFER HANDLERS
	////-----------------


	onBufferUpdateStart() {
		this.updatedStarted = true;
		this.requestingNewVo = false;
		this.ended = false;
	}

	onBufferUpdateEnd() {
		this.updatedStarted = false;
	}

	_addSegment(currentVo) {
		this.newVoStarted = false;
		this.currentVo = currentVo;
		this.currentVo.startTime = this.totalDuration;
		this.totalDuration += this.currentVo.duration;
		let formData = new FormData();
		if (VERBOSE) {
			console.log(this.currentVo.byteRange, this.currentVo.byteLength, this.currentVo.duration);
		}
		formData.append('url', this.currentVo.url);
		formData.append('byteRange', this.currentVo.byteRange);
		formData.append('byteLength', this.currentVo.byteLength);

		let xhr = new XMLHttpRequest();
		xhr.open('POST', SERVER_BASE + 'getVideo', true);
		xhr.responseType = 'arraybuffer';
		xhr.send(formData);
		xhr.addEventListener("readystatechange", () => {
			if (xhr.readyState == xhr.DONE) {
				this.segResp = new Uint8Array(xhr.response);
				let off = 0;
				if (this.sourceBuffer.buffered.length > 0) {
					off = this.sourceBuffer.buffered.end(this.sourceBuffer.buffered.length - 1);
				}
				this._trySettingOffset(off);
			}
		});
	}

	_trySettingOffset(off) {
		try {
			this.sourceBuffer.timestampOffset = off || 0;
			this._makeInitialRequest(this.currentVo);
		} catch (e) {
			if (VERBOSE) {
				console.log("Error _trySettingOffset");
			}
			this._resetMediasource();
		}
	}

	_makeInitialRequest() {
		let xhr = new XMLHttpRequest();
		let formData = new FormData();
		formData.append('url', this.currentVo.url);
		formData.append('indexRange', this.currentVo.indexRange);
		formData.append('indexLength', this.currentVo.indexLength);
		xhr.open('POST', SERVER_BASE + 'getVideoIndex', true);
		xhr.send(formData);
		xhr.responseType = 'arraybuffer';
		try {
			xhr.addEventListener("readystatechange", () => {
				if (xhr.readyState == xhr.DONE) { // wait for video to load
					console.log("Addit init");
					this._addInitReponse(new Uint8Array(xhr.response));
				}
			}, false);
		} catch (e) {
			log(e);
		}
	}

	_addInitReponse(initResp) {
		if (this.mediaSource.readyState === 'open' && this.sourceBuffer) {
			this.sourceBuffer.removeEventListener('updatestart', this.onBufferUpdateStartBound);
			this.sourceBuffer.removeEventListener('updateend', this.onBufferUpdateEndBound);
			this.sourceBuffer.addEventListener('updateend', this.onInitAddedBound);
			try {
				if (VERBOSE) {
					console.log("Init response added: ", this.currentVideoId);
				}
				this.sourceBuffer.appendBuffer(initResp);
			} catch (e) {
				if (VERBOSE) {
					console.log(e);
				}
				this._resetMediasource();
			}
		}
	}

	_onInitAdded() {
		if (this.mediaSource.readyState === 'open' && this.sourceBuffer) {
			this.sourceBuffer.removeEventListener('updateend', this.onInitAddedBound);
			this.sourceBuffer.addEventListener('updateend', this.onBufferUpdateEndBound);
			this.sourceBuffer.addEventListener('updatestart', this.onBufferUpdateStartBound);
			let off = this.sourceBuffer.timestampOffset - this.currentVo['timestampOffset'];
			try {
				this.sourceBuffer.timestampOffset = off;
			} catch (e) {
				this._resetMediasource();
			}
			//this.sourceBuffer.timestampOffset = this.sourceBuffer.timestampOffset - currentVo['timestampOffset'];
			try {
				if (VERBOSE) {
					console.log("Added segment: ", this.currentVideoId, "Total duration:", this.totalDuration);
				}
				this.sourceBuffer.appendBuffer(this.segResp);
			} catch (e) {
				if (VERBOSE) {
					console.log(e);
				}
				this._resetMediasource();
			}
		}
	}


	//crash

	_canUpdate() {
		return this.mediaSource.readyState === 'open';
	}

	_removeSourceBuffer() {
		if (this.sourceBuffer) {
			this.sourceBuffer.removeEventListener('updateend', this.onBufferUpdateEndBound);
			this.sourceBuffer.removeEventListener('updatestart', this.onBufferUpdateStartBound);
			try {
				this.sourceBuffer.remove(0, this.mediaSource.duration);
				this.mediaSource.removeSourceBuffer(this.sourceBuffer);
				console.warn('Removed buffer source');
			} catch (e) {
				console.log(e);
			}
		}
	}

	_resetMediasource() {
		if (this.starting || !this.mediaSource) {
			return;
		}
		if (VERBOSE) {
			console.log(this.mediaSource.readyState !== 'open' || this.mediaSource.updating)
		}
		if (VERBOSE) {
			console.warn('Reset buffer source');
		}
		this._removeSourceBuffer();
		this.mediaSource.removeEventListener('error', this.onSourceErrorBound);
		this.mediaSource.removeEventListener('sourceopen', this.onSourceOpenBound);
		this.mediaSource = null;
		this.sourceBuffer = null;
		this.requestingNewVo = false;
		this.enterFrameCounter = 0;
		this.videoElement.currentTime = 0;
		this.totalDuration = this.segDuration = this.playOffset = 0;
	}

}

export default VjMediaSource;
