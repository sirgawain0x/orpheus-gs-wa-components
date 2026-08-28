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
		$changePluginData: ( id, data ) => this.$getHost( id )?.$setParameter?.( data ),
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

	#addPlugin( id, plugin ) {
		if ( !window.orpheusDesktop?.loadPlugin ) {
			console.warn( "gswaPlugins: desktop host unavailable" );
			return;
		}
		const host = new gswaPluginHost( this.ctx );

		this.#hosts.set( id, host );
		window.orpheusDesktop.loadPlugin( id, plugin ).then( () => host.$loadPlugin( id ) );
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
		if ( prop === "toggle" && !val ) {
			this.#hosts.get( id )?.$disconnect();
		}
	}
	#connectPluginTo( chanId, pluginId, nextPluginId ) {
		const dest = nextPluginId
			? this.$getHost( nextPluginId ).$getInput()
			: this.#getChanOutput( chanId );
		const node = pluginId
			? this.$getHost( pluginId ).$getOutput()
			: this.#getChanInput( chanId );

		if ( node ) {
			node.disconnect();
			node.connect( dest );
		}
	}
}

Object.freeze( gswaPlugins );
