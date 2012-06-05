Version: https://github.com/ajaxorg/ace/commit/4b3dd3073e478108a95ad949029c7aea93d8e6c0

NOTE: 
Using the noconflict version to prevent 'require' and 'define' conflicts with jQuery

Modified the following files for loading workers statically
- mode-html-uncompressed-noconflict.js
- mode-css-uncompressed-noconflict.js
- mode-javascript-uncompressed-noconflict.js

These files reference a global workerMappings object defined in script_common.html

In addition, most of the ace editor files were modified where JSMin had trouble parsing them.