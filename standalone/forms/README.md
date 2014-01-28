#Using App Forms Standalone

##Opening using Mock Data
Build instructions are in fh-studio README.md (`grunt forms`).  
To run, 

1. [start Google Chrome with web security disabled](http://davfxx.wordpress.com/2012/08/22/how-to-disable-same-origin-policy-security-on-chrome/) - this is required so HTML template files can be inluded from iFrames in place of serverside includes, and to load static JSON as mock data to run the examples.
2. Open `index.html` in the web browser. 

## Embedding into an existing application
First, take note of the static vendor libraries required to run the UI - all of which are located in the 'vendor' directory, and included in the example index.html.

Also worth nothing is the mixins (`appforms.mixins.js`) required to polyfill some functionality needed to render the forms screens. 

Lastly, in a production environment iFrames cannot be used to include the static HTML template assets - they need to be included in the built HTML file, or included using serverside includes. 

## Communicating with the FeedHenry Forms API
To switch between mock and live data, see the bottom of `appforms.mixins.js`.

1. Update FH_APIURL to point to the Studio URL of your choice
2. Note comments `// This block for MOCK data` and `// This block for LIVE data`.
By default, the LIVE data block is commented out. To receive live data, comment out the block between the comments for MOCK, and remove the comments in the live section. 
To go back to receiving mock data, revert this change. 
