"use strict";

class gswaMIDIInput {
	#sysex = false;
	#onNoteOn = null;
	#onNoteOff = null;

	constructor( input, sysex, on ) {
		this.#sysex = sysex;
		this.#onNoteOn = on.$onNoteOn;
		this.#onNoteOff = on.$onNoteOff;
		input.onmidimessage = this.#onmidimessage.bind( this );
	}

	#onmidimessage( e ) {
		if ( !this.#sysex && e.data.length !== 3 ) {
			console.warn( "gswaMIDIInput: Unrecognized midi message", e );
		} else {
			const [ msg, key, vel ] = e.data;
			const cmd = msg & 0xf0;

			switch ( cmd ) {
				case 0x90:
					if ( vel === 0 ) {
						this.#onNoteOff( key );
					} else {
						this.#onNoteOn( key, vel / 127 );
					}
					break;
				case 0x80: this.#onNoteOff( key ); break;
			}
		}
	}
}
