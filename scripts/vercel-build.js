"use strict";

const { execSync } = require( "child_process" );
const fs = require( "fs" );
const path = require( "path" );

const root = path.join( __dirname, ".." );
const vendor = path.join( root, "vendor" );
const utilsPath = path.join( vendor, "orpheus-gs-utils" );

fs.mkdirSync( vendor, { recursive: true } );

if ( !fs.existsSync( utilsPath ) ) {
	console.log( "Cloning orpheus-gs-utils into vendor/…" );
	execSync(
		"git clone --depth 1 https://github.com/creativeplatform/orpheus-gs-utils.git orpheus-gs-utils",
		{ cwd: vendor, stdio: "inherit" }
	);
} else {
	console.log( "vendor/orpheus-gs-utils already present" );
}

const dawCore = path.join( vendor, "orpheus-daw-core", "DAWCoreControllerBase.js" );

if ( !fs.existsSync( dawCore ) ) {
	console.error( "Missing vendor/orpheus-daw-core — commit DAWCore controller files in vendor/" );
	process.exit( 1 );
}

console.log( "Vercel build ready" );
