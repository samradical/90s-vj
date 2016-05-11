import VjRenderer from './vj/vj-fx-renderer'
import VJManager from './vj/vj-mediasource-manager';
import ControlPerameters from './vj/vj-control-perameters';
import SocketIo from './vj/socket/socket';
import dat from 'dat-gui';
import maximize from 'maximize.js'

import Midi from './midi/midi';
import Record from 'recordrtc';
//import Midi from './midi/midi_controller';
// let midi = new Midi({
//             onPressNote: (evt) => console.log(evt),
//             onReleaseNote: (evt) => console.log(evt)
//         })

const PLAY_VJ = "PLOnhHR5nulMPisi4X15rmPpEVp2Q-MIY0";
const MOON_P = "PLBm5UHsvUTFoHiOgZl8Ycn7Y3XySDSXuV";
const nineties = "PLRQ2jIXShfkZnWUXZj1Auc30pX_d4M6j7";
const nineties2 = "PLRQ2jIXShfkZ1EI9plH-0v8r5XqtuJSqJ";
const ninetiesevents = "PLRQ2jIXShfkaQoRXUilaQB3CVdqprTtvH";
const ninetiesevents2 = "PLRQ2jIXShfkY86JFB8kScjCKS3SVVoCJ6";

var appEl = document.getElementById('app')
var threeEl = document.getElementById('three')
var vj, renderer, recorder, recorderctx;

const FPS = 30
var now, then = 0, interval = 1000 / FPS, allowSave = true, _isStopped = true

maximize(appEl, appEl, () => {})

function init() {
    const OPTIONS = {
        record: true
    }

    ControlPerameters.time = Midi.map[5]
    ControlPerameters.renderer = {
        blendMode: Midi.buttons.blendMode,
        rockOpacity: Midi.map[1],
        blendOpacity: Midi.map[13]
    }

    ControlPerameters.video = {
        stepBack: Midi.map[17]
    }

    ControlPerameters.sources = [{
        color: {
            uSaturation: Midi.map[14],
            uR: Midi.map[3],
            uG: Midi.map[4],
            uB: { value: 1. },
            uBrightness: 0.01,
            uContrast: Midi.map[0],
            uHue: Midi.map[6],
        },
        shapeMix: {
            uSize: Midi.map[16],
            uIntensity: Midi.map[17]
        },
        canvas: {
            rewind: Midi.map[11]
        }
    }, {
        video: {
            back: Midi.map[6],
            forward: Midi.map[7]
        },
        color: {
            uSaturation: Midi.map[15],
            uR: Midi.map[10],
            uG: Midi.map[8],
            uB: Midi.map[9],
            uBrightness: 0.01,
            uContrast: Midi.map[12],
            uHue: Midi.map[9],
        },
        shapeMix: {
            uSize: Midi.map[16],
            uIntensity: Midi.map[17]
        },
        canvas: {
            rewind: Midi.map[2]
        }
    }]

    vj = new VJManager(appEl, {
        autoUpdate: false,
        mediaSources: [{
            index: 0,
            playlists: [nineties2],
            shufflePlaylist: true,
            maxVideoTime: 15,
            quality: {
                chooseBest: true,
                resolution: '360p'
            },
            rewindable: true,
            verbose: false
        }, {
            index: 1,
            playlists: [ninetiesevents2],
            shufflePlaylist: true,
            maxVideoTime: 15,
            paused: false,
            quality: {
                chooseBest: true,
                resolution: '360p'
            },
            rewindable: true,
            verbose: false
        }]
    });

    renderer = new VjRenderer(threeEl, OPTIONS);
    // //recorder = new Record(renderer.canvas, {
    //     console.log(vj.getVideoAt(0));
    // recorder = new Record(vj.getVideoAt(0), {
    //     //recorderType: WhammyRecorder,
    //     type: 'video',
    //     mimeType: 'video/webm', // or video/mp4 or audio/ogg 
    //     bitsPerSecond: 128000,
    //     video: {
    //         width: 320,
    //         height: 240
    //     }
    // })

    // a few minutes later


    renderer.setTextures([
        vj.getBuffersAt(0),
        vj.getBuffersAt(1)
    ]);

    update()
    var obj = {
        startR: () => {
            _isStopped = false
        },
        stopR: () => {
            _isStopped = true
        }
    }
    let GUI = new dat.GUI()
    GUI.add(obj, 'startR')
    GUI.add(obj, 'stopR')
        // GUI.add(ControlPerameters.renderer, 'blendMode', 0, 21)
        // GUI.add(ControlPerameters.renderer, 'blendOpacity', 0.01, 1.01)
        // GUI.add(ControlPerameters.renderer, 'rockOpacity', 0.01, 1.01)
        // let p1 = GUI.addFolder('player1')
        // p1.add(ControlPerameters.sources[0].color, 'uSaturation', 0.01, 4.01);
        // p1.add(ControlPerameters.sources[0].color, 'uContrast', 0.01, 3.01)
        // p1.add(ControlPerameters.sources[0].color, 'uHue', 0.01, 1.01)

    // let p2 = GUI.addFolder('player2')
    // p2.add(ControlPerameters.sources[1].color, 'uSaturation', 0.01, 4.01)
    // p2.add(ControlPerameters.sources[1].color, 'uContrast', 0.01, 3.01)
    // p2.add(ControlPerameters.sources[1].color, 'uHue', 0.01, 1.01)

    window.addEventListener('resize', () => {
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        if (vj) {
            vj.onWindowResize(windowWidth, windowHeight);
            renderer.onWindowResize(windowWidth, windowHeight);
        }
    });

    if (OPTIONS.record) {
        SocketIo.on('image:saved', ()=>{
            _isStopped = false
        })
    }
}

function _record(){
    if(_isStopped){
        return
    }

    console.log(_isStopped);
    let now = performance.now()
    let delta = now - then;

    if (delta > interval && allowSave) {
        then = now - (delta % interval);
        _isStopped = true

        let jpegUrl = renderer.canvas.toDataURL("image/jpeg");
        SocketIo.emit('image:save', jpegUrl)
    }
}

function update() {
    vj.update();
    renderer.update();
    _record()
    window.requestAnimationFrame(update);
}




window.onload = init