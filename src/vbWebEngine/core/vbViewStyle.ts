/**
 * A single view style element for a vbGraphicObject.
 * @note The view style of an object will only be applied when
 *       it's newly added into a scene, or game switches to another view style. \
 *       So if game transits to another scene but the object remains,
 *       new view style will not be applied, you have to do it your own.
 */
type ViewStyleItem = {
    /** position [x, y] */
    xy?: NumPair,
    /** scale as a single number, or the (scaled/stretched) width and height as [w, h] */
    s?: number | NumPair,
    /** visible */
    vis?: boolean,
    /** utility transition properties, used solely for scene transition */
    trans?: {
        /** from `xy` to `trans.xy` */
        xy?: NumPair,
        /** from `s` to `trans.s` */
        s?: number | NumPair
    }
}

/** Each name of vbGraphicObject maps a view style item  */
type ViewStyleList = {
    [name: string]: ViewStyleItem
}

type ViewStyleTable = {
    /** specified by the filename of json */
    name: string,
    /** desired width and height */
    Resolution: NumPair,
    list: ViewStyleList
}


type ContainerStyleItem = ViewStyleItem & {
    /** desired size */
    dwh?: NumPair
}

type ImageStyleItem = ViewStyleItem & {
    /** texture name */
    tex?: string
}

function loadViewStyleFromData(name: string, groups: Record<string, ViewStyleList>): ViewStyleTable {
    const resolution = <NumPair><unknown>groups['Resolution'];
    if (resolution === undefined || !Array.isArray(resolution)) throw Error('No resolution in style!');
    delete groups['Resolution'];
    // flatten groups to a single list
    const styles = {};
    Object.assign(styles, ...Object.values(groups));
    return {
        name: name,
        Resolution: resolution,
        list: styles
    };
}

const emptyViewStyle: ViewStyleTable = { name:'', Resolution:[1,1], list:{} };

export {
    type ViewStyleItem,
    type ViewStyleList,
    type ViewStyleTable,
    type ContainerStyleItem,
    type ImageStyleItem,
    loadViewStyleFromData,
    emptyViewStyle
};