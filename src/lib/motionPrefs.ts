/**
 * Motion flags the 3D loop reads every frame. Set once at boot; a module
 * constant beats threading props through every component. Lives outside
 * src/three so the app shell can set it without pulling three.js into the
 * main bundle.
 */
export const motionPrefs = { reduced: false, finePointer: true, scale: 1 }
