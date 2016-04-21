'use strict';

import ControlPerameters from './vj-control-perameters';

const HALF_PI = Math.PI / 2;

function PlaylistUtils() {
	let _videoIndex = 0;
	let _referenceIndexs = [];

	function _sineOut(t) {
		return Math.sin(t * HALF_PI);
	}

	function _spread(references, injectIndex, options) {
		if (!references) {
			return _referenceIndexs;
		}
		var l = options.endIndex - options.startIndex;
		var totalIndex = _referenceIndexs.length;
		let _c = injectIndex;
		for (var i = options.startIndex; i < options.endIndex; i++) {
			var n = _sineOut(_c / l);
			var targetIndex = Math.min(_c + Math.floor(totalIndex * (n * ControlPerameters.playlistUtils.spread / 2)), _referenceIndexs.length);
			_referenceIndexs.splice(targetIndex, 0, `${_videoIndex}_${i}`);
			_c++;
		}
		_videoIndex++;
		return _referenceIndexs;
	}

	function mix(sidx, injectIndex, options = {}) {
		if (!sidx) {
			return _referenceIndexs;
		}
		let refs = sidx.references;
		let refDur = refs[0].durationSec;
		let totalTime = refDur * refs.length;

		options.maxVideoTime = options.maxVideoTime || (totalTime - refDur);

		let max = Math.max(totalTime / options.maxVideoTime, 0);
		let startTime = Math.floor(max / 2) * options.maxVideoTime;
		let startIndex = 0//Math.max(Math.floor(startTime / refDur), 0);
		let endIndex = refs.length-1//Math.min(Math.floor(options.maxVideoTime / refDur) + startIndex, refs.length - 1);
		return _spread(sidx.references, injectIndex, { startIndex, endIndex });
	}

	function clear() {
		_referenceIndexs.length = 0;
	}

	return {
		referenceIndexs: _referenceIndexs,
		clear: clear,
		mix: mix
	}
}


export default PlaylistUtils;
