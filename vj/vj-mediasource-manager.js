import _ from 'lodash';

import Utils from './utils/utils';
import Emitter from './utils/emitter';

import Signals from 'signals';

import ControlPerameters from './vj-control-perameters';
import VjMediaSource from './vj-mediasource';
import VjVideoCanvas from './vj-video-canvas';
import VjPlaylist from './vj-youtube-playlist';
import VjUtils from './vj-utils';

class VjManager {

  constructor(parent, options = {}) {
    this.options = options
    this.mediaSourcesConfigs = options.mediaSources;

    this.mediaSources = [];
    this.controls = [];
    this.videoCanvases = [];
    this.playlists = [];

    this.parent = parent;
    this.boundUpdate = this._update.bind(this);
    this.mediaSourcesLength = this.mediaSourcesConfigs.length
    _.each(this.mediaSourcesConfigs,(mediaPlayers)=>{
        let _o = _.merge(mediaPlayers, {
        readySignal: new Signals(),
        videoStartedSignal: new Signals(),
        endingSignal: new Signals(),
        endedSignal: new Signals()
      });
      this._createMediaSource(_o)
    })

    Emitter.on(`playother`, (index)=>{
      this.mediaSources.forEach((ms,i)=>{
        if(i !== index){
          ms.play()
        }
      })
    })
    
    Emitter.on(`source0Video`, (direction)=>{
      if(direction === 'down'){
        this.mediaSources[0].stepBack(5 * ControlPerameters.video.stepBack.value)
      }else{
        this.mediaSources[0].stepForward(5 * ControlPerameters.video.stepBack.value)
      }
    })

    Emitter.on(`source1Video`, (direction)=>{
      if(direction === 'down'){
        this.mediaSources[1].stepBack(5 * ControlPerameters.video.stepBack.value)
      }else{
        this.mediaSources[1].stepForward(5 * ControlPerameters.video.stepBack.value)
      }
    })


    this._update();
  }

  _createMediaSource(options){
    let el = document.createElement("video");
      el.setAttribute('controls', 'true');
      if (options.verbose) {
        this.parent.appendChild(el);
      }
      if(!options.paused){
        el.setAttribute('autoplay', 'true');
      }
      this.controls[options.index] = ControlPerameters.sources[options.index]
      this.mediaSources.push(new VjMediaSource(el, options));
      this.videoCanvases.push(new VjVideoCanvas(el, options));
      this.playlists.push(new VjPlaylist(this.mediaSources[this.mediaSources.length-1], options));
  }

  _getRandomTerm() {
    let r = Math.floor(Math.random() * TERMS.length - 1);
    return TERMS[r];
  }

  // _getNext(mediaSource) {
  //     let self = this;
  //     let currentId = mediaSource.getCurrentVideoId();
  //     console.log("Get Next", currentId);
  //     Channel.trigger('mediasource:nextvideo', currentId, mediaSource.addVo);
  // }

  _update() {
    for (let i = 0; i < this.mediaSourcesLength; i++) {
      this.videoCanvases[i].update();
    }
    if (this.options.autoUpdate) {
      this.requestId = window.requestAnimationFrame(this.boundUpdate);
    }
  }

  onWindowResize(w, h) {
    for (let i = 0; i < this.mediaSourcesLength; i++) {
      this.videoCanvases[i].onResize(w, h);
    }
  }

  update() {
    this.boundUpdate();
  }

  getCanvasAt(index) {
    return this.videoCanvases[index].getCanvas();
  }

  getBuffersAt(index) {
    return this.videoCanvases[index].getBuffers();
  }

  getVideoAt(index) {
    return this.mediaSources[index].videoElement;
  }
}

export default VjManager;
