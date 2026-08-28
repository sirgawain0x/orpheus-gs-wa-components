"use strict";

class gswaPluginHost {
	static $PATH = "gswaPluginBridgeProc.js";
	#ctx = null;
	#pluginId = null;
	#input = null;
	#output = null;
	#bridgeNode = null;
	#processor = null;

	constructor( ctx ) {
		this.#ctx = ctx;
		this.#input = ctx.createGain();
		this.#output = ctx.createGain();
		this.#input.connect( this.#output );
		Object.seal( this );
	}

	static $loadModule( ctx ) {
		return ctx.audioWorklet.addModule( gswaPluginHost.$PATH );
	}

	async $initBridge() {
		if ( !window.orpheusDesktop?.processPlugin ) {
			return;
		}
		try {
			const workletUrl = new URL(
				"../vendor/orpheus-gs-wa-components/gswaPluginHost/gswaPluginBridgeProc.js",
				document.baseURI
			).href;

			await this.#ctx.audioWorklet.addModule( workletUrl );
			this.#processor = new AudioWorkletNode( this.#ctx, "gswapluginbridge", {
				numberOfInputs: 1,
				numberOfOutputs: 1,
				outputChannelCount: [ 2 ],
				processorOptions: { pluginId: "" },
			} );
			this.#processor.port.onmessage = async e => {
				if ( e.data.type !== "process" || !this.#pluginId ) {
					return;
				}
				const result = await window.orpheusDesktop.processPlugin(
					this.#pluginId,
					e.data.inputL,
					e.data.inputR,
					e.data.numSamples
				);

				this.#processor.port.postMessage( {
					type: "output",
					seq: e.data.seq,
					outputL: result.outputL,
					outputR: result.outputR,
				} );
			};
			this.#bridgeNode = this.#processor;
		} catch ( err ) {
			console.warn( "gswaPluginHost: worklet bridge unavailable, using passthrough", err );
			this.#bridgeNode = null;
		}
	}

	$connect( ...args ) { return this.#output.connect( ...args ); }
	$disconnect( ...args ) { return this.#output.disconnect( ...args ); }
	$getInput() { return this.#input; }
	$getOutput() { return this.#output; }

	async $loadPlugin( pluginId ) {
		this.#pluginId = pluginId;
		this.#rewire();
	}

	$unloadPlugin() {
		this.#pluginId = null;
		this.#rewire();
	}

	#rewire() {
		this.#input.disconnect();
		if ( this.#bridgeNode ) {
			this.#input.connect( this.#bridgeNode );
			this.#bridgeNode.connect( this.#output );
		} else {
			this.#input.connect( this.#output );
		}
	}

	$openEditor() {
		if ( this.#pluginId && window.orpheusDesktop?.openPluginEditor ) {
			return window.orpheusDesktop.openPluginEditor( this.#pluginId );
		}
	}

	$setParameter( paramId, value ) {
		if ( this.#pluginId && window.orpheusDesktop?.setPluginParameter ) {
			return window.orpheusDesktop.setPluginParameter( this.#pluginId, paramId, value );
		}
	}

	$sendMidiEvent( event ) {
		if ( this.#pluginId && window.orpheusDesktop?.sendPluginMidi ) {
			return window.orpheusDesktop.sendPluginMidi( this.#pluginId, event );
		}
	}

	$sendNoteOn( note, velocity = 1, channel = 0 ) {
		return this.$sendMidiEvent( {
			type: 1,
			channel,
			note,
			velocity: Math.round( velocity * 127 ),
		} );
	}

	$sendNoteOff( note, velocity = 0, channel = 0 ) {
		return this.$sendMidiEvent( {
			type: 0,
			channel,
			note,
			velocity: Math.round( velocity * 127 ),
		} );
	}

	$sendController( controllerNumber, controllerValue, channel = 0 ) {
		return this.$sendMidiEvent( {
			type: 3,
			channel,
			controllerNumber,
			controllerValue,
		} );
	}
}

Object.freeze( gswaPluginHost );
