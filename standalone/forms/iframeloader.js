/*
  Allows loading of static HTML contents from an iFrame
  Only works with chrome started with web security disabled:
  http://davfxx.wordpress.com/2012/08/22/how-to-disable-same-origin-policy-security-on-chrome/
 */
var iFrameLoader = {
  load : function(cb){
    var iframes = $('iframe');
    iframes.each(function(index){
      (function(iframe, index, length){
        $(this).load(function(){
          var elements = $(iframe).contents().find('body').children();
          $('body').append(elements);
          if (index === length-1){
            cb();
          }
        });
      })(this, index, iframes.length);

    });
  }
};
