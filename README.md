# Presentation Roulette

An idea created for the [SydCSS](http://sydcss.com) meetup: Get some presenters to deliver 5-10 minute talks on a CSS-related topic.

The catch is that they don’t know what their topic is until the start of the event, then they have around 20 minutes to prepare a talk.

This repo contains the code for the spinning **Wheel of Talks™** used on the night.

## Live demo

Try it out at https://gilmoreorless.github.io/presentation-roulette/

Wheel spinning is initiated by clicking the big red button, or by pressing the <kbd>Space</kbd> or <kbd>Enter</kbd> keys.
An extra “preview” mode (a slow, constant spin) can be activated by pressing the down arrow (or <kbd>b</kbd>, due to the specifics of my presentation remote control).

## Caveats / warnings

This project was written entirely using Chrome DevTools’ “workspaces” feature, with the aim of using raw CSS and JS as much as possible.
The only external dependencies are a font and some sound effects.

However, because it was written for a one-off presentation to be run on a single machine (mine), it may not work perfectly for everyone.

This code is mainly provided as a reference for those who want to see how it was built, and **is not intended to be instantly-reusable in its current state**.

The JS code did start off quite small, but grew and grew as the scope crept ever onwards. The git history shows the evolution of the idea over the weeks leading up to the event.

## Credits

All code is © Gilmore Davidson under the [MIT licence](LICENSE).

Sound effects credits:

* Spinning wheel effect is © BBC via the [BBC Sound Effects archive](http://bbcsfx.acropolis.org.uk/?q=roulette+large) under the [RemArc Licence](https://github.com/bbcarchdev/Remarc/blob/master/doc/2016.09.27_RemArc_Content%20licence_Terms%20of%20Use_final.pdf) (the sound was then modified by me to fit the animation timing).
* Other sound effects come from [Freesound](https://freesound.org) under the [CC-Zero](https://creativecommons.org/publicdomain/zero/1.0/deed) licence.
