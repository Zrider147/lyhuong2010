/**
 * Re-export all those insignificant, miscellaneous things, selectively,
 * so they can be wrapped in an additional namespace at `index.ts` for projects to use.
 */
export { isGraphicObject } from './vbGraphicObject';
export { isMinimalContainer, isContainer } from './vbContainer';

export {
    assignPivotPoint,
    assignPivotPointRatio,
} from './core/vbTransform';

export {
    isLocalizedObject,
    type TextStyleItem,
    type TextStyleList,
    type LocalizedDictionary,
    type LocalizationTable
} from './core/vbLocalization';

export type {
    ViewStyleItem,
    ViewStyleList,
    ViewStyleTable,
    ContainerStyleItem,
    ImageStyleItem
} from './core/vbViewStyle';

export {
    isKeyDown,
    isKeyNotPressed,
    recurseEventMode
} from './core/vbInteraction';

export * from './misc/vbUtils';
export { shared } from './misc/vbShared';
export type { AssetList } from './misc/vbLoader';
export * from './misc/WebUtils';

export {
    soundAsset,
    SupportedSoundExts
} from './misc/vbSound';
