"use strict";

class DAWCoreControllerMixer extends DAWCoreControllerBase {
	#cbs = null;

	constructor( callbacks ) {
		super( { channels: {} }, callbacks );
		this.#cbs = callbacks;
		Object.seal( this );
	}

	$change( obj ) {
		if ( obj?.channels ) {
			DAWCoreControllerBase.$updateCollection( this.$data.channels, obj.channels, {
				create: ( id, patch ) => this.#addChannel( id, patch ),
				update: ( id, patch ) => this.#changeChannel( id, patch ),
				delete: id => this.#removeChannel( id ),
			} );
		}
	}

	$clear() {
		Object.keys( this.$data.channels ).forEach( id => this.#removeChannel( id ) );
	}

	$recall() {
		Object.entries( this.$data.channels ).forEach( ( [ id, chan ] ) => {
			this.#cbs.$addChannel( id );
			Object.entries( chan ).forEach( ( [ prop, val ] ) => {
				this.#cbs.$changeChannelProp( id, prop, val, undefined );
			} );
		} );
	}

	#addChannel( id, patch ) {
		const modelName = id === "main" ? "channelMain" : "channel";

		this.$data.channels[ id ] = GSUgetModel( modelName, patch );
		this.#cbs.$addChannel( id );
		Object.entries( this.$data.channels[ id ] ).forEach( ( [ prop, val ] ) => {
			this.#cbs.$changeChannelProp( id, prop, val, undefined );
		} );
	}

	#removeChannel( id ) {
		this.#cbs.$removeChannel( id );
		delete this.$data.channels[ id ];
	}

	#changeChannel( id, patch ) {
		DAWCoreControllerBase.$updateProps( this.$data.channels[ id ], patch,
			( prop, val, prev ) => this.#cbs.$changeChannelProp( id, prop, val, prev )
		);
	}
}

Object.freeze( DAWCoreControllerMixer );
