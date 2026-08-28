"use strict";

class gswaMIDIToKeys {
	static $convert( obj ) {
		const patterns = {};
		const keys = {};
		let patternId = 0;

		obj.tracks.forEach( track => {
			const [ trackKeys, dur, name ] = gswaMIDIToKeys.#convert( track.events, obj.timeDivision );

			patterns[ patternId ] = { name, keys: patternId, duration: dur };
			keys[ patternId ] = trackKeys;
			++patternId;
		} );
		return { patterns, keys };
	}
	static #convert( ev, timeDiv ) {
		const keys = {};
		let keyId = 0;
		let dTime = 0;
		let name = "";

		ev.forEach( e => {
			dTime += e.deltaTime;
			switch ( e.type ) {
				case 255:
					if ( e.metaType === 3 ) {
						name = e.data.trim();
					}
					break;
				case 9:
					if ( e.data[ 1 ] === 0 ) {
						gswaMIDIToKeys.#noteOff( keys, e.data[ 0 ] - 12, dTime, timeDiv );
					} else {
						keys[ keyId ] = {
							key: e.data[ 0 ] - 12,
							gain: GSUroundNum( e.data[ 1 ] / 127, 2 ),
							when: dTime,
						};
						++keyId;
					}
					break;
				case 8:
					gswaMIDIToKeys.#noteOff( keys, e.data[ 0 ] - 12, dTime, timeDiv );
					break;
			}
		} );
		return [ keys, GSUroundNum( dTime / timeDiv, 2 ), name ];
	}
	static #noteOff( keys, kkey, dTime, timeDiv ) {
		const key = Object.values( keys ).find( k => k.key === kkey && k.duration === undefined );

		if ( key ) {
			key.duration = GSUroundNum( ( dTime - key.when ) / timeDiv, 2 );
			key.when = GSUroundNum( key.when / timeDiv, 2 );
		}
	}
}
