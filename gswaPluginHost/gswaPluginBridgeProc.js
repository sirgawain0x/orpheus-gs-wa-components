"use strict";

class gswaPluginBridgeProcessor extends AudioWorkletProcessor {
	#pluginId = "";
	#ready = false;
	#pendingL = null;
	#pendingR = null;

	constructor( options ) {
		super();
		this.#pluginId = options.processorOptions?.pluginId || "";
		this.port.onmessage = e => {
			if ( e.data.type === "output" ) {
				this.#pendingL = e.data.outputL;
				this.#pendingR = e.data.outputR;
				this.#ready = true;
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

		this.port.postMessage( {
			type: "process",
			pluginId: this.#pluginId,
			inputL: inL.slice(),
			inputR: inR.slice(),
			numSamples: n,
		} );

		if ( this.#ready && this.#pendingL?.length === n ) {
			outL.set( this.#pendingL );
			outR.set( this.#pendingR );
			this.#ready = false;
		} else {
			outL.set( inL );
			outR.set( inR );
		}
		return true;
	}
}

registerProcessor( "gswapluginbridge", gswaPluginBridgeProcessor );
