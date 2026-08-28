"use strict";

class gswaPluginBridgeProcessor extends AudioWorkletProcessor {
	#seq = 0;
	#outputs = new Map();

	constructor( options ) {
		super();
		this.port.onmessage = e => {
			if ( e.data.type === "output" && e.data.seq !== undefined ) {
				this.#outputs.set( e.data.seq, {
					outputL: e.data.outputL,
					outputR: e.data.outputR,
				} );
			}
		};
	}

	process( inputs, outputs ) {
		const input = inputs[ 0 ];
		const output = outputs[ 0 ];

		if ( !input?.[ 0 ] || !output?.[ 0 ] ) {
			return true;
		}
		const inL = input[ 0 ];
		const inR = input[ 1 ] || input[ 0 ];
		const outL = output[ 0 ];
		const outR = output[ 1 ] || output[ 0 ];
		const n = outL.length;
		const seq = this.#seq++;

		this.port.postMessage( {
			type: "process",
			seq,
			inputL: inL.slice(),
			inputR: inR.slice(),
			numSamples: n,
		} );

		const prev = this.#outputs.get( seq - 1 );

		if ( prev?.outputL?.length === n ) {
			outL.set( prev.outputL );
			outR.set( prev.outputR );
			this.#outputs.delete( seq - 1 );
		} else {
			outL.set( inL );
			outR.set( inR );
		}

		if ( this.#outputs.size > 8 ) {
			this.#outputs.delete( seq - 8 );
		}
		return true;
	}
}

registerProcessor( "gswapluginbridge", gswaPluginBridgeProcessor );
