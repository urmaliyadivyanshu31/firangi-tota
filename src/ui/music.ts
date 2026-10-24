// The record's code in one lazy chunk: its menu and the songs' cabinet, loaded on the first tap of
// the record (app.ts). One chunk, not three, keeps the offline copy's first download small.
export { openMusicMenu } from './music-menu'
export { createGramophone, SONGS, songIndex } from './gramophone'
