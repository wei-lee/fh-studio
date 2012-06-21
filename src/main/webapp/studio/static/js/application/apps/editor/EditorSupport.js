application.EditorSupport = Class.extend({
  
  init: function () {
    
  },
  
  normaliseString: function (string) {
    var tab = "";
    for (var i = 0; i < Properties.editor_indent_amount; i++){
      tab += " ";
    }
  
    string = string.replace(/\t/g, tab).replace(/\u00a0/g, " ").replace(/\r\n?/g, "\n");
    var pos = 0, parts = [], lines = string.split("\n");
    for (var line = 0; line < lines.length; line++) {
      if (line !== 0) parts.push("\n");
      parts.push(lines[line]);
    }
  
    return {
      next: function() {
        if (pos < parts.length) return parts[pos++];
        else throw StopIteration;
      }
    };
  }
});