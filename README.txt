fh-studio -- FeedHenry App Studio
=================================

# Deploy to webapp dir (tomcat must be configured to point at webapp dir)
#  See https://sites.google.com/a/feedhenry.com/engineering/home/feedhenry-components/fh-studio

ant deploy


# jshint checking of javascript files (happens for deploy anyways)
ant jshint

# Add files to ignore in .jshintignore-src
# Add/Remove jshint rules in .jshintrc
# Add/Remove js globals in .jshintrc (predef array)