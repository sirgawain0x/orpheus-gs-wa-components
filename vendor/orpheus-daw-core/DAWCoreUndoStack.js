"use strict";

class DAWCoreUndoStack {
	#undo = [];
	#redo = [];
	#onApply = null;

	constructor( onApply ) {
		this.#onApply = onApply;
		Object.seal( this );
	}

	$canUndo() { return this.#undo.length > 0; }
	$canRedo() { return this.#redo.length > 0; }

	$push( dataBefore, patch ) {
		const undo = GSUcomposeUndo( dataBefore, patch );

		if ( undo && Object.keys( undo ).length > 0 ) {
			this.#undo.push( GSUdeepCopy( undo ) );
			this.#redo.length = 0;
		}
	}

	$undo( data ) {
		const undo = this.#undo.pop();

		if ( undo ) {
			this.#redo.push( GSUcomposeUndo( data, undo ) );
			this.#onApply( undo );
			return undo;
		}
	}

	$redo( data ) {
		const redo = this.#redo.pop();

		if ( redo ) {
			this.#undo.push( GSUcomposeUndo( data, redo ) );
			this.#onApply( redo );
			return redo;
		}
	}

	$clear() {
		this.#undo.length = 0;
		this.#redo.length = 0;
	}
}

Object.freeze( DAWCoreUndoStack );
