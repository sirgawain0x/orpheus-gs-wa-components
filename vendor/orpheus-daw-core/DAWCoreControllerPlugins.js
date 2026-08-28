"use strict";

class DAWCoreControllerPlugins extends DAWCoreControllerBase {
	#cbs = null;

	constructor( callbacks ) {
		super( { plugins: {}, channels: {} }, callbacks );
		this.#cbs = callbacks;
		Object.seal( this );
	}

	$change( obj ) {
		if ( obj?.plugins ) {
			DAWCoreControllerBase.$updateCollection( this.$data.plugins, obj.plugins, {
				create: ( id, patch ) => this.#addPlugin( id, patch ),
				update: ( id, patch ) => this.#changePlugin( id, patch ),
				delete: id => this.#removePlugin( id ),
			} );
		}
		if ( obj?.channels ) {
			Object.entries( obj.channels ).forEach( ( [ chanId, patch ] ) => {
				if ( patch?.plugins ) {
					this.$data.channels[ chanId ] = { plugins: patch.plugins.slice() };
					this.#reconnectChain( chanId, patch.plugins );
				}
			} );
		}
	}

	$clear() {
		Object.keys( this.$data.plugins ).forEach( id => this.#removePlugin( id ) );
		this.$data.channels = {};
	}

	$reset() {
		const plugins = { ...this.$data.plugins };
		const channels = GSUdeepCopy( this.$data.channels );

		this.$clear();
		this.$change( { plugins, channels } );
	}

	#addPlugin( id, patch ) {
		this.$data.plugins[ id ] = GSUgetModel( "plugin", patch );
		this.#cbs.$addPlugin( id, this.$data.plugins[ id ] );
	}

	#removePlugin( id ) {
		this.#cbs.$removePlugin( id );
		delete this.$data.plugins[ id ];
		Object.values( this.$data.channels ).forEach( chan => {
			if ( chan.plugins ) {
				chan.plugins = chan.plugins.filter( pid => pid !== id );
			}
		} );
	}

	#changePlugin( id, patch ) {
		if ( "toggle" in patch ) {
			this.$data.plugins[ id ].toggle = patch.toggle;
			this.#cbs.$changePlugin( id, "toggle", patch.toggle );
		}
		const dataPatch = { ...patch };

		delete dataPatch.toggle;
		if ( Object.keys( dataPatch ).length > 0 ) {
			GSUdiffAssign( this.$data.plugins[ id ], dataPatch );
			this.#cbs.$changePluginData( id, dataPatch );
		}
	}

	#reconnectChain( chanId, chain ) {
		const fxChain = chain || [];

		if ( fxChain.length === 0 ) {
			this.#cbs.$connectPluginTo( chanId, null, null );
			return;
		}
		this.#cbs.$connectPluginTo( chanId, null, fxChain[ 0 ] );
		for ( let i = 0; i < fxChain.length - 1; ++i ) {
			this.#cbs.$connectPluginTo( chanId, fxChain[ i ], fxChain[ i + 1 ] );
		}
		this.#cbs.$connectPluginTo( chanId, fxChain[ fxChain.length - 1 ], null );
	}

	$openPluginEditor( id ) {
		this.#cbs.$openPluginEditor?.( id );
	}
}

Object.freeze( DAWCoreControllerPlugins );
