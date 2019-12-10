# Presentation Roulette

An idea created for the [SydCSS](http://sydcss.com) meetup: Get some presenters to deliver 5-10 minute talks on a CSS-related topic.

The catch is that they don’t know what their topic is until the start of the event, then they have around 20 minutes to prepare a talk.

This repo contains the code for the spinning **Wheel of Talks™** used on the night.

## Live demo

Try it out at https://gilmoreorless.github.io/presentation-roulette/

Controls:

- Wheel spinning is initiated by clicking the big red button, or by pressing the <kbd>Space</kbd> or <kbd>Enter</kbd> keys.
- An extra “preview” mode (a slow, constant spin) can be activated by pressing the down arrow (or <kbd>b</kbd>, due to the specifics of my presentation remote control).
- A treat added for the second SydCSS “Wheel of Talks” event in 2019: A cheesy ’80s-inspired intro animation (complete with theme tune) can be shown by clicking the relevant big red button, or by pressing the <kbd>i</kbd> or <kbd>PageDown</kbd> keys.
- To reset the animations and topic selection, press the <kbd>r</kbd> or <kbd>PageUp</kbd> keys.

## How it was built, and why

All the details can be found in my blog post: [SydCSS Wheel of Talks](https://shoehornwithteeth.com/ramblings/2019/03/sydcss-wheel-of-talks/).

## Caveats / warnings

This project was written entirely using Chrome DevTools’ “workspaces” feature, with the aim of using raw CSS and JS as much as possible.
The only external dependencies are a font and some sound effects.

However, because it was written for a one-off presentation to be run on a single machine (mine), it may not work perfectly for everyone.

This code is mainly provided as a reference for those who want to see how it was built, and **is not intended to be instantly-reusable in its current state**.

The JS code did start off quite small, but grew and grew as the scope crept ever onwards. The git history shows the evolution of the idea over the weeks leading up to the event. And then we did the event again a year later, so the ideas kept coming.

### For those who were there on the first night (2018)

The animations were rigged to happen in a specific order, but the talk selections were not.

The code to select a topic is most definitely random choice — it’s literally [Math.random()](https://github.com/gilmoreorless/presentation-roulette/blob/5a36c56d9780d538b4531d2c6476158c52cec085/sydcss.js#L40).

It was pure coincidence that 2 out of 3 presenters got the topic they wanted.

## Credits

All code is © Gilmore Davidson under the [MIT licence](LICENSE).

Sound effects credits:

* Spinning wheel effect is © BBC via the [BBC Sound Effects archive](http://bbcsfx.acropolis.org.uk/?q=roulette+large) under the [RemArc Licence](https://github.com/bbcarchdev/Remarc/blob/master/doc/2016.09.27_RemArc_Content%20licence_Terms%20of%20Use_final.pdf) (the sound was then modified by me to fit the animation timing).
* Other sound effects come from [Freesound](https://freesound.org) under the [CC-Zero](https://creativecommons.org/publicdomain/zero/1.0/deed) licence.
