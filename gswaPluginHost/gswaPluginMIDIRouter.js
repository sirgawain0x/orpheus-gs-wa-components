"use strict";

class gswaPluginMIDIRouter {
	#host = null;
	#channel = 0;

	constructor( host ) {
		this.#host = host;
		Object.seal( this );
	}

	$setHost( host ) {
		this.#host = host;
	}
	$setChannel( channel ) {
		this.#channel = channel;
	}

	$noteOn( note, velocity = 1 ) {
		this.#host?.$sendNoteOn( note, velocity, this.#channel );
	}
	$noteOff( note, velocity = 0 ) {
		this.#host?.$sendNoteOff( note, velocity, this.#channel );
	}
	$controller( number, value ) {
		this.#host?.$sendController( number, value, this.#channel );
	}

	$bindMIDIInput( input, sysex = false ) {
		return new gswaMIDIInput( input, sysex, {
			$onNoteOn: ( key, vel ) => this.$noteOn( key, vel ),
			$onNoteOff: key => this.$noteOff( key ),
		} );
	}
}

Object.freeze( gswaPluginMIDIRouter );
