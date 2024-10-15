import { isContainer, vbContainer } from '../vbContainer';
import type { vbGraphicObject } from '../vbGraphicObject';


/** Parent container, its class name and its child items */
type vbSceneParentItem<T = vbContainer> = [
    T,
    string | undefined,
    Array<vbSceneChildsItem | vbSceneParentItem>
];
/** Array of objects and their identical class name  */
type vbSceneChildsItem = [Array<vbGraphicObject>, string | undefined];
/** An object, with its class name, and its parent container */
type vbSceneObjectMap<T = vbGraphicObject> = Map<T, [string | undefined, vbContainer]>;
type vbSceneObjectItem = [vbGraphicObject, string | undefined, vbContainer];

function isParentItem(item: vbSceneChildsItem | vbSceneParentItem): item is vbSceneParentItem {
    return item.length == 3;
}


/**
 * Scene holds a collection of objects which shall be added to the container. \
 * Each scene has a root container and, therefore, it is possible that the game have multiple scenes at the same time
 * as long as they have the different root container (?) @see `vbGame.currScene`
 */
class vbScene {
    readonly name: string;
    readonly rootContainer: vbContainer;
    readonly objs: vbSceneObjectMap;

    /**
     * @param name Name of the scene
     * @param sceneObjs Hierarchical tree of containers and objects.
     *      The root container of scene objects must have a unique name,
     *      which is used for the lookup from `vbGame.currScene`.
     */
    constructor(name: string, sceneObjs: vbSceneParentItem) {
        this.name = name;
        this.rootContainer = sceneObjs[0];
        this.objs = new Map();
        this._constructMap(sceneObjs);
    }

    /**
     * @param parent Parent container
     * @param getChilds A function that returns an array of child items
     * @param toName Container's class name to be set
     */
    static fromContainer<T extends vbContainer>(
        parent: T,
        getChilds: (parent: T) => Array<vbSceneChildsItem | vbSceneParentItem>,
        toName?: string): vbSceneParentItem<T> {
        return [parent, toName, getChilds(parent)];
    }

    /**
     * @param objs An object or an array of object that shares the same class name (if provided)
     * @param toName Objects' class name to be set (optional)
     */
    static fromObjs(objs: vbGraphicObject | Array<vbGraphicObject>, toName?: string): vbSceneChildsItem {
        return [Array.isArray(objs) ? objs : [objs], toName];
    }

    protected _constructMap(sceneObjs: vbSceneParentItem) {
        const parent = sceneObjs[0];
        for (const childsItem of sceneObjs[2]) {
            if (isParentItem(childsItem)) {
                this.objs.set(childsItem[0], [childsItem[1], parent]);
                this._constructMap(childsItem);
            }
            else {
                for (const child of childsItem[0]) {
                    this.objs.set(child, [childsItem[1], parent]);
                }
            }
        }
    }
}


class vbSceneTransition {
    readonly fromScene: vbScene | null;
    readonly toScene: vbScene;
    /** Objects that only exist in `fromScene` */
    readonly fromObjs: vbSceneObjectItem[];
    /** Objects that only exist in `toScene` */
    readonly toObjs: vbSceneObjectItem[];
    /** Objects that exist in both scenes but have been given different class names */
    readonly sameObjs: vbSceneObjectItem[];
    /**
     * In a hierarchical object tree, if there's a container needs to be added to the next scene,
     * all its children no longer needs to be applied styles individually
     * since invoking recursive function on the container is enough.
     */
    readonly toContainers: vbSceneObjectMap<vbContainer>;

    constructor(from: string | null, to: string) {
        this.toScene = globalThis.pgame.scene(to);
        this.toContainers = new Map();
        const toObjMap = this.toScene.objs;
        if (from !== null) {
            this.fromScene = globalThis.pgame.scene(from);
            const fromObjMap = this.fromScene.objs;
            this.fromObjs = Array.from(fromObjMap.entries())
                            .filter(([key]) => !toObjMap.has(key))
                            .map(([key, value]) => [key, ...value]);
            this.toObjs = Array.from(toObjMap.entries())
                          .filter(([key]) => !fromObjMap.has(key))
                          .map(([key, value]) => {
                            if (isContainer(key))
                                this.toContainers.set(key, value);
                            return [key, ...value];
                          });
            this.sameObjs = Array.from(toObjMap.entries())
                            .filter(([key, value]) => {
                                // make sure the same object in 2 scenes is given different class names
                                const value2 = fromObjMap.get(key);
                                return value2 !== undefined && value[0] !== value2[0];
                            })
                            .map(([key, value]) => [key, ...value]);
        }
        else {
            this.fromScene = null;
            this.fromObjs = [];
            this.toObjs = Array.from(toObjMap.entries())
                          .map(([key, value]) => {
                            if (isContainer(key))
                                this.toContainers.set(key, value);
                            return [key, ...value];
                          });
            this.sameObjs = [];
        }
    }

    /**
     * Transit to the next scene
     * @param applyStyle Apply current view style and localization to the objects added.
     */
    transit(applyStyle: boolean) {
        this.exitCurrScene();
        this.enterNextScene(applyStyle);
    }

    /**
     * Add objects that don't exist on the current scene, and change their corresponding class names.
     */
    enterNextScene(applyStyle: boolean) {
        if (applyStyle) {
            for (const [child, className, parent] of this.toObjs) {
                if (className !== undefined) child.name = className;
                if (this.toContainers.has(parent)) {
                    // the parent container of this child needs to be added as well
                    // so the child will be simply added, then wait for its parent to recursively apply style
                    parent.addObj(child);
                }
                else {
                    parent.addObjWithStyle(child, globalThis.pgame.currStyle.list, globalThis.pgame.currLocale);
                }
            }
            // further squeeze containers and recursively apply style
            for (const [child, item] of this.toContainers.entries()) {
                // get the parent container of container
                const parent = item[1];
                if (!this.toContainers.has(parent)) {
                    child.useViewStyleChildren(globalThis.pgame.currStyle.list);
                    child.useLocale(globalThis.pgame.currLocale);
                }
            }
            for (const [child, className, parent] of this.sameObjs) {
                if (className !== undefined && child.name != className) {
                    child.name = className;
                    parent.applyObjWithStyle(child, globalThis.pgame.currStyle.list, globalThis.pgame.currLocale);
                }
            }
        }
        else {
            for (const [child, className, parent] of this.toObjs) {
                if (className !== undefined) child.name = className;
                parent.addObj(child);
            }
            for (const [child, className] of this.sameObjs) {
                if (className !== undefined) child.name = className;
            }
        }
        globalThis.pgame.setScene(this.toScene);
    }

    /**
     * Remove objects that don't exist on the next scene.
     */
    exitCurrScene() {
        for (const [child, _className, parent] of this.fromObjs) {
            parent.removeObj(child);
        }
    }

    /**
     * Used for convenientlty performing tweening.
     * Get an array of objects to enter in `toObjs` and their transition properties. \
     * The props are positions, scales, etc, described in `ViewStyleItem`.
     */
    getEnterProperties() {
        const viewStyles = globalThis.pgame.currStyle.list;
        const objs: vbGraphicObject[] = [];
        const props: AnyObject[] = [];

        for (let [obj, className] of this.toObjs) {
            className = className ?? obj.name;
            const item = viewStyles[className];
            if (item === undefined) continue;

            const prop: AnyObject = {};
            if (item.xy) {
                prop.x = item.xy[0];
                prop.y = item.xy[1];
            }
            if (item.s) {
                if (!Array.isArray(item.s))
                    prop.scale = { x: item.s, y: item.s };
                else {
                    prop.width = item.s[0];
                    prop.height = item.s[1];
                }
            }
            objs.push(obj);
            props.push(prop);
        }
        return { objs, props };
    }

    /**
     * Used for convenientlty performing tweening.
     * Get an array of objects to exit in `fromObjs` and their transition properties. \
     * The props are positions, scales, etc, described in `ViewStyleItem.trans`.
     */
    getExitProperties() {
        const viewStyles = globalThis.pgame.currStyle.list;
        const objs: vbGraphicObject[] = [];
        const props: AnyObject[] = [];

        for (let [obj, className] of this.fromObjs) {
            className = className ?? obj.name;
            const item = viewStyles[className];
            if (item === undefined || item.trans === undefined) continue;

            const prop: AnyObject = {};
            if (item.trans.xy) {
                prop.x = item.trans.xy[0];
                prop.y = item.trans.xy[1];
            }
            if (item.trans.s) {
                if (!Array.isArray(item.trans.s))
                    prop.scale = { x: item.trans.s, y: item.trans.s };
                else {
                    prop.width = item.trans.s[0];
                    prop.height = item.trans.s[1];
                }
            }
            objs.push(obj);
            props.push(prop);
        }
        return { objs, props };
    }

    /**
     * Used for convenientlty performing tweening.
     * Get an array of objects to enter in `sameObjs` and their transition properties. \
     * The props are positions, scales, etc, described in the `ViewStyleItem` of `toScene`.
     */
    getTransitionProperties() {
        const viewStyles = globalThis.pgame.currStyle.list;
        const objs: vbGraphicObject[] = [];
        const props: AnyObject[] = [];

        for (let [obj, className] of this.sameObjs) {
            className = className ?? obj.name;
            const item = viewStyles[className];
            if (item === undefined) continue;

            const prop: AnyObject = {};
            if (item.xy) {
                prop.x = item.xy[0];
                prop.y = item.xy[1];
            }
            if (item.s) {
                if (!Array.isArray(item.s))
                    prop.scale = { x: item.s, y: item.s };
                else {
                    prop.width = item.s[0];
                    prop.height = item.s[1];
                }
            }
            objs.push(obj);
            props.push(prop);
        }
        return { objs, props };
    }
}


export { vbScene, vbSceneTransition };