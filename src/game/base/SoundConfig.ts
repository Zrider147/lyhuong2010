import type { vbSound } from "@vb/index";

export const MusicNames = {
    Bg: 'background',
}

export const SoundNames = {
    Click: 'buttonclick',
    CoinIncrement: 'coinincrement',
    Hint: 'hint',
}

export type MusicCollection = { [K in keyof (typeof MusicNames)]: vbSound };
export type SoundCollection = { [K in keyof (typeof SoundNames)]: vbSound };

export function configSounds(music: MusicCollection, sound: SoundCollection) {
    music.Bg.volume = 0.3
    music.Bg.loop = true
    music.Bg.fadeIn = music.Bg.fadeOut = 1000
    music.Bg.mutexPause = true

    sound.Click.volume = 3.3
    sound.CoinIncrement.fadeOut = 500
    sound.Hint.volume = 2
}