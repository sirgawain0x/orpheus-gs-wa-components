"use strict";

class DAWCorePersistence {
	static $export( data ) {
		return JSON.stringify( data, null, "\t" );
	}

	static $import( json ) {
		return typeof json === "string" ? JSON.parse( json ) : GSUdeepCopy( json );
	}

	static $saveLocal( key, data ) {
		localStorage.setItem( key, DAWCorePersistence.$export( data ) );
	}

	static $loadLocal( key ) {
		const raw = localStorage.getItem( key );

		return raw ? DAWCorePersistence.$import( raw ) : null;
	}
}

Object.freeze( DAWCorePersistence );
