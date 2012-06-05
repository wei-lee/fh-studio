/*global Log, Properties, console 
 */
Log = {
  append: function (text, level) {
    level = level || 'DEBUG';
    if (Properties.logging_enabled && 'undefined' !== typeof console && Properties.logging[level]) {
      var log = new Date();
      console.log(log.toDateString() + ' : ' + log.toTimeString().substring(0, 8) + ' (' + level.toUpperCase() + ') ' + text);
    }
  }
};