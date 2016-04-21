import VjRenderer from './vj/vj-fx-renderer'
import VJManager from './vj/vj-mediasource-manager';
import ControlPerameters from './vj/vj-control-perameters';
//import SocketIo from './vj/socket/socket';
import dat from 'dat-gui';

import Midi from './midi/midi';
//import Midi from './midi/midi_controller';
// let midi = new Midi({
//             onPressNote: (evt) => console.log(evt),
//             onReleaseNote: (evt) => console.log(evt)
//         })

const PLAY_VJ = "PLOnhHR5nulMPisi4X15rmPpEVp2Q-MIY0";
const MOON_P = "PLBm5UHsvUTFoHiOgZl8Ycn7Y3XySDSXuV";
const nineties = "PLRQ2jIXShfkZnWUXZj1Auc30pX_d4M6j7";
const ninetiesevents = "PLRQ2jIXShfkaQoRXUilaQB3CVdqprTtvH";

var appEl = document.getElementById('app')
var threeEl = document.getElementById('three')
var vj, renderer;



function init() {

    ControlPerameters.renderer = {
        blendMode: Midi.buttons.blendMode,
        rockOpacity: Midi.map[1],
        blendOpacity: Midi.map[13]
    }

    ControlPerameters.sources = [{
        color: {
            uSaturation: Midi.map[11],
            uR: Midi.map[3],
            uG: Midi.map[4],
            uB: Midi.map[5],
            uBrightness: 0.01,
            uContrast: Midi.map[0],
            uHue: Midi.map[6],
        }
    }, {
        color: {
            uSaturation: Midi.map[2],
            uR: Midi.map[10],
            uG: Midi.map[8],
            uB: Midi.map[9],
            uBrightness: 0.01,
            uContrast: Midi.map[12],
            uHue: Midi.map[9],
        }
    }]

    vj = new VJManager(appEl, {
        autoUpdate: false,
        mediaSources: [{
            i: 0,
            playlists: [PLAY_VJ],
            shufflePlaylist: true,
            maxVideoTime: 15,
            quality: {
                chooseBest: true,
                resolution: '360p'
            },
            verbose: false
        }, {
            index: 1,
            playlists: [PLAY_VJ],
            shufflePlaylist: true,
            maxVideoTime: 15,
            paused: false,
            quality: {
                chooseBest: true,
                resolution: '360p'
            },
            verbose: false
        }]
    });

    renderer = new VjRenderer(threeEl);

    renderer.setTextures([
        vj.getCanvasAt(0),
        vj.getCanvasAt(1)
    ]);

    update()

    let GUI = new dat.GUI()
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

}

function update() {
    vj.update();
    renderer.update();
    window.requestAnimationFrame(update);
}




//window.onload = init