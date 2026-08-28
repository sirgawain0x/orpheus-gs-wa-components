"use strict";

class DAWCoreControllerBase {
	#data = null;
	#cbs = null;

	constructor( data, callbacks ) {
		this.#data = data;
		this.#cbs = callbacks;
		Object.seal( this );
	}

	get $data() { return this.#data; }
	$getData() { return this.#data; }

	$clear() {
		Object.keys( this.#data ).forEach( k => delete this.#data[ k ] );
	}

	static #diffProps( prev, next, fn ) {
		if ( !next ) {
			return;
		}
		Object.entries( next ).forEach( ( [ prop, val ] ) => {
			if ( prev?.[ prop ] !== val ) {
				fn( prop, val, prev?.[ prop ] );
			}
		} );
	}

	static $updateCollection( dataSrc, patch, cbs ) {
		if ( !patch ) {
			return;
		}
		GSUcreateUpdateDelete( dataSrc, patch,
			( id, obj ) => cbs.create( id, obj ),
			( id, obj ) => cbs.update( id, obj ),
			( id ) => cbs.delete( id )
		);
	}

	static $updateProps( target, patch, fn ) {
		const prev = GSUdeepCopy( target );

		GSUdiffAssign( target, patch );
		DAWCoreControllerBase.#diffProps( prev, patch, ( prop, val, oldVal ) => {
			fn( prop, val, oldVal );
		} );
	}
}

Object.freeze( DAWCoreControllerBase );
