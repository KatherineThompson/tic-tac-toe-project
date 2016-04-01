# tic-tac-toe-project
A simple tic-tac-toe web app

## Technologies Used
* CSS
    * CSS3 animations
    * [Font Awesome](http://fortawesome.github.io/Font-Awesome/)
    * [Foundation](http://foundation.zurb.com/)    
    * [Sass](http://sass-lang.com/)
    
* HTML
    * Responsive mobile layout
    
* JavaScript ES2015
    * [Babel](https://babeljs.io/)
    * [jQuery](http://jquery.com/)
    * [JSHint](http://jshint.com/)
    * Local storage
    
## Features
* Implementation of tic-tac-toe game logic
* Saves games to local storage
* "Reset" button restores game board to original state
* "I'm feeling lucky" button lets AI choose the best space for the current player
* Randomly chooses starting player for each game

## What I learned
Two important objectives for this project were to increase my familiarity with the MVC pattern
and with new technologies. After working on this project, I feel very comfortable distinguishing
where in the MVC pattern different pieces of code fit. I also learned new strategies to allow the model, view, and
controller to interact with each other. Overall, I found the pattern to provide a useful organizational scheme although
there were times when it added quite a bit of complexity.

Previously, I had worked on becoming familiar with using vanilla JavaScript to accomplish everything so adding in
jQuery was great as it allowed me to more easily traverse the DOM and handle events. I learned to navigate the
docs and use features that were new to me, like selectors and chaining.

JSHint helped me to figure out what my most common errors are and has made me more aware of them. This is the
first time that I have had a build step and I like being able to use ES2015 without having to worry as much about
compatability. Babel has been very useful in accomplishing that.

Sass was invaluable when I was working on the mobile layout as it allowed me to more directly interact with Foundation.
Foundation on its own provided great tools for the web layout. Being able to use Sass to change the breakpoints,
among other things, was an exceedingly helpful combination. I found that I was using nested rules and mixins often
and enjoyed being able to do more complex things less tediously.

## Areas for Further Development
* AI should also check the opposing player's moves as it currently checks:
    * Can the current player win on this move?
    * Is there a space that will allow the current player to win on the next move?
* Adding multiplayer support for players who are not using the same device
* Saving games so they can be used across devices
* Supporting browsers without local storage
* Hover state may look awkward on some touch devices
* Potentially add tally marks to keep track of games won or tied
* Winning animation looks weird on firefox