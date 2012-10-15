(function (){
  if ('undefined' === typeof window.console) {
    window.console = {
      assert: function () {},
      error: function () {},
      info: function () {},
      log: function () {},
      warn: function () {}
    };
  }
})();

// Experimental below

// (function () {
//   var dummyConsole = {
//     assert: function () {},
//     count: function () {},
//     debug: function () {},
//     dir: function () {},
//     dirxml: function () {},
//     error: function () {},
//     group: function () {},
//     groupEnd: function () {},
//     info: function () {},
//     log: function () {},
//     markTimeline: function () {},
//     profile: function () {},
//     profileEnd: function () {},
//     time: function () {},
//     timeEnd: function () {},
//     trace: function () {},
//     warn: function () {}
//   };
//   if (typeof console === "undefined") {
//     window.console = dummyConsole;
//   } else {
//     // define console functions that don't exist
//     for (var key in dummyConsole) {
//       if (typeof dummyConsole[key] === 'function' && typeof window.console[key] !== 'function') {
//         window.console[key] = function () {};
//       }
//     }//   }

//   // test everything
//   console.assert(true, 'test assert');
//   console.count('test count');
//   console.debug('test debug');
//   console.dir(this);
//   console.dirxml(document);
//   console.error('test error');
//   console.group('test group');
//   console.log('test group log');
//   console.groupEnd('test group');
//   console.info('test info');
//   console.log('test log');
//   console.markTimeline();
//   console.profile('test profile start');
//   console.profileEnd('test profile end');
//   console.time('test time start');
//   console.timeEnd('test time end');
//   console.trace();
//   console.warn('test warn');


//   window.log = function () {};
// })();
