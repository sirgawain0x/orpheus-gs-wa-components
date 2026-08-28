"use strict";

class DAWCoreControllerEffects extends DAWCoreControllerBase {
	#cbs = null;

	constructor( callbacks ) {
		super( { bpm: 120, effects: {}, channels: {} }, callbacks );
		this.#cbs = callbacks;
		Object.seal( this );
	}

	$change( obj ) {
		if ( "bpm" in obj && obj.bpm !== this.$data.bpm ) {
			this.$data.bpm = obj.bpm;
			this.#cbs.$changeBPM( obj.bpm );
		}
		if ( obj?.effects ) {
			DAWCoreControllerBase.$updateCollection( this.$data.effects, obj.effects, {
				create: ( id, patch ) => this.#addEffect( id, patch ),
				update: ( id, patch ) => this.#changeEffect( id, patch ),
				delete: id => this.#removeEffect( id ),
			} );
		}
		if ( obj?.channels ) {
			Object.entries( obj.channels ).forEach( ( [ chanId, patch ] ) => {
				this.#changeChannelFx( chanId, patch );
			} );
		}
	}

	$clear() {
		Object.keys( this.$data.effects ).forEach( id => this.#removeEffect( id ) );
		this.$data.channels = {};
	}

	$reset() {
		const effects = { ...this.$data.effects };
		const channels = GSUdeepCopy( this.$data.channels );
		const bpm = this.$data.bpm;

		this.$clear();
		this.$change( { bpm, effects, channels } );
	}

	#addEffect( id, patch ) {
		this.$data.effects[ id ] = GSUdeepCopy( patch );
		this.#cbs.$addEffect( id, patch );
		if ( "toggle" in patch ) {
			this.#cbs.$changeEffect( id, "toggle", patch.toggle );
		}
	}

	#removeEffect( id ) {
		this.#cbs.$removeEffect( id );
		delete this.$data.effects[ id ];
		Object.values( this.$data.channels ).forEach( chan => {
			if ( chan.effects ) {
				chan.effects = chan.effects.filter( fxId => fxId !== id );
			}
		} );
	}

	#changeEffect( id, patch ) {
		const prev = GSUdeepCopy( this.$data.effects[ id ] );

		if ( "toggle" in patch && patch.toggle !== prev.toggle ) {
			this.$data.effects[ id ].toggle = patch.toggle;
			this.#cbs.$changeEffect( id, "toggle", patch.toggle );
		}
		const dataPatch = { ...patch };

		delete dataPatch.toggle;
		delete dataPatch.type;
		if ( Object.keys( dataPatch ).length > 0 ) {
			GSUdiffAssign( this.$data.effects[ id ], dataPatch );
			this.#cbs.$changeEffectData( id, dataPatch );
		}
	}

	#changeChannelFx( chanId, patch ) {
		if ( !this.$data.channels[ chanId ] ) {
			this.$data.channels[ chanId ] = { effects: [] };
		}
		if ( patch?.effects ) {
			this.$data.channels[ chanId ].effects = patch.effects.slice();
			this.#reconnectChain( chanId, patch.effects );
		}
	}

	#reconnectChain( chanId, chain ) {
		const fxChain = chain || [];

		if ( fxChain.length === 0 ) {
			this.#cbs.$connectEffectTo( chanId, null, null );
			return;
		}
		this.#cbs.$connectEffectTo( chanId, null, fxChain[ 0 ] );
		for ( let i = 0; i < fxChain.length - 1; ++i ) {
			this.#cbs.$connectEffectTo( chanId, fxChain[ i ], fxChain[ i + 1 ] );
		}
		this.#cbs.$connectEffectTo( chanId, fxChain[ fxChain.length - 1 ], null );
	}
}

Object.freeze( DAWCoreControllerEffects );
