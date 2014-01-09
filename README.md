fh-studio -- FeedHenry App Studio
=================================

Deploy to webapp dir (tomcat must be configured to point at webapp dir)
See https://sites.google.com/a/feedhenry.com/engineering/home/feedhenry-components/fh-studio

    ant deploy


jshint checking of javascript files (happens for deploy anyways):

    ant jshint

Add files to ignore in .jshintignore-src
Add/Remove jshint rules in .jshintrc
Add/Remove js globals in .jshintrc (predef array)

# Building Standalone Components
One standalone component exists at present, appforms. The build combines some standalone assets in the 'standalone' directory with the required studio JS, CSS and HTML template files. Vendor libraries required by appforms are also copied ('formsVendorLibs' in Gruntfile.js).
Output is in dist/forms, and to build, run:

    grunt forms