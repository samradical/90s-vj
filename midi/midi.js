import MidiInterface from './midi_controller'
import MidiMap from './midi_map'
import Utils from '../vj/utils/utils'
const Midi = (() => {
    let midi;

    class Midi {
        constructor() {
            //map
            this.map = MidiMap
            this.buttons = {
                blendMode: {
                    downId: 17,
                    upId: 25,
                    value: 15,
                    min: 1,
                    max: 25
                }
            }
            this.buttonKeys = Object.keys(this.buttons);
            this.buttonsLength = this.buttonKeys.length;

            let midi = new MidiInterface({
                onPressNote: (evt) => {
                    let _midikey = evt[1];
                    let _val = evt[2];
                    this.map[_midikey].value = Utils.map(_val, 0, 127, 0, 1)

                    for (var i = 0; i < this.buttonsLength; i++) {
                        let _key = this.buttonKeys[i]
                        let _but = this.buttons[_key]
                        if (_but.downId === _midikey) {
                            _but.value--
                        }
                        if (_but.upId === _midikey) {
                            _but.value++
                        }
                        if (_but.value < _but.min) {
                            _but.value = _but.max
                        }
                        if (_but.value > _but.max) {
                            _but.value = _but.min
                        }
                    }
                }
            })
        }
    }

    midi = new Midi()
    return midi
})()

export default Midi