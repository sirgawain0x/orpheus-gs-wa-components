"use strict";

const { execSync } = require( "child_process" );
const fs = require( "fs" );
const path = require( "path" );

const root = path.join( __dirname, ".." );
const publicDir = path.join( root, "public" );
const vendorSrc = path.join( root, "vendor" );
const vendorPublic = path.join( publicDir, "vendor" );
const utilsPublic = path.join( vendorPublic, "orpheus-gs-utils" );

const SKIP_TOP = new Set( [
	".git",
	"node_modules",
	"scripts",
	"public",
	"vercel.json",
	".gitignore",
	"README.md",
	"LICENSE",
] );

function copyEntry( src, dest ) {
	const stat = fs.statSync( src );

	if ( stat.isDirectory() ) {
		fs.mkdirSync( dest, { recursive: true } );
		for ( const name of fs.readdirSync( src ) ) {
			if ( src === vendorSrc && name === "orpheus-gs-utils" ) {
				continue;
			}
			copyEntry( path.join( src, name ), path.join( dest, name ) );
		}
		return;
	}
	fs.copyFileSync( src, dest );
}

function writePublicSite() {
	if ( fs.existsSync( publicDir ) ) {
		fs.rmSync( publicDir, { recursive: true, force: true } );
	}
	fs.mkdirSync( publicDir, { recursive: true } );

	for ( const name of fs.readdirSync( root ) ) {
		if ( SKIP_TOP.has( name ) ) {
			continue;
		}
		copyEntry( path.join( root, name ), path.join( publicDir, name ) );
	}
}

writePublicSite();
fs.mkdirSync( vendorPublic, { recursive: true } );

if ( !fs.existsSync( utilsPublic ) ) {
	console.log( "Cloning orpheus-gs-utils into public/vendor/…" );
	execSync(
		"git clone --depth 1 https://github.com/creativeplatform/orpheus-gs-utils.git orpheus-gs-utils",
		{ cwd: vendorPublic, stdio: "inherit" }
	);
} else {
	console.log( "public/vendor/orpheus-gs-utils already present" );
}

const dawCore = path.join( vendorPublic, "orpheus-daw-core", "DAWCoreControllerBase.js" );

if ( !fs.existsSync( dawCore ) ) {
	console.error( "Missing public/vendor/orpheus-daw-core — commit DAWCore files under vendor/" );
	process.exit( 1 );
}

console.log( "Vercel build wrote public/" );
