import { vbTween } from './vbTween'


/**
 * Controlling groups of tweens
 */
class vbTweenGroup {
    protected _twMap?: Map<string, vbTween<AnyObject>>
    protected _tweensAddedDuringUpdate?: Map<string, vbTween<AnyObject>>

    /**
     * @param name Cannot be duplicated
     * @param obj Owner object of the properties in `to`
     * @param to A collection of properties from `obj`.
     * @param duration Time in ms.
     */
    create<T extends AnyObject>(name: string, obj: T, to: AnyObject, duration=1000) {
        const tw = new vbTween(name, obj, this).to(to, duration)
        return tw
    }
    getByName(name: string): vbTween | undefined {
        return this._twMap?.get(name)
    }
    size() {
        if (this._twMap === undefined) return 0
        else return this._twMap.size
    }

    add(tween: vbTween<AnyObject>): void {
        if (this._twMap === undefined || this._tweensAddedDuringUpdate === undefined) {
            this._twMap = new Map<string, vbTween<AnyObject>>()
            this._tweensAddedDuringUpdate = new Map<string, vbTween<AnyObject>>()
        }
        this._twMap.set(tween.name, tween)
        this._tweensAddedDuringUpdate.set(tween.name, tween)
    }

    remove(tween: vbTween<AnyObject>): void {
        this._twMap?.delete(tween.name)
        this._tweensAddedDuringUpdate?.delete(tween.name)
    }

    getAll(): vbTween<AnyObject>[] {
        if (this._twMap !== undefined)
            return [...this._twMap.values()]
        else return []
    }
    removeAll(): void {
        this._twMap?.clear()
        this._tweensAddedDuringUpdate?.clear()
    }
    endAll(): void {
        this.updateTillEnd()
    }

    update(time: number): void {
        if (this._twMap === undefined || this._twMap.size == 0 || this._tweensAddedDuringUpdate === undefined) return

        let tweenIds = [...this._twMap.keys()]
        // Tweens are updated in "batches". If you add a new tween during an
        // update, then the new tween will be updated in the next batch.
        // If you remove a tween during an update, it may or may not be updated.
        // However, if the removed tween was added during the current batch,
        // then it will not be updated.
        while (tweenIds.length > 0) {
            this._tweensAddedDuringUpdate.clear()

            for (const name of tweenIds) {
                const tween = this._twMap.get(name)
                if (tween === undefined) continue
                if (tween.update(time) === false) {
                    this._twMap.delete(tween.name)
                }
            }

            tweenIds = [...this._tweensAddedDuringUpdate.keys()]
        }
    }

    updateTillEnd(): void {
        if (this._twMap === undefined || this._twMap.size == 0 || this._tweensAddedDuringUpdate === undefined) return

        let tweenIds = [...this._twMap.keys()]
        while (tweenIds.length > 0) {
            this._tweensAddedDuringUpdate.clear()

            for (const name of tweenIds) {
                const tween = this._twMap.get(name)
                if (tween !== undefined) {
                    tween.updateTillEnd()
                    this._twMap.delete(tween.name)    
                }
            }

            tweenIds = [...this._tweensAddedDuringUpdate.keys()]
        }
    }
}

export { vbTweenGroup }