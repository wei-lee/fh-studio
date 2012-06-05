/*
 * Utility functions for javascript object manipulation.
 * Accessible through the global variable 'js_util'
 */
/*global StringUtil
 */

StringUtil = function () {
  var self = {
    /*
     * Return a the word with the first letter in uppercase e.g. 'lowercase' becomes 'Lowercase'
     * The same word is returned if the first letter is already uppercase
     */
    capitalise: function (word) {
      return word.substring(0, 1).toUpperCase() + word.substring(1, word.length);
    },
    
    /*
     * Takes an array of words to be concatenated and camel cased
     * e.g. ['first', 'second'] returns 'FirstSecond' 
     */
    camelCase: function (word_array, first) {
      var camelised_word_array = [];
      for (var wi=0; wi<word_array.length; wi++) {
        camelised_word_array.push(js_util.capitalise(word_array[wi]));
      }
      return camelised_word_array.join('');
    },
    
    getFileExt: function (file_name) {
      if (file_name && typeof file_name === 'string') {
        return file_name.substring(file_name.lastIndexOf(".") + 1, file_name.length).toLowerCase();
      }
      return '';
    },
    
    isBinaryExt: function(file_name){
      var extension = self.getFileExt(file_name)
      if (extension === "jpg" || extension === "gif" || extension === "png" || extension === "jpeg" || extension === "jar" || extension === "swf") {
        return true;
      } else {
        return false;
      }
    },
    
    getFileNameFromPath: function(file_path){
        if(file_path && typeof file_path == "string"){
            if(file_path.lastIndexOf("/") != -1){
                return file_path.substring(file_path.lastIndexOf("/") + 1);
            } else if(file_path.lastIndexOf("\\") != -1){
                return file_path.substring(file_path.lastIndexOf("\\") + 1);
            } else {
                return file_path;
            }
        }
        return null;
    }
  };
  
  return {
    capitalise: self.capitalise,
    getFileExt: self.getFileExt,
    isBinaryExt: self.isBinaryExt,
    getFileNameFromPath: self.getFileNameFromPath,
    camelCase: self.camelCase
  };
};
// TODO: rename to string_util
var js_util = new StringUtil();