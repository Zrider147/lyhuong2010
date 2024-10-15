import type * as PIXI from 'pixi.js';


declare global {
    /**
     * Point. Refers to any object that contains `x` and `y` properties. \
     * Namely, `PIXI.ObserverablePoint`, or any object derived from `PIXI.DisplayObject`.
     * Examples can be any `vbGraphicObject`, or its properties like `position`, `scale`, etc.
     */
    type Pnt2 = { x: number, y: number };
    /**
     * Refers to any object that contains properties `x`,`y`,`width` and `height`. \
     * Namely, `PIXI.Rectangle`, or any object derived from `PIXI.DisplayObject` like `vbGraphicObject`.
     */
    type Rect = { x:number, y:number, width: number, height: number };
    type NumPair = [number, number];

    /** Hierarchical strcture to reference points */
    type StructuralPoints = { [k: string]: StructuralPointItem };
    type StructuralPointItem = Pnt2 | StructuralPoints;
}


enum PivotPoint {
    None,
    TopLeft,
    TopMiddle,
    TopRight,
    Center,
    MiddleLeft,
    MiddleRight,
    BottomLeft,
    BottomMiddle,
    BottomRight
}

/**
 * Calculate the x and y relative to `size` based on pivot rule, then assign them to `point`.
 * 
 * @param point The point to be assigned to, can be `vbGraphicObject.position`, `pivot`, `anchor`, etc.
 * @param rule Pivot rule
 * @param rect An object that is the subtype of Rect
 */
function assignPivotPoint(point: PIXI.ObservablePoint, rule: PivotPoint, rect: Rect) {
    switch (rule) {
        case PivotPoint.TopLeft: {
            point.set(rect.x, rect.y); break;
        }
        case PivotPoint.TopMiddle: {
            point.set(rect.x + rect.width/2, rect.y); break;
        }
        case PivotPoint.TopRight: {
            point.set(rect.x + rect.width, rect.y); break;
        }
        case PivotPoint.Center: {
            point.set(rect.x + rect.width/2, rect.y + rect.height/2); break;
        }
        case PivotPoint.MiddleLeft: {
            point.set(rect.x, rect.y + rect.height/2); break;
        }
        case PivotPoint.MiddleRight: {
            point.set(rect.x + rect.width, rect.y + rect.height/2); break;
        }
        case PivotPoint.BottomLeft: {
            point.set(rect.x, rect.y + rect.height); break;
        }
        case PivotPoint.BottomMiddle: {
            point.set(rect.x + rect.width/2, rect.y + rect.height); break;
        }
        case PivotPoint.BottomRight: {
            point.set(rect.x + rect.width, rect.y + rect.height); break;
        }
    }
}

/**
 * Calculate the x and y ratio (range from 0 to 1) based on pivot rule,
 * then assign them to `point`.
 * 
 * @param point The point to be assigned to, can be `vbGraphicObject.position`, `pivot`, `anchor`, etc.
 * @param rule Pivot rule
 */
function assignPivotPointRatio(point: PIXI.ObservablePoint, rule: PivotPoint) {
    switch (rule) {
        case PivotPoint.TopLeft: {
            point.set(0); break;
        }
        case PivotPoint.TopMiddle: {
            point.set(0.5, 0); break;
        }
        case PivotPoint.TopRight: {
            point.set(1, 0); break;
        }
        case PivotPoint.Center: {
            point.set(0.5); break;
        }
        case PivotPoint.MiddleLeft: {
            point.set(0, 0.5); break;
        }
        case PivotPoint.MiddleRight: {
            point.set(1, 0.5); break;
        }
        case PivotPoint.BottomLeft: {
            point.set(0, 1); break;
        }
        case PivotPoint.BottomMiddle: {
            point.set(0.5, 1); break;
        }
        case PivotPoint.BottomRight: {
            point.set(1, 1); break;
        }
    }
}

export {
    PivotPoint,
    assignPivotPoint,
    assignPivotPointRatio
};