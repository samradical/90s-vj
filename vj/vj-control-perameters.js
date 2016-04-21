import Midi from '../midi/midi';
const P = (()=>{
	let C = {
		midi:Midi,
		playlistUtils:{
			spread: 0.4
		},
		rockIntensity:0.23,
		analyzeVo:undefined
	}
	return C
})();

export default P;
