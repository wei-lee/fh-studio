Config = {
  app: {
    preview: {
      device: {
        'default': 'iphone_4',
        generic: {
          target: 'sandbox',
          width: 320,
          height: 480,
          ratio: '2:3',
          img_width: 381,
          img_height: 721,
          offsetx: 30,
          offsety: 89,
          mm_width: '62',
          mm_height: '115'
        },
        generic_noscale: {
          parent: 'generic',
          img_id: 'generic',
          noscale: true
        },
        generic_240_320: {
          target: 'sandbox',
          width: 240,
          height: 320,
          ratio: '3:4',
          img_width: 308,
          img_height: 599,
          offsetx: 33,
          offsety: 100,
          mm_width: '55',
          mm_height: '106'
        },
        generic_240_320_noscale: {
          parent: 'generic_240_320',
          img_id: 'generic_240_320',
          noscale: true
        },
        blank_320_480: {
          target: 'sandbox',
          width: 320,
          height: 480,
          ratio: '2:3',
          noscale: true
        },
        blank_240_320: {
          target: 'sandbox',
          width: 240,
          height: 320,
          ratio: '3:4',
          noscale: true
        },
        // iPad portrait size
        blank_768_1024: {
          target: 'sandbox',
          width: 768,
          height: 1024,
          ratio: '3:4',
          noscale: true
        },
        // iPad landscape size
        blank_1024_768: {
          target: 'sandbox',
          width: 1024,
          height: 768,
          ratio: '4:3',
          noscale: true
        },
        iphone_3_noscale: {
          parent: 'iphone_3',
          img_id: 'iphone_3',
          noscale: true
        },
        iphone_3: {
          target: 'iphone',
          width: 320,
          height: 480,
          ratio: '2:3',
          img_width: 384,
          img_height: 724,
          offsetx: 32,
          offsety: 120,
          mm_width: '62',
          mm_height: '115'
        },
        iphone_4_noscale: {
          parent: 'iphone_4',
          img_id: 'iphone_4',
          noscale: true
        },
        iphone_4: {
          target: 'iphone',
          width: 320,
          height: 480,
          ratio: '2:3', // 0.626631854
          img_width: 379, // 606 - 379
          img_height: 745, // 1189 - 745
          offsetx: 32, // 51 - 561 = 510
          offsety: 132, // 211 - 977 = 766
          mm_width: '60',
          mm_height: '118' // allow some extra width/height for buttons around edge
        },
        iphone_5_noscale: {
          parent: 'iphone_5',
          img_id: 'iphone_5',
          noscale: true
        },
        iphone_5: {
          target: 'iphone',
          width: 400,
          height: 710,
          ratio: '2:3', // 0.626631854
          img_width: 495, // 606 - 379
          img_height: 1024, // 1189 - 745
          offsetx: 47, // 51 - 561 = 510
          offsety: 160, // 211 - 977 = 766
          mm_width: '60',
          mm_height: '118' // allow some extra width/height for buttons around edge
        },
        ipad_noscale: {
          parent: 'ipad',
          img_id: 'ipad',
          noscale: true
        },
        ipad: {
          target: 'iphone',
          width: 1024,
          height: 768,
          ratio: '4:3', // 1141 - 114 
          img_width: 1256, //  1256 
          img_height: 967, // 967
          offsetx: 117, // 
          offsety: 101, // 
          mm_width: '243',
          mm_height: '190'
        },
        ipad_portrait_noscale: {
          parent: 'ipad_portrait',
          img_id: 'ipad_portrait',
          noscale: true
        },
        ipad_portrait: {
          target: 'iphone',
          width: 768,
          height: 1024,
          ratio: '3:4',  
          img_width: 967, 
          img_height: 1256,
          offsetx: 98,
          offsety: 117, 
          mm_width: '190',
          mm_height: '243'
        }
      },
      scale: true
    },
    destinations: [
      {'id':'iphone', 'name':'iPhone Application', 'source': true, 'binary': true, 'versions':['3.0']},
      {'id':'ipad', 'name':'iPad Application', 'source': true, 'binary': true},
      {'id':'ios', 'name':'iOS Universal Application', 'source': "true" === $fw.getClientProp("ios-universal-enabled"), 'binary': "true" === $fw.getClientProp("ios-universal-enabled")},
      {'id':'android', 'name':'Android Application', 'source': true, 'binary':true, 'versions':['1.5', '1.6', '2.0.1', '2.1']},
      {'id':'blackberry', 'name':'Blackberry', 'source': true, 'binary': "true" === $fw.getClientProp("blackberry-binary-enabled") ? true : false},
      {'id':'windowsphone7', 'name':'Windows Phone 7', 'source': true, 'binary': "true" === $fw.getClientProp("wp7-binary-enabled") ? true : false},
      {'id':'feedhenry', 'name':'Feedhenry', 'source': true, 'binary': false},
      {'id':'embed', 'name':'Embed', 'source': false, 'binary': true}
    ]
  }
};