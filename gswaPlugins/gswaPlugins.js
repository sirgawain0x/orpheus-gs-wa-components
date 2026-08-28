"use strict";

class gswaPlugins {
	ctx = null;
	#hosts = new Map();
	#getChanInput = null;
	#getChanOutput = null;
	#ctrl = new DAWCoreControllerPlugins( {
		$addPlugin: this.#addPlugin.bind( this ),
		$removePlugin: this.#removePlugin.bind( this ),
		$changePlugin: this.#changePlugin.bind( this ),
		$connectPluginTo: this.#connectPluginTo.bind( this ),
		$changePluginData: this.#changePluginData.bind( this ),
		$openPluginEditor: id => this.$getHost( id )?.$openEditor?.(),
	} );

	constructor( fns ) {
		Object.seal( this );
		this.#getChanInput = fns.getChanInput;
		this.#getChanOutput = fns.getChanOutput;
	}

	$getHost( id ) {
		return this.#hosts.get( id );
	}
	$setContext( ctx ) {
		this.ctx = ctx;
		this.#ctrl.$reset();
	}
	$change( obj ) {
		this.#ctrl.$change( obj );
	}
	$clear() {
		this.#ctrl.$clear();
	}
	$openPluginEditor( id ) {
		this.#ctrl.$openPluginEditor( id );
	}

	async #addPlugin( id, plugin ) {
		if ( !window.orpheusDesktop?.loadPlugin ) {
			console.warn( "gswaPlugins: desktop host unavailable" );
			return;
		}
		const host = new gswaPluginHost( this.ctx );

		await host.$initBridge();
		this.#hosts.set( id, host );
		try {
			await window.orpheusDesktop.loadPlugin( id, plugin );
			await host.$loadPlugin( id );
		} catch ( err ) {
			this.#hosts.delete( id );
			console.error( "gswaPlugins: load failed", err );
		}
	}
	#removePlugin( id ) {
		const host = this.#hosts.get( id );

		if ( host ) {
			host.$unloadPlugin();
			host.$disconnect();
		}
		window.orpheusDesktop?.unloadPlugin?.( id );
		this.#hosts.delete( id );
	}
	#changePlugin( id, prop, val ) {
		if ( prop !== "toggle" ) {
			return;
		}
		const host = this.#hosts.get( id );

		if ( !host ) {
			return;
		}
		if ( !val ) {
			host.$getOutput().disconnect();
			return;
		}
		Object.entries( this.#ctrl.$getData().channels ).forEach( ( [ chanId, chan ] ) => {
			const chain = chan.plugins || [];
			const idx = chain.indexOf( id );

			if ( idx === -1 ) {
				return;
			}
			this.#connectPluginTo( chanId, idx > 0 ? chain[ idx - 1 ] : null, id );
			this.#connectPluginTo( chanId, id, idx < chain.length - 1 ? chain[ idx + 1 ] : null );
		} );
	}
	#changePluginData( id, data ) {
		const host = this.$getHost( id );

		if ( !host ) {
			return;
		}
		if ( data.paramId !== undefined && data.value !== undefined ) {
			host.$setParameter( data.paramId, data.value );
		}
	}
	#connectPluginTo( chanId, pluginId, nextPluginId ) {
		const srcHost = pluginId ? this.$getHost( pluginId ) : null;
		const destHost = nextPluginId ? this.$getHost( nextPluginId ) : null;

		if ( pluginId && !srcHost ) {
			return;
		}
		if ( nextPluginId && !destHost ) {
			return;
		}
		const dest = destHost
			? destHost.$getInput()
			: this.#getChanOutput( chanId );
		const node = srcHost
			? srcHost.$getOutput()
			: this.#getChanInput( chanId );

		if ( node && dest ) {
			node.disconnect();
			node.connect( dest );
		}
	}
}

Object.freeze( gswaPlugins );
