*There are too many things about PixiJs and vbWebEngine but I'm too lazy to write an exhaustive document*

Here're a few things to notice about PixiJs and tweening:

1. `width` and `height` properties of an object are scaled relative to its parent container.

     Let's say you have an container **A**, it has a child container **B** with its own childs, and those childs are doing positioning using container **B**'s width and height.

     Because childs' positioning are relative to their parent **B**, they shouldn't have anything to do with the scale of container **B**, which is relative to container **A**.

     When you scale the container **B**, its width and height will change, thus childs' positioning breaks apart.
     And this is exactly why `vbContainer` has a desired size.

2. If you have a lot of objects need tweening, firstly try to bind them all together into a few tweens. If they need to be separate tweens, try to add them into a single parent tween group, instead of creating on each of their own tween groups, it saves recursion time.

3. Check the return type of `vbTween.chain`, it returns itself, which means if you add `.start()` after `.chain()`, you start the first tween, not the chained tween.

     Actually you don't need to manually start the chained tween, just chain it before you start the first tween.

4. There's difference between `vbTween.onEnd` and `vbTween.addOnEnd`, the former only keeps one single callback, it clears all others.