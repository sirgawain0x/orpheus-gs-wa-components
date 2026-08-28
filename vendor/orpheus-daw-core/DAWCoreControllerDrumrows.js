"use strict";

class DAWCoreControllerDrumrows extends DAWCoreControllerBase {
	#cbs = null;

	constructor( callbacks ) {
		super( { drumrows: {}, patterns: {} }, callbacks );
		this.#cbs = callbacks;
		Object.seal( this );
	}

	$change( obj ) {
		if ( obj?.patterns ) {
			DAWCoreControllerBase.$updateCollection( this.$data.patterns, obj.patterns, {
				create: ( id, patch ) => this.#addPattern( id, patch ),
				update: ( id, patch ) => GSUdiffAssign( this.$data.patterns[ id ], patch ),
				delete: id => delete this.$data.patterns[ id ],
			} );
		}
		if ( obj?.drumrows ) {
			DAWCoreControllerBase.$updateCollection( this.$data.drumrows, obj.drumrows, {
				create: ( id, patch ) => this.#addDrumrow( id, patch ),
				update: ( id, patch ) => this.#changeDrumrow( id, patch ),
				delete: id => this.#removeDrumrow( id ),
			} );
		}
	}

	$clear() {
		Object.keys( this.$data.drumrows ).forEach( id => this.#removeDrumrow( id ) );
		this.$data.patterns = {};
	}

	#addPattern( id, patch ) {
		this.$data.patterns[ id ] = GSUdeepCopy( patch );
	}

	#addDrumrow( id, patch ) {
		this.$data.drumrows[ id ] = GSUgetModel( "drumrow", patch );
		this.#cbs.$addDrumrow?.( id, patch );
	}

	#removeDrumrow( id ) {
		this.#cbs.$removeDrumrow( id );
		delete this.$data.drumrows[ id ];
	}

	#changeDrumrow( id, patch ) {
		DAWCoreControllerBase.$updateProps( this.$data.drumrows[ id ], patch,
			( prop, val ) => this.#cbs.$changeDrumrow( id, prop, val )
		);
	}
}

Object.freeze( DAWCoreControllerDrumrows );
