(function () {
  "use strict";
  
  application.MetricsDataLocator = application.DataLocator.extend({
    
    sampledataEnabled: false,
     
    data: {
      appinstallsdest: {"sampleid":[{"_id":{"appid":"sampleid","ts":1309626001597},"value":{"iphone":50}}
      ,{"_id":{"appid":"sampleid","ts":1309712401597},"value":{"iphone":103}}
      ,{"_id":{"appid":"sampleid","ts":1309798801597},"value":{"iphone":167}}
      ,{"_id":{"appid":"sampleid","ts":1309885201597},"value":{"iphone":227}}
      ,{"_id":{"appid":"sampleid","ts":1309971601597},"value":{"iphone":255}}
      ,{"_id":{"appid":"sampleid","ts":1310058001597},"value":{"iphone":294}}
      ,{"_id":{"appid":"sampleid","ts":1310144401597},"value":{"iphone":369}}
      ,{"_id":{"appid":"sampleid","ts":1310230801597},"value":{"iphone":421}}
      ,{"_id":{"appid":"sampleid","ts":1310317201597},"value":{"iphone":486}}
      ,{"_id":{"appid":"sampleid","ts":1310403601597},"value":{"iphone":488}}
      ,{"_id":{"appid":"sampleid","ts":1310490001597},"value":{"iphone":526}}
      ,{"_id":{"appid":"sampleid","ts":1310576401597},"value":{"iphone":618}}
      ,{"_id":{"appid":"sampleid","ts":1310662801597},"value":{"iphone":631}}
      ,{"_id":{"appid":"sampleid","ts":1310749201597},"value":{"iphone":736}}
      ,{"_id":{"appid":"sampleid","ts":1310835601597},"value":{"iphone":752}}
      ,{"_id":{"appid":"sampleid","ts":1310922001597},"value":{"android":81,"iphone":857}}
      ,{"_id":{"appid":"sampleid","ts":1311008401597},"value":{"android":178,"iphone":920}}
      ,{"_id":{"appid":"sampleid","ts":1311094801597},"value":{"android":266,"iphone":1021}}
      ,{"_id":{"appid":"sampleid","ts":1311181201597},"value":{"android":299,"iphone":997}}
      ,{"_id":{"appid":"sampleid","ts":1311267601597},"value":{"android":387,"iphone":1029,"blackberry":43}}
      ,{"_id":{"appid":"sampleid","ts":1311354001597},"value":{"android":507,"iphone":1199,"blackberry":96}}
      ,{"_id":{"appid":"sampleid","ts":1311440401597},"value":{"android":549,"iphone":1094,"blackberry":130}}
      ,{"_id":{"appid":"sampleid","ts":1311526801597},"value":{"android":619,"iphone":1199,"blackberry":184}}
      ,{"_id":{"appid":"sampleid","ts":1311613201597},"value":{"android":823,"iphone":1115,"blackberry":218}}
      ,{"_id":{"appid":"sampleid","ts":1311699601597},"value":{"android":744,"iphone":1346,"blackberry":272}}
      ,{"_id":{"appid":"sampleid","ts":1311786001597},"value":{"android":930,"iphone":1326,"blackberry":319}}
      ,{"_id":{"appid":"sampleid","ts":1311872401597},"value":{"android":989,"iphone":1255,"blackberry":320}}
      ,{"_id":{"appid":"sampleid","ts":1311958801597},"value":{"android":1034,"iphone":1591,"blackberry":442}}
      ,{"_id":{"appid":"sampleid","ts":1312045201597},"value":{"android":1269,"iphone":1363,"blackberry":478}}
      ,{"_id":{"appid":"sampleid","ts":1312131601597},"value":{"android":1116,"iphone":1554,"blackberry":547}}
      ,{"_id":{"appid":"sampleid","ts":1312218001597},"value":{"android":1327,"iphone":1657,"blackberry":553}}
      ,{"_id":{"appid":"sampleid","ts":1312304401597},"value":{"android":1358,"iphone":1843,"blackberry":603,"wp7":96}}
      ,{"_id":{"appid":"sampleid","ts":1312390801597},"value":{"android":1436,"iphone":1609,"blackberry":612,"wp7":162}}
      ,{"_id":{"appid":"sampleid","ts":1312477201597},"value":{"android":1751,"iphone":1764,"blackberry":603,"wp7":261}}
      ,{"_id":{"appid":"sampleid","ts":1312563601597},"value":{"android":1850,"iphone":1769,"blackberry":712,"wp7":373}}
      ,{"_id":{"appid":"sampleid","ts":1312650001597},"value":{"android":1637,"iphone":1956,"blackberry":741,"wp7":395}}
      ,{"_id":{"appid":"sampleid","ts":1312736401597},"value":{"android":2031,"iphone":1723,"blackberry":889,"wp7":477}}
      ,{"_id":{"appid":"sampleid","ts":1312822801597},"value":{"android":2120,"iphone":2135,"blackberry":948,"wp7":639}}
      ,{"_id":{"appid":"sampleid","ts":1312909201597},"value":{"android":2033,"iphone":2227,"blackberry":839,"wp7":721}}
      ,{"_id":{"appid":"sampleid","ts":1312995601597},"value":{"android":2231,"iphone":1859,"blackberry":964,"wp7":840}}
      ,{"_id":{"appid":"sampleid","ts":1313082001597},"value":{"android":2202,"iphone":1929,"blackberry":1007,"wp7":792}}
      ,{"_id":{"appid":"sampleid","ts":1313168401597},"value":{"android":2230,"iphone":2196,"blackberry":1112,"wp7":931}}
      ,{"_id":{"appid":"sampleid","ts":1313254801597},"value":{"android":2546,"iphone":2319,"blackberry":1066,"wp7":1165}}
      ,{"_id":{"appid":"sampleid","ts":1313341201597},"value":{"android":2394,"iphone":2404,"blackberry":1188,"wp7":1282}}
      ,{"_id":{"appid":"sampleid","ts":1313427601597},"value":{"android":2753,"iphone":2153,"blackberry":1199,"wp7":1135}}
      ,{"_id":{"appid":"sampleid","ts":1313514001597},"value":{"android":2417,"iphone":2615,"blackberry":1140,"wp7":1325}}
      ,{"_id":{"appid":"sampleid","ts":1313600401597},"value":{"android":2485,"iphone":2366,"blackberry":1363,"wp7":1462}}
      ,{"_id":{"appid":"sampleid","ts":1313686801597},"value":{"android":2915,"iphone":2456,"blackberry":1394,"wp7":1499}}
      ,{"_id":{"appid":"sampleid","ts":1313773201597},"value":{"android":2622,"iphone":2272,"blackberry":1320,"wp7":1700}}
      ,{"_id":{"appid":"sampleid","ts":1313859601597},"value":{"android":2840,"iphone":2496,"blackberry":1344,"wp7":1667}}
      ,{"_id":{"appid":"sampleid","ts":1313946001597},"value":{"android":3080,"iphone":2749,"blackberry":1493,"wp7":1969}}
      ,{"_id":{"appid":"sampleid","ts":1314032401597},"value":{"android":2868,"iphone":2602,"blackberry":1648,"wp7":1720}}
      ,{"_id":{"appid":"sampleid","ts":1314118801597},"value":{"android":3334,"iphone":2584,"blackberry":1552,"wp7":1869}}
      ,{"_id":{"appid":"sampleid","ts":1314205201597},"value":{"android":3150,"iphone":2780,"blackberry":1620,"wp7":2072}}
      ,{"_id":{"appid":"sampleid","ts":1314291601597},"value":{"android":3215,"iphone":3011,"blackberry":1705,"wp7":1993}}
      ,{"_id":{"appid":"sampleid","ts":1314378001597},"value":{"android":3538,"iphone":3179,"blackberry":1742,"wp7":2112}}
      ,{"_id":{"appid":"sampleid","ts":1314464401597},"value":{"android":3271,"iphone":3201,"blackberry":1799,"wp7":2445}}
      ,{"_id":{"appid":"sampleid","ts":1314550801597},"value":{"android":3899,"iphone":3033,"blackberry":1672,"wp7":2623}}
      ,{"_id":{"appid":"sampleid","ts":1314637201597},"value":{"android":3660,"iphone":3242,"blackberry":1744,"wp7":2705}}
      ,{"_id":{"appid":"sampleid","ts":1314723601597},"value":{"android":3952,"iphone":3426,"blackberry":1875,"wp7":2403}}
      ,{"_id":{"appid":"sampleid","ts":1314810001597},"value":{"android":4081,"iphone":2841,"blackberry":1684,"wp7":2814}}
      ,{"_id":{"appid":"sampleid","ts":1314896401597},"value":{"android":3517,"iphone":3401,"blackberry":1755,"wp7":2619}}
      ,{"_id":{"appid":"sampleid","ts":1314982801597},"value":{"android":4275,"iphone":3521,"blackberry":1974,"wp7":2827}}
      ,{"_id":{"appid":"sampleid","ts":1315069201597},"value":{"android":4468,"iphone":3257,"blackberry":1845,"wp7":3248}}
      ,{"_id":{"appid":"sampleid","ts":1315155601597},"value":{"android":4493,"iphone":3166,"blackberry":2094,"wp7":3181}}
      ,{"_id":{"appid":"sampleid","ts":1315242001597},"value":{"android":4557,"iphone":3788,"blackberry":2316,"wp7":2922}}
      ,{"_id":{"appid":"sampleid","ts":1315328401597},"value":{"android":4118,"iphone":3754,"blackberry":2354,"wp7":3232}}
      ,{"_id":{"appid":"sampleid","ts":1315414801597},"value":{"android":4398,"iphone":3252,"blackberry":2242,"wp7":3523}}
      ,{"_id":{"appid":"sampleid","ts":1315501201597},"value":{"android":4372,"iphone":3623,"blackberry":2085,"wp7":3509}}]}
      ,
      appinstallsgeo: 
      
      {"sampleid":[{"_id":{"appid":"sampleid","ts":1309626001597},"value":{"Ireland":49,"United States":54}}
      ,{"_id":{"appid":"sampleid","ts":1309712401597},"value":{"Ireland":103,"United States":109}}
      ,{"_id":{"appid":"sampleid","ts":1309798801597},"value":{"Ireland":134,"United States":141}}
      ,{"_id":{"appid":"sampleid","ts":1309885201597},"value":{"Ireland":174,"United States":218}}
      ,{"_id":{"appid":"sampleid","ts":1309971601597},"value":{"Ireland":229,"United States":243}}
      ,{"_id":{"appid":"sampleid","ts":1310058001597},"value":{"Ireland":278,"United States":286,"United Kingdom":41,"Canada":20}}
      ,{"_id":{"appid":"sampleid","ts":1310144401597},"value":{"Ireland":337,"United States":394,"United Kingdom":76,"Canada":45}}
      ,{"_id":{"appid":"sampleid","ts":1310230801597},"value":{"Ireland":378,"United States":434,"United Kingdom":116,"Canada":63}}
      ,{"_id":{"appid":"sampleid","ts":1310317201597},"value":{"Ireland":419,"United States":485,"United Kingdom":161,"Canada":83}}
      ,{"_id":{"appid":"sampleid","ts":1310403601597},"value":{"Ireland":494,"United States":495,"United Kingdom":194,"Canada":123}}
      ,{"_id":{"appid":"sampleid","ts":1310490001597},"value":{"Ireland":558,"United States":597,"United Kingdom":252,"Canada":138}}
      ,{"_id":{"appid":"sampleid","ts":1310576401597},"value":{"Ireland":551,"United States":566,"United Kingdom":269,"Canada":151}}
      ,{"_id":{"appid":"sampleid","ts":1310662801597},"value":{"Ireland":634,"United States":742,"United Kingdom":322,"Canada":194}}
      ,{"_id":{"appid":"sampleid","ts":1310749201597},"value":{"Ireland":715,"United States":744,"United Kingdom":340,"Canada":180}}
      ,{"_id":{"appid":"sampleid","ts":1310835601597},"value":{"Ireland":682,"United States":833,"United Kingdom":383,"Canada":209}}
      ,{"_id":{"appid":"sampleid","ts":1310922001597},"value":{"Ireland":678,"United States":751,"United Kingdom":462,"Canada":240,"Spain":18}}
      ,{"_id":{"appid":"sampleid","ts":1311008401597},"value":{"Ireland":733,"United States":898,"United Kingdom":436,"Canada":264,"Spain":42}}
      ,{"_id":{"appid":"sampleid","ts":1311094801597},"value":{"Ireland":782,"United States":937,"United Kingdom":513,"Canada":269,"Spain":57}}
      ,{"_id":{"appid":"sampleid","ts":1311181201597},"value":{"Ireland":921,"United States":911,"United Kingdom":536,"Canada":340,"Spain":76}}
      ,{"_id":{"appid":"sampleid","ts":1311267601597},"value":{"Ireland":842,"United States":938,"United Kingdom":536,"Canada":349,"Spain":100}}
      ,{"_id":{"appid":"sampleid","ts":1311354001597},"value":{"Ireland":882,"United States":1146,"United Kingdom":648,"Canada":343,"Spain":114}}
      ,{"_id":{"appid":"sampleid","ts":1311440401597},"value":{"Ireland":985,"United States":1064,"United Kingdom":602,"Canada":349,"Spain":150}}
      ,{"_id":{"appid":"sampleid","ts":1311526801597},"value":{"Ireland":979,"United States":1251,"United Kingdom":767,"Canada":434,"Spain":156,"France":29}}
      ,{"_id":{"appid":"sampleid","ts":1311613201597},"value":{"Ireland":1023,"United States":1149,"United Kingdom":812,"Canada":381,"Spain":187,"France":65}}
      ,{"_id":{"appid":"sampleid","ts":1311699601597},"value":{"Ireland":1110,"United States":1192,"United Kingdom":823,"Canada":426,"Spain":192,"France":84}}
      ,{"_id":{"appid":"sampleid","ts":1311786001597},"value":{"Ireland":1193,"United States":1310,"United Kingdom":750,"Canada":477,"Spain":196,"France":125}}
      ,{"_id":{"appid":"sampleid","ts":1311872401597},"value":{"Ireland":1173,"United States":1350,"United Kingdom":780,"Canada":452,"Spain":231,"France":143}}
      ,{"_id":{"appid":"sampleid","ts":1311958801597},"value":{"Ireland":1296,"United States":1481,"United Kingdom":850,"Canada":536,"Spain":286,"France":173,"Germany":17}}
      ,{"_id":{"appid":"sampleid","ts":1312045201597},"value":{"Ireland":1385,"United States":1615,"United Kingdom":903,"Canada":514,"Spain":292,"France":224,"Germany":34}}
      ,{"_id":{"appid":"sampleid","ts":1312131601597},"value":{"Ireland":1376,"United States":1408,"United Kingdom":911,"Canada":598,"Spain":326,"France":243,"Germany":49}}
      ,{"_id":{"appid":"sampleid","ts":1312218001597},"value":{"Ireland":1528,"United States":1641,"United Kingdom":1057,"Canada":625,"Spain":330,"France":262,"Germany":74}}
      ,{"_id":{"appid":"sampleid","ts":1312304401597},"value":{"Ireland":1578,"United States":1612,"United Kingdom":1069,"Canada":640,"Spain":311,"France":321,"Germany":91,"Australia":42}}
      ,{"_id":{"appid":"sampleid","ts":1312390801597},"value":{"Ireland":1567,"United States":1546,"United Kingdom":1200,"Canada":599,"Spain":390,"France":324,"Germany":97,"Australia":93}}
      ,{"_id":{"appid":"sampleid","ts":1312477201597},"value":{"Ireland":1491,"United States":1863,"United Kingdom":1228,"Canada":617,"Spain":359,"France":358,"Germany":113,"Australia":144}}
      ,{"_id":{"appid":"sampleid","ts":1312563601597},"value":{"Ireland":1547,"United States":1670,"United Kingdom":1131,"Canada":739,"Spain":382,"France":360,"Germany":138,"Australia":171}}
      ,{"_id":{"appid":"sampleid","ts":1312650001597},"value":{"Ireland":1573,"United States":1987,"United Kingdom":1275,"Canada":735,"Spain":415,"France":459,"Germany":148,"Australia":259}}
      ,{"_id":{"appid":"sampleid","ts":1312736401597},"value":{"Ireland":1665,"United States":2056,"United Kingdom":1343,"Canada":699,"Spain":446,"France":417,"Germany":189,"Australia":296}}
      ,{"_id":{"appid":"sampleid","ts":1312822801597},"value":{"Ireland":1666,"United States":1995,"United Kingdom":1324,"Canada":701,"Spain":409,"France":484,"Germany":207,"Australia":352}}
      ,{"_id":{"appid":"sampleid","ts":1312909201597},"value":{"Ireland":1730,"United States":1994,"United Kingdom":1228,"Canada":775,"Spain":531,"France":466,"Germany":192,"Australia":367}}
      ,{"_id":{"appid":"sampleid","ts":1312995601597},"value":{"Ireland":1916,"United States":1991,"United Kingdom":1434,"Canada":846,"Spain":501,"France":593,"Germany":221,"Australia":429}}
      ,{"_id":{"appid":"sampleid","ts":1313082001597},"value":{"Ireland":1763,"United States":2290,"United Kingdom":1274,"Canada":825,"Spain":481,"France":602,"Germany":215,"Australia":521}}
      ,{"_id":{"appid":"sampleid","ts":1313168401597},"value":{"Ireland":1973,"United States":2078,"United Kingdom":1483,"Canada":740,"Spain":593,"France":611,"Germany":284,"Australia":551,"China":80}}
      ,{"_id":{"appid":"sampleid","ts":1313254801597},"value":{"Ireland":2030,"United States":2406,"United Kingdom":1548,"Canada":864,"Spain":573,"France":635,"Germany":262,"Australia":518,"China":147}}
      ,{"_id":{"appid":"sampleid","ts":1313341201597},"value":{"Ireland":2203,"United States":2182,"United Kingdom":1392,"Canada":940,"Spain":634,"France":641,"Germany":303,"Australia":661,"China":242}}
      ,{"_id":{"appid":"sampleid","ts":1313427601597},"value":{"Ireland":1936,"United States":2438,"United Kingdom":1696,"Canada":809,"Spain":583,"France":769,"Germany":334,"Australia":688,"China":277}}
      ,{"_id":{"appid":"sampleid","ts":1313514001597},"value":{"Ireland":2359,"United States":2347,"United Kingdom":1560,"Canada":837,"Spain":602,"France":764,"Germany":323,"Australia":702,"China":342}}
      ,{"_id":{"appid":"sampleid","ts":1313600401597},"value":{"Ireland":2262,"United States":2297,"United Kingdom":1679,"Canada":1018,"Spain":625,"France":729,"Germany":330,"Australia":824,"China":491}}
      ,{"_id":{"appid":"sampleid","ts":1313686801597},"value":{"Ireland":2117,"United States":2342,"United Kingdom":1801,"Canada":1057,"Spain":682,"France":805,"Germany":397,"Australia":766,"China":537}}
      ,{"_id":{"appid":"sampleid","ts":1313773201597},"value":{"Ireland":2377,"United States":2529,"United Kingdom":1646,"Canada":905,"Spain":743,"France":856,"Germany":342,"Australia":827,"China":641}}
      ,{"_id":{"appid":"sampleid","ts":1313859601597},"value":{"Ireland":2369,"United States":2717,"United Kingdom":1798,"Canada":1122,"Spain":624,"France":829,"Germany":374,"Australia":914,"China":729,"Russia":54}}
      ,{"_id":{"appid":"sampleid","ts":1313946001597},"value":{"Ireland":2639,"United States":2639,"United Kingdom":1657,"Canada":1031,"Spain":796,"France":879,"Germany":438,"Australia":999,"China":754,"Russia":98}}
      ,{"_id":{"appid":"sampleid","ts":1314032401597},"value":{"Ireland":2201,"United States":2555,"United Kingdom":1855,"Canada":1119,"Spain":807,"France":825,"Germany":434,"Australia":1051,"China":819,"Russia":165}}
      ,{"_id":{"appid":"sampleid","ts":1314118801597},"value":{"Ireland":2478,"United States":2572,"United Kingdom":1996,"Canada":1078,"Spain":770,"France":981,"Germany":479,"Australia":1077,"China":879,"Russia":238}}
      ,{"_id":{"appid":"sampleid","ts":1314205201597},"value":{"Ireland":2590,"United States":2508,"United Kingdom":2024,"Canada":1076,"Spain":802,"France":961,"Germany":486,"Australia":1032,"China":1089,"Russia":245}}
      ,{"_id":{"appid":"sampleid","ts":1314291601597},"value":{"Ireland":2490,"United States":2865,"United Kingdom":1951,"Canada":1123,"Spain":764,"France":907,"Germany":449,"Australia":1215,"China":1002,"Russia":327}}
      ,{"_id":{"appid":"sampleid","ts":1314378001597},"value":{"Ireland":2792,"United States":2831,"United Kingdom":2079,"Canada":1112,"Spain":883,"France":932,"Germany":442,"Australia":1130,"China":1114,"Russia":411}}
      ,{"_id":{"appid":"sampleid","ts":1314464401597},"value":{"Ireland":2899,"United States":3045,"United Kingdom":1908,"Canada":1113,"Spain":832,"France":1190,"Germany":507,"Australia":1104,"China":1262,"Russia":413}}
      ,{"_id":{"appid":"sampleid","ts":1314550801597},"value":{"Ireland":2628,"United States":3033,"United Kingdom":2104,"Canada":1323,"Spain":807,"France":983,"Germany":541,"Australia":1287,"China":1190,"Russia":538}}
      ,{"_id":{"appid":"sampleid","ts":1314637201597},"value":{"Ireland":2930,"United States":2816,"United Kingdom":2090,"Canada":1080,"Spain":818,"France":1181,"Germany":522,"Australia":1305,"China":1329,"Russia":578}}
      ,{"_id":{"appid":"sampleid","ts":1314723601597},"value":{"Ireland":3103,"United States":3328,"United Kingdom":1964,"Canada":1305,"Spain":943,"France":1132,"Germany":532,"Australia":1495,"China":1347,"Russia":631}}
      ,{"_id":{"appid":"sampleid","ts":1314810001597},"value":{"Ireland":2666,"United States":3058,"United Kingdom":2309,"Canada":1244,"Spain":913,"France":1268,"Germany":549,"Australia":1521,"China":1586,"Russia":665}}
      ,{"_id":{"appid":"sampleid","ts":1314896401597},"value":{"Ireland":2964,"United States":3346,"United Kingdom":2419,"Canada":1260,"Spain":965,"France":1191,"Germany":630,"Australia":1334,"China":1474,"Russia":634}}
      ,{"_id":{"appid":"sampleid","ts":1314982801597},"value":{"Ireland":2844,"United States":3190,"United Kingdom":2418,"Canada":1198,"Spain":993,"France":1297,"Germany":589,"Australia":1563,"China":1731,"Russia":833}}
      ,{"_id":{"appid":"sampleid","ts":1315069201597},"value":{"Ireland":3227,"United States":3699,"United Kingdom":2240,"Canada":1401,"Spain":892,"France":1322,"Germany":652,"Australia":1452,"China":1755,"Russia":768}}
      ,{"_id":{"appid":"sampleid","ts":1315155601597},"value":{"Ireland":3159,"United States":3332,"United Kingdom":2342,"Canada":1352,"Spain":1109,"France":1397,"Germany":605,"Australia":1503,"China":1980,"Russia":819}}
      ,{"_id":{"appid":"sampleid","ts":1315242001597},"value":{"Ireland":2947,"United States":3583,"United Kingdom":2552,"Canada":1479,"Spain":1053,"France":1452,"Germany":603,"Australia":1592,"China":1791,"Russia":1019}}
      ,{"_id":{"appid":"sampleid","ts":1315328401597},"value":{"Ireland":3396,"United States":3661,"United Kingdom":2659,"Canada":1325,"Spain":1093,"France":1471,"Germany":672,"Australia":1722,"China":2178,"Russia":885}}
      ,{"_id":{"appid":"sampleid","ts":1315414801597},"value":{"Ireland":3163,"United States":3889,"United Kingdom":2560,"Canada":1411,"Spain":1133,"France":1468,"Germany":725,"Australia":1692,"China":2170,"Russia":1074}}
      ,{"_id":{"appid":"sampleid","ts":1315501201597},"value":{"Ireland":3354,"United States":3707,"United Kingdom":2438,"Canada":1432,"Spain":1183,"France":1514,"Germany":753,"Australia":1768,"China":2119,"Russia":1057}}]}
      ,
      
      appstartupsdest: 
      {"sampleid":[{"_id":{"appid":"sampleid","ts":1309626001597},"value":{"iphone":75}}
      ,{"_id":{"appid":"sampleid","ts":1309712401597},"value":{"iphone":149}}
      ,{"_id":{"appid":"sampleid","ts":1309798801597},"value":{"iphone":240}}
      ,{"_id":{"appid":"sampleid","ts":1309885201597},"value":{"iphone":342}}
      ,{"_id":{"appid":"sampleid","ts":1309971601597},"value":{"iphone":383}}
      ,{"_id":{"appid":"sampleid","ts":1310058001597},"value":{"iphone":497}}
      ,{"_id":{"appid":"sampleid","ts":1310144401597},"value":{"iphone":584}}
      ,{"_id":{"appid":"sampleid","ts":1310230801597},"value":{"iphone":643}}
      ,{"_id":{"appid":"sampleid","ts":1310317201597},"value":{"iphone":805}}
      ,{"_id":{"appid":"sampleid","ts":1310403601597},"value":{"iphone":882}}
      ,{"_id":{"appid":"sampleid","ts":1310490001597},"value":{"iphone":975}}
      ,{"_id":{"appid":"sampleid","ts":1310576401597},"value":{"iphone":1024}}
      ,{"_id":{"appid":"sampleid","ts":1310662801597},"value":{"iphone":990}}
      ,{"_id":{"appid":"sampleid","ts":1310749201597},"value":{"iphone":1152}}
      ,{"_id":{"appid":"sampleid","ts":1310835601597},"value":{"iphone":1308}}
      ,{"_id":{"appid":"sampleid","ts":1310922001597},"value":{"android":144,"iphone":1224}}
      ,{"_id":{"appid":"sampleid","ts":1311008401597},"value":{"android":295,"iphone":1544}}
      ,{"_id":{"appid":"sampleid","ts":1311094801597},"value":{"android":415,"iphone":1520}}
      ,{"_id":{"appid":"sampleid","ts":1311181201597},"value":{"android":479,"iphone":1517}}
      ,{"_id":{"appid":"sampleid","ts":1311267601597},"value":{"android":619,"iphone":1568,"blackberry":70}}
      ,{"_id":{"appid":"sampleid","ts":1311354001597},"value":{"android":718,"iphone":1706,"blackberry":147}}
      ,{"_id":{"appid":"sampleid","ts":1311440401597},"value":{"android":860,"iphone":2024,"blackberry":230}}
      ,{"_id":{"appid":"sampleid","ts":1311526801597},"value":{"android":1119,"iphone":2116,"blackberry":301}}
      ,{"_id":{"appid":"sampleid","ts":1311613201597},"value":{"android":1117,"iphone":2203,"blackberry":326}}
      ,{"_id":{"appid":"sampleid","ts":1311699601597},"value":{"android":1365,"iphone":2277,"blackberry":404}}
      ,{"_id":{"appid":"sampleid","ts":1311786001597},"value":{"android":1359,"iphone":2309,"blackberry":534}}
      ,{"_id":{"appid":"sampleid","ts":1311872401597},"value":{"android":1536,"iphone":2109,"blackberry":583}}
      ,{"_id":{"appid":"sampleid","ts":1311958801597},"value":{"android":1586,"iphone":2280,"blackberry":599}}
      ,{"_id":{"appid":"sampleid","ts":1312045201597},"value":{"android":2012,"iphone":2449,"blackberry":735}}
      ,{"_id":{"appid":"sampleid","ts":1312131601597},"value":{"android":1848,"iphone":2450,"blackberry":808}}
      ,{"_id":{"appid":"sampleid","ts":1312218001597},"value":{"android":2283,"iphone":2312,"blackberry":930}}
      ,{"_id":{"appid":"sampleid","ts":1312304401597},"value":{"android":2362,"iphone":2391,"blackberry":1008,"wp7":129}}
      ,{"_id":{"appid":"sampleid","ts":1312390801597},"value":{"android":2579,"iphone":2756,"blackberry":901,"wp7":260}}
      ,{"_id":{"appid":"sampleid","ts":1312477201597},"value":{"android":2303,"iphone":3147,"blackberry":978,"wp7":431}}
      ,{"_id":{"appid":"sampleid","ts":1312563601597},"value":{"android":2687,"iphone":2847,"blackberry":1039,"wp7":616}}
      ,{"_id":{"appid":"sampleid","ts":1312650001597},"value":{"android":2694,"iphone":2870,"blackberry":1304,"wp7":695}}
      ,{"_id":{"appid":"sampleid","ts":1312736401597},"value":{"android":2751,"iphone":2848,"blackberry":1386,"wp7":905}}
      ,{"_id":{"appid":"sampleid","ts":1312822801597},"value":{"android":3119,"iphone":3219,"blackberry":1513,"wp7":1000}}
      ,{"_id":{"appid":"sampleid","ts":1312909201597},"value":{"android":3476,"iphone":3030,"blackberry":1348,"wp7":1100}}
      ,{"_id":{"appid":"sampleid","ts":1312995601597},"value":{"android":3676,"iphone":3052,"blackberry":1344,"wp7":1205}}
      ,{"_id":{"appid":"sampleid","ts":1313082001597},"value":{"android":3805,"iphone":3427,"blackberry":1409,"wp7":1337}}
      ,{"_id":{"appid":"sampleid","ts":1313168401597},"value":{"android":3449,"iphone":3676,"blackberry":1492,"wp7":1654}}
      ,{"_id":{"appid":"sampleid","ts":1313254801597},"value":{"android":3808,"iphone":3936,"blackberry":1723,"wp7":1729}}
      ,{"_id":{"appid":"sampleid","ts":1313341201597},"value":{"android":3836,"iphone":3284,"blackberry":1632,"wp7":1868}}
      ,{"_id":{"appid":"sampleid","ts":1313427601597},"value":{"android":4384,"iphone":4066,"blackberry":1980,"wp7":2079}}
      ,{"_id":{"appid":"sampleid","ts":1313514001597},"value":{"android":3776,"iphone":3844,"blackberry":1771,"wp7":2320}}
      ,{"_id":{"appid":"sampleid","ts":1313600401597},"value":{"android":4008,"iphone":3880,"blackberry":2154,"wp7":2307}}
      ,{"_id":{"appid":"sampleid","ts":1313686801597},"value":{"android":4594,"iphone":3674,"blackberry":1930,"wp7":2224}}
      ,{"_id":{"appid":"sampleid","ts":1313773201597},"value":{"android":4697,"iphone":3852,"blackberry":2084,"wp7":2563}}
      ,{"_id":{"appid":"sampleid","ts":1313859601597},"value":{"android":4195,"iphone":4080,"blackberry":2246,"wp7":2911}}
      ,{"_id":{"appid":"sampleid","ts":1313946001597},"value":{"android":4356,"iphone":4496,"blackberry":2377,"wp7":2800}}
      ,{"_id":{"appid":"sampleid","ts":1314032401597},"value":{"android":4799,"iphone":4044,"blackberry":2262,"wp7":2889}}
      ,{"_id":{"appid":"sampleid","ts":1314118801597},"value":{"android":4936,"iphone":4682,"blackberry":2408,"wp7":3444}}
      ,{"_id":{"appid":"sampleid","ts":1314205201597},"value":{"android":5315,"iphone":4554,"blackberry":2665,"wp7":3226}}
      ,{"_id":{"appid":"sampleid","ts":1314291601597},"value":{"android":5741,"iphone":4285,"blackberry":2472,"wp7":3130}}
      ,{"_id":{"appid":"sampleid","ts":1314378001597},"value":{"android":5510,"iphone":5009,"blackberry":2701,"wp7":3735}}
      ,{"_id":{"appid":"sampleid","ts":1314464401597},"value":{"android":5513,"iphone":5155,"blackberry":3033,"wp7":3668}}
      ,{"_id":{"appid":"sampleid","ts":1314550801597},"value":{"android":5193,"iphone":4823,"blackberry":2819,"wp7":3500}}
      ,{"_id":{"appid":"sampleid","ts":1314637201597},"value":{"android":5512,"iphone":4949,"blackberry":3027,"wp7":3984}}
      ,{"_id":{"appid":"sampleid","ts":1314723601597},"value":{"android":5613,"iphone":5393,"blackberry":2990,"wp7":4556}}
      ,{"_id":{"appid":"sampleid","ts":1314810001597},"value":{"android":6306,"iphone":5557,"blackberry":2892,"wp7":4390}}
      ,{"_id":{"appid":"sampleid","ts":1314896401597},"value":{"android":6770,"iphone":5074,"blackberry":2761,"wp7":3916}}
      ,{"_id":{"appid":"sampleid","ts":1314982801597},"value":{"android":5786,"iphone":5106,"blackberry":2836,"wp7":4278}}
      ,{"_id":{"appid":"sampleid","ts":1315069201597},"value":{"android":5952,"iphone":5577,"blackberry":2926,"wp7":5084}}
      ,{"_id":{"appid":"sampleid","ts":1315155601597},"value":{"android":7015,"iphone":5771,"blackberry":3159,"wp7":5230}}
      ,{"_id":{"appid":"sampleid","ts":1315242001597},"value":{"android":6308,"iphone":4943,"blackberry":3100,"wp7":5036}}
      ,{"_id":{"appid":"sampleid","ts":1315328401597},"value":{"android":6714,"iphone":6194,"blackberry":3227,"wp7":5638}}
      ,{"_id":{"appid":"sampleid","ts":1315414801597},"value":{"android":6286,"iphone":5100,"blackberry":3619,"wp7":5522}}
      ,{"_id":{"appid":"sampleid","ts":1315501201597},"value":{"android":6474,"iphone":6229,"blackberry":3634,"wp7":5493}}]}
        ,
      appstartupsgeo: 
        
      {"sampleid":[{"_id":{"appid":"sampleid","ts":1309626001597},"value":{"Ireland":86,"United States":97}}
      ,{"_id":{"appid":"sampleid","ts":1309712401597},"value":{"Ireland":181,"United States":173}}
      ,{"_id":{"appid":"sampleid","ts":1309798801597},"value":{"Ireland":236,"United States":247}}
      ,{"_id":{"appid":"sampleid","ts":1309885201597},"value":{"Ireland":334,"United States":399}}
      ,{"_id":{"appid":"sampleid","ts":1309971601597},"value":{"Ireland":401,"United States":459}}
      ,{"_id":{"appid":"sampleid","ts":1310058001597},"value":{"Ireland":523,"United States":589,"United Kingdom":60,"Canada":36}}
      ,{"_id":{"appid":"sampleid","ts":1310144401597},"value":{"Ireland":569,"United States":603,"United Kingdom":143,"Canada":86}}
      ,{"_id":{"appid":"sampleid","ts":1310230801597},"value":{"Ireland":607,"United States":659,"United Kingdom":221,"Canada":129}}
      ,{"_id":{"appid":"sampleid","ts":1310317201597},"value":{"Ireland":771,"United States":813,"United Kingdom":287,"Canada":142}}
      ,{"_id":{"appid":"sampleid","ts":1310403601597},"value":{"Ireland":849,"United States":860,"United Kingdom":356,"Canada":190}}
      ,{"_id":{"appid":"sampleid","ts":1310490001597},"value":{"Ireland":938,"United States":1091,"United Kingdom":432,"Canada":261}}
      ,{"_id":{"appid":"sampleid","ts":1310576401597},"value":{"Ireland":901,"United States":1204,"United Kingdom":531,"Canada":269}}
      ,{"_id":{"appid":"sampleid","ts":1310662801597},"value":{"Ireland":1036,"United States":1211,"United Kingdom":493,"Canada":326}}
      ,{"_id":{"appid":"sampleid","ts":1310749201597},"value":{"Ireland":1231,"United States":1150,"United Kingdom":681,"Canada":365}}
      ,{"_id":{"appid":"sampleid","ts":1310835601597},"value":{"Ireland":1170,"United States":1465,"United Kingdom":707,"Canada":431}}
      ,{"_id":{"appid":"sampleid","ts":1310922001597},"value":{"Ireland":1370,"United States":1456,"United Kingdom":762,"Canada":466,"Spain":37}}
      ,{"_id":{"appid":"sampleid","ts":1311008401597},"value":{"Ireland":1525,"United States":1467,"United Kingdom":832,"Canada":500,"Spain":76}}
      ,{"_id":{"appid":"sampleid","ts":1311094801597},"value":{"Ireland":1330,"United States":1585,"United Kingdom":809,"Canada":481,"Spain":108}}
      ,{"_id":{"appid":"sampleid","ts":1311181201597},"value":{"Ireland":1537,"United States":1800,"United Kingdom":1054,"Canada":611,"Spain":131}}
      ,{"_id":{"appid":"sampleid","ts":1311267601597},"value":{"Ireland":1516,"United States":1671,"United Kingdom":925,"Canada":549,"Spain":190}}
      ,{"_id":{"appid":"sampleid","ts":1311354001597},"value":{"Ireland":1554,"United States":2036,"United Kingdom":1000,"Canada":602,"Spain":189}}
      ,{"_id":{"appid":"sampleid","ts":1311440401597},"value":{"Ireland":1729,"United States":2003,"United Kingdom":1195,"Canada":686,"Spain":217}}
      ,{"_id":{"appid":"sampleid","ts":1311526801597},"value":{"Ireland":1762,"United States":1954,"United Kingdom":1336,"Canada":723,"Spain":288,"France":54}}
      ,{"_id":{"appid":"sampleid","ts":1311613201597},"value":{"Ireland":2056,"United States":2363,"United Kingdom":1314,"Canada":785,"Spain":285,"France":111}}
      ,{"_id":{"appid":"sampleid","ts":1311699601597},"value":{"Ireland":1946,"United States":2204,"United Kingdom":1306,"Canada":831,"Spain":368,"France":146}}
      ,{"_id":{"appid":"sampleid","ts":1311786001597},"value":{"Ireland":2096,"United States":2634,"United Kingdom":1575,"Canada":790,"Spain":397,"France":190}}
      ,{"_id":{"appid":"sampleid","ts":1311872401597},"value":{"Ireland":2354,"United States":2227,"United Kingdom":1554,"Canada":906,"Spain":444,"France":269}}
      ,{"_id":{"appid":"sampleid","ts":1311958801597},"value":{"Ireland":2151,"United States":2291,"United Kingdom":1476,"Canada":962,"Spain":496,"France":335,"Germany":31}}
      ,{"_id":{"appid":"sampleid","ts":1312045201597},"value":{"Ireland":2164,"United States":2769,"United Kingdom":1744,"Canada":908,"Spain":466,"France":414,"Germany":59}}
      ,{"_id":{"appid":"sampleid","ts":1312131601597},"value":{"Ireland":2198,"United States":2676,"United Kingdom":1686,"Canada":949,"Spain":494,"France":388,"Germany":93}}
      ,{"_id":{"appid":"sampleid","ts":1312218001597},"value":{"Ireland":2768,"United States":3027,"United Kingdom":1630,"Canada":931,"Spain":586,"France":489,"Germany":115}}
      ,{"_id":{"appid":"sampleid","ts":1312304401597},"value":{"Ireland":2343,"United States":2714,"United Kingdom":1918,"Canada":1158,"Spain":545,"France":518,"Germany":157,"Australia":87}}
      ,{"_id":{"appid":"sampleid","ts":1312390801597},"value":{"Ireland":2547,"United States":3199,"United Kingdom":1859,"Canada":1135,"Spain":634,"France":548,"Germany":167,"Australia":151}}
      ,{"_id":{"appid":"sampleid","ts":1312477201597},"value":{"Ireland":2724,"United States":3296,"United Kingdom":1909,"Canada":1247,"Spain":726,"France":686,"Germany":227,"Australia":222}}
      ,{"_id":{"appid":"sampleid","ts":1312563601597},"value":{"Ireland":2556,"United States":3226,"United Kingdom":2031,"Canada":1181,"Spain":740,"France":620,"Germany":251,"Australia":315}}
      ,{"_id":{"appid":"sampleid","ts":1312650001597},"value":{"Ireland":2813,"United States":3649,"United Kingdom":2131,"Canada":1100,"Spain":660,"France":761,"Germany":261,"Australia":443}}
      ,{"_id":{"appid":"sampleid","ts":1312736401597},"value":{"Ireland":2956,"United States":3491,"United Kingdom":2180,"Canada":1233,"Spain":752,"France":854,"Germany":291,"Australia":497}}
      ,{"_id":{"appid":"sampleid","ts":1312822801597},"value":{"Ireland":3000,"United States":3730,"United Kingdom":2387,"Canada":1174,"Spain":728,"France":769,"Germany":335,"Australia":562}}
      ,{"_id":{"appid":"sampleid","ts":1312909201597},"value":{"Ireland":3471,"United States":3287,"United Kingdom":2483,"Canada":1239,"Spain":850,"France":997,"Germany":373,"Australia":628}}
      ,{"_id":{"appid":"sampleid","ts":1312995601597},"value":{"Ireland":3051,"United States":3261,"United Kingdom":2224,"Canada":1501,"Spain":929,"France":934,"Germany":356,"Australia":725}}
      ,{"_id":{"appid":"sampleid","ts":1313082001597},"value":{"Ireland":3733,"United States":3560,"United Kingdom":2677,"Canada":1463,"Spain":933,"France":1083,"Germany":420,"Australia":758}}
      ,{"_id":{"appid":"sampleid","ts":1313168401597},"value":{"Ireland":3201,"United States":3629,"United Kingdom":2274,"Canada":1407,"Spain":876,"France":1084,"Germany":472,"Australia":983,"China":128}}
      ,{"_id":{"appid":"sampleid","ts":1313254801597},"value":{"Ireland":3848,"United States":3944,"United Kingdom":2510,"Canada":1492,"Spain":1068,"France":1243,"Germany":519,"Australia":931,"China":239}}
      ,{"_id":{"appid":"sampleid","ts":1313341201597},"value":{"Ireland":3616,"United States":3743,"United Kingdom":2921,"Canada":1674,"Spain":975,"France":1166,"Germany":466,"Australia":1109,"China":392}}
      ,{"_id":{"appid":"sampleid","ts":1313427601597},"value":{"Ireland":4001,"United States":4352,"United Kingdom":2517,"Canada":1702,"Spain":1050,"France":1162,"Germany":565,"Australia":1081,"China":514}}
      ,{"_id":{"appid":"sampleid","ts":1313514001597},"value":{"Ireland":4068,"United States":4360,"United Kingdom":2718,"Canada":1668,"Spain":1203,"France":1402,"Germany":551,"Australia":1363,"China":671}}
      ,{"_id":{"appid":"sampleid","ts":1313600401597},"value":{"Ireland":3611,"United States":4299,"United Kingdom":2688,"Canada":1667,"Spain":1234,"France":1205,"Germany":574,"Australia":1335,"China":784}}
      ,{"_id":{"appid":"sampleid","ts":1313686801597},"value":{"Ireland":3908,"United States":3910,"United Kingdom":3259,"Canada":1565,"Spain":1248,"France":1443,"Germany":563,"Australia":1456,"China":866}}
      ,{"_id":{"appid":"sampleid","ts":1313773201597},"value":{"Ireland":4081,"United States":4334,"United Kingdom":3178,"Canada":1788,"Spain":1180,"France":1498,"Germany":674,"Australia":1648,"China":1065}}
      ,{"_id":{"appid":"sampleid","ts":1313859601597},"value":{"Ireland":4191,"United States":4129,"United Kingdom":3267,"Canada":1794,"Spain":1247,"France":1511,"Germany":732,"Australia":1560,"China":1111,"Russia":98}}
      ,{"_id":{"appid":"sampleid","ts":1313946001597},"value":{"Ireland":4623,"United States":5102,"United Kingdom":2876,"Canada":1985,"Spain":1276,"France":1611,"Germany":749,"Australia":1775,"China":1447,"Russia":183}}
      ,{"_id":{"appid":"sampleid","ts":1314032401597},"value":{"Ireland":4630,"United States":4464,"United Kingdom":3377,"Canada":2007,"Spain":1352,"France":1655,"Germany":755,"Australia":1838,"China":1471,"Russia":288}}
      ,{"_id":{"appid":"sampleid","ts":1314118801597},"value":{"Ireland":4003,"United States":4725,"United Kingdom":3667,"Canada":1837,"Spain":1313,"France":1551,"Germany":758,"Australia":1911,"China":1545,"Russia":377}}
      ,{"_id":{"appid":"sampleid","ts":1314205201597},"value":{"Ireland":4875,"United States":4410,"United Kingdom":3554,"Canada":1844,"Spain":1406,"France":1573,"Germany":737,"Australia":1702,"China":1821,"Russia":501}}
      ,{"_id":{"appid":"sampleid","ts":1314291601597},"value":{"Ireland":4021,"United States":4502,"United Kingdom":3790,"Canada":1893,"Spain":1360,"France":1600,"Germany":799,"Australia":1964,"China":1731,"Russia":611}}
      ,{"_id":{"appid":"sampleid","ts":1314378001597},"value":{"Ireland":4960,"United States":4677,"United Kingdom":3135,"Canada":1928,"Spain":1537,"France":1726,"Germany":960,"Australia":2205,"China":1978,"Russia":662}}
      ,{"_id":{"appid":"sampleid","ts":1314464401597},"value":{"Ireland":4391,"United States":5121,"United Kingdom":3784,"Canada":1850,"Spain":1511,"France":1890,"Germany":913,"Australia":2188,"China":2362,"Russia":798}}
      ,{"_id":{"appid":"sampleid","ts":1314550801597},"value":{"Ireland":4408,"United States":5204,"United Kingdom":3623,"Canada":2292,"Spain":1563,"France":1914,"Germany":992,"Australia":2006,"China":2544,"Russia":846}}
      ,{"_id":{"appid":"sampleid","ts":1314637201597},"value":{"Ireland":4813,"United States":5236,"United Kingdom":4068,"Canada":2257,"Spain":1636,"France":1902,"Germany":1038,"Australia":2328,"China":2291,"Russia":931}}
      ,{"_id":{"appid":"sampleid","ts":1314723601597},"value":{"Ireland":5179,"United States":5771,"United Kingdom":3654,"Canada":2232,"Spain":1406,"France":2182,"Germany":1075,"Australia":2577,"China":2596,"Russia":1128}}
      ,{"_id":{"appid":"sampleid","ts":1314810001597},"value":{"Ireland":4616,"United States":5162,"United Kingdom":3693,"Canada":2128,"Spain":1554,"France":1944,"Germany":1094,"Australia":2525,"China":2671,"Russia":1065}}
      ,{"_id":{"appid":"sampleid","ts":1314896401597},"value":{"Ireland":5617,"United States":5902,"United Kingdom":3971,"Canada":2297,"Spain":1532,"France":2189,"Germany":942,"Australia":2313,"China":3018,"Russia":1198}}
      ,{"_id":{"appid":"sampleid","ts":1314982801597},"value":{"Ireland":5357,"United States":6028,"United Kingdom":4138,"Canada":2264,"Spain":1800,"France":1957,"Germany":971,"Australia":2631,"China":2921,"Russia":1354}}
      ,{"_id":{"appid":"sampleid","ts":1315069201597},"value":{"Ireland":5744,"United States":5871,"United Kingdom":4253,"Canada":2525,"Spain":1569,"France":2122,"Germany":1077,"Australia":2602,"China":3039,"Russia":1435}}
      ,{"_id":{"appid":"sampleid","ts":1315155601597},"value":{"Ireland":5596,"United States":6288,"United Kingdom":4592,"Canada":2380,"Spain":1709,"France":2119,"Germany":1075,"Australia":2806,"China":3191,"Russia":1430}}
      ,{"_id":{"appid":"sampleid","ts":1315242001597},"value":{"Ireland":5053,"United States":6520,"United Kingdom":4535,"Canada":2439,"Spain":1741,"France":2610,"Germany":1103,"Australia":3211,"China":3257,"Russia":1768}}
      ,{"_id":{"appid":"sampleid","ts":1315328401597},"value":{"Ireland":6023,"United States":6687,"United Kingdom":4001,"Canada":2684,"Spain":1884,"France":2160,"Germany":1158,"Australia":2674,"China":3311,"Russia":1545}}
      ,{"_id":{"appid":"sampleid","ts":1315414801597},"value":{"Ireland":5400,"United States":6691,"United Kingdom":3903,"Canada":2482,"Spain":1992,"France":2434,"Germany":1295,"Australia":3040,"China":3277,"Russia":1688}}
      ,{"_id":{"appid":"sampleid","ts":1315501201597},"value":{"Ireland":5156,"United States":6556,"United Kingdom":4205,"Canada":2379,"Spain":2026,"France":2493,"Germany":1340,"Australia":3449,"China":3971,"Russia":1730}}]},

      domaininstallsdest:{"sampleid":
        [
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:200, android:100, blackberry:50}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:500, android:150, blackberry:75}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:500, android:150, blackberry:75}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:500, android:150, blackberry:75}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:500, android:150, blackberry:75}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:1500, android:600, blackberry:100}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:1000, android:800, blackberry:200}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:2000, android:200, blackberry:200}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:3000, android:400, blackberry:200}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:5000, android:800, blackberry:200}}

        ]},
      domaininstallsgeo:
      {"sampleid":[
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:550, us:1500, china:60}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}}
      ]},
      domaintransactionsdest:{"sampleid":
        [
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:1500, android:600, blackberry:100}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:1000, android:800, blackberry:200}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:2000, android:200, blackberry:200}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:3000, android:400, blackberry:200}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:5000, android:800, blackberry:200}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:1500, android:600, blackberry:100}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:1000, android:800, blackberry:200}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:2000, android:200, blackberry:200}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:3000, android:400, blackberry:200}},
          {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:5000, android:800, blackberry:200}}
        ]},
      domainstartupsdest:{"sampleid":[
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:1500, android:600, blackberry:100}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:3000, android:800, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:1000, android:800, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:3000, android:800, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:8000, android:800, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:1500, android:600, blackberry:100}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:1000, android:800, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:2000, android:200, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:3000, android:400, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:5000, android:800, blackberry:200}}
      ]},

      domainrequestsdest:{"sampleid":[
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:1500, android:600, blackberry:100}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:3000, android:800, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:3000, android:600, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:3000, android:400, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:2000, android:800, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:1500, android:600, blackberry:100}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:1000, android:800, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:2000, android:200, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:3000, android:400, blackberry:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {iphone:5000, android:800, blackberry:200}}
      ]},

      domainrequestsgeo:{"sampleid":[
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:550, us:1500, china:60}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}}
      ]},

      domaintransactionsgeo:
      {"sampleid":[
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:550, us:1500, china:60}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}}
        ]},
      domainstartupsgeo:
      {"sampleid":[
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:550, us:1500, china:60}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}}
      ]},
      apptransactionsdest:{
        "sampleid":[
          {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":300,"iphone":776,"blackberry":0,"wp7":150}},
          {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":3222,"iphone":3330,"blackberry":448,"wp7":60}},
          {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":3476,"iphone":1030,"blackberry":248,"wp7":70}},
          {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":3876,"iphone":2330,"blackberry":148,"wp7":90}},
          {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":4076,"iphone":1530,"blackberry":548,"wp7":100}},
          {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":3176,"iphone":2030,"blackberry":248,"wp7":80}},
          {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":5076,"iphone":1030,"blackberry":148,"wp7":60}}
        ]
      },
      apptransactionsgeo:[
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:550, us:1500, china:60}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:1112, japan:25, indiA:1111}}
      ],
      appcloudcallsdest:{"sampleid":[
        {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":3476,"iphone":3576,"blackberry":348,"wp7":50}},
        {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":3222,"iphone":3330,"blackberry":448,"wp7":60}},
        {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":3476,"iphone":1030,"blackberry":248,"wp7":70}},
        {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":3876,"iphone":2330,"blackberry":148,"wp7":90}},
        {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":4076,"iphone":1530,"blackberry":548,"wp7":100}},
        {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":3176,"iphone":2030,"blackberry":248,"wp7":80}},
        {"_id":{"domain":"sampleid","ts":1312909201597},"value":{"android":5076,"iphone":1030,"blackberry":148,"wp7":60}}
      ]},
      appcloudcallsgeo:{"sampleid":[
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:220, us:1500, china:60}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:550, us:2000, china:80}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:650, us:1200, china:100}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:450, us:1650, china:150}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:350, us:1540, china:200}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:150, us:1980, china:220}},
        {_id:{domain:"sampleid", ts:1315501201597}, value: {ireland:250, us:1200, china:180}}
      ]},



      topresults:{
        "appinstallsdest":[
          {id: { apid:"sampleidA", appname: 'this is app A'}, value: {total:2000}},
          {id: { apid:"sampleidB", appname: 'this is app B'}, value: {total:1200}},
          {id: { apid:"sampleidC", appname: 'this is app C'}, value: {total:1000}},
          {id: { apid:"sampleidD", appname: 'this is app D'}, value: {total:250}},
          {id: { apid:"sampleidE", appname: 'this is app E'}, value: {total:100}}
        ],
        "apptransactionsdest":[
          {id: { apid:"sampleidD", appname: 'this is app D'}, value: {total:2500}},
          {id: { apid:"sampleidE", appname: 'this is app E'}, value: {total:2000}},
          {id: { apid:"sampleidA", appname: 'this is app A'}, value: {total:1899}},
          {id: { apid:"sampleidB", appname: 'this is app B'}, value: {total:1533}},
          {id: { apid:"sampleidC", appname: 'this is app C'}, value: {total:1000}}
        ],
        "appstartupsdest":[
          {id: { apid:"sampleidA", appname: 'this is app A'}, value: {total:2000}},
          {id: { apid:"sampleidB", appname: 'this is app B'}, value: {total:1200}},
          {id: { apid:"sampleidC", appname: 'this is app C'}, value: {total:1000}},
          {id: { apid:"sampleidD", appname: 'this is app D'}, value: {total:250}},
          {id: { apid:"sampleidE", appname: 'this is app E'}, value: {total:100}}
        ],
        "appcloudcallsdest":[
          {id: { apid:"sampleid", appname: 'this is app A'}, value: {total:4000}},
          {id: { apid:"sampleid", appname: 'this is app A'}, value: {total:3332}},
          {id: { apid:"sampleid", appname: 'this is app A'}, value: {total:3100}},
          {id: { apid:"sampleid", appname: 'this is app A'}, value: {total:600}},
          {id: { apid:"sampleid", appname: 'this is app A'}, value: {total:366}}
        ]

      }

    },









    init: function (sampledataEnabled) {
      var self = this;
      
      self.sampledataEnabled = sampledataEnabled;
    },
    
    getData: function (params, type, url, success, fail) {
      var self = this, sum;

      sum = params.dest ? false : true;
      
      if (self.sampledataEnabled) {
        self.getSampleData(params, type, function (result) {          
          self.handleData(result, params, sum, type, success, fail);
        });
      }
      else {
        params = {
          id: params.id,
          metric: params.metric,
          from: params.from,
          to: params.to,
          type: type,
          "num":params.num || 0
        };
        
        $fw.server.post(url, params, function (result) {
          self.handleData(result, params, sum, type, success, fail);
        });
      }
    },
    
    getSampleData: function (params, type, callback) {
      var self = this, result = {}, id, data = [], tempData, di, dl, dt, from, to;
      
      id = params.id;
      from = new Date(params.from.year, params.from.month - 1, params.from.date, 0, 0, 0, 0).getTime();
      to = new Date(params.to.year, params.to.month - 1, params.to.date, 0, 0, 0, 0).getTime();
      
      var ONE_DAY = 1000 * 60 * 60 * 24;
      var difference_ms = Math.abs(to - from);
    
      // Convert back to days and return
      var days = Math.round(difference_ms/ONE_DAY);
      
      // We want inclusive days so incr by 1
      tempData  = undefined;
      days ++;
      result = {
        status: 'ok',
        payload: {
          results: {}
        }
      };
      console.log(params.metric instanceof Array);
      if(params.metric instanceof Array){

        tempData = self.data["topresults"];
        console.log("metric is array ", tempData);
        //dont need any dates etc for this data just send it back
        result.payload.results = tempData;
        return callback(result);
      }else{

        console.log("metric sample data ", self.data, params.metric);
        tempData = self.data[params.metric][id];
      }

      if ('undefined' === typeof tempData) {
        tempData = self.data[params.metric].sampleid;
      }
      console.log("tempdata is ", tempData);
      
      var spliceFrom = days > tempData.length ? 0 : tempData.length - days; 
      var spliceTo = tempData.length;

      data = (tempData.slice !== undefined) ? tempData.slice(spliceFrom, spliceTo) : data;
      var curDataDay = to;
      
      // Set the timestamps relative to the curent date
      for (di = data.length -1, dl = 0; di >= dl; di -= 1) {
        dt = data[di];
        dt._id.ts = curDataDay;
        
        curDataDay -= ONE_DAY;
      }
            
      console.log("metrics get data ", data);
      result.payload.results = data;
      callback(result);
    },
    
    handleData: function (result, params, sum, type, success, fail) {
      var self = this, payload, data;

      console.log("handleData ", result);
      
      if ('ok' === result.status) {
        // Show results
        payload = result.payload;
        console.log('metrics results: ' + payload.results.length);

        data = payload.results;
          
        if ('undefined' !== typeof data) {
          self.transformData(data, params, sum, type, function (res) {
            success(res);
          });
        } else {
          fail('no_data');
        }
        
      } else {
        fail(result.message);
      }
    },
    
    transformData: function (data, params, sum, type, callback) {
      var self = this;
      
      if ('line' === type) {
        self.transformToLineData(data, params, sum, callback);
      } else if ('pie' === type) {
        self.transformToPieData(data, callback);
      } else if ('geo' === type) {
        self.transformToGeoData(data, callback);
      } else {
        callback(data);
      }
    },
    
    transformToGeoData: function (data, callback) {
      var self = this, fData = [];
      
      /*
       * data will be passed into google charts function
       * 
       * var data = google.visualization.arrayToDataTable([
       *   ['Employee Name', 'Salary'],
       *   ['Mike', {v:22500, f:'18,500'}],
       *   ['Bob', 35000],
       *   ['Alice', 44000],
       *   ['Frank', 27000],
       *   ['Floyd', 92000],
       *   ['Fritz', 18500]], false); // 'false' means that the first column is a label column.
       */
      
      
      // Iterate over data, summing the values for each country
      // Pie data is the same format we need for geo
      self.transformToPieData(data, function (results) {
        if (results.length > 0) {
          fData.push(['Country', 'Total']);
          fData = fData.concat(results[0]);
        }

        callback(fData);  
      });
      
      /*
      fData.push(['Germany', 200]);
      fData.push(['United States', 300]);
      fData.push(['Brazil', 400]);
      fData.push(['Canada', 500]);
      fData.push(['France', 600]);
      fData.push(['RU', 700]);*/
      
    },
    
    transformToPieData: function (data, callback) {
      var self = this, fData = [], di, dl, dt, tVal, vKey, dKey, tempVal, dests = {};

      /*
       * transform data into acceptable pie data e.g.
       * 
       * [[
       *   ['Heavy Industry', 12],['Retail', 9], ['Light Industry', 14],['Out of home', 16],['Commuting', 7], ['Orientation', 9]
       * ]];
       * 
       */
      
      // Iterate over each day in the data, creating/incrementing each destination as appropriate
      for (di = 0, dl = data.length; di < dl; di += 1) {
        dt = data[di];
        tVal = dt.value;
                
        for (vKey in tVal) {
          if (tVal.hasOwnProperty(vKey)) {
            tempVal = tVal[vKey];
            
            if ('undefined' !== typeof dests[vKey]) {
              dests[vKey] += tempVal;
            } else {
              dests[vKey] = tempVal;
            }
          }
        }
      }
      
      // Iterate over each destination recorded, building up the formatted data array
      for (dKey in dests) {
        if (dests.hasOwnProperty(dKey)) {
          tempVal = dests[dKey];
          
          fData.push([self.getLangForLabel(dKey), tempVal]);
        }
      }
      
      if (fData.length > 0) {
        fData = [fData]; 
      }
      
      callback(fData);
    },
    
    transformToLineData: function (data, params, sum, callback) {
      var self = this, result = {}, aData = [], fData = [], labels = [], from, to, tempTotal, li, ll, tLabel, di, dl, dt, tempTime, nextDay, templateData = {}, tVal, vKey, tNum, ts, fi, fl;
      
      from = new Date(params.from.year, params.from.month - 1, params.from.date, 0, 0, 0, 0);
      to = new Date(params.to.year, params.to.month - 1, params.to.date, 0, 0, 0, 0);
      
      // populate template data array for date range with 0's
      tempTime = from;
      while (tempTime.getTime() < to.getTime()) {
        nextDay = new Date(tempTime.getTime());
        nextDay.setDate(nextDay.getDate() + 1);
        
        templateData[tempTime.getTime()] = 0;
        
        tempTime.setDate(tempTime.getDate() + 1);
      }

      if (sum) {
        labels.push('total');

        // Iterate over data, summing the data for each dest
        for (di = 0, dl = data.length; di < dl; di += 1) {
          dt = data[di];
          tVal = dt.value;

          tempTotal = 0;
          
          for (vKey in tVal) {
            if (tVal.hasOwnProperty(vKey)) {
              tempTotal += tVal[vKey];
            }
          }

          if ('undefined' === typeof fData[0]) {
            fData[0] = $.extend(true, {}, templateData);
          }
          // round date to the start of the day
          ts = new Date(parseInt(dt._id.ts, 10));
          ts.setHours(0,0,0,0);
          
          fData[0][ts.getTime()] = parseInt(tempTotal, 10);
        }
      } else {
        
        // Get all possible labels/lines
        for (di = 0, dl = data.length; di < dl; di += 1) {
          dt = data[di];
          tVal = dt.value;
                  
          for (vKey in tVal) {
            if (tVal.hasOwnProperty(vKey)) {
              if ($.inArray(vKey, labels) < 0) {
                labels.push(vKey);
              }
            }
          }
        }
        
        // Re-iterate over data, creating formatted data array
        for (di = 0, dl = data.length; di < dl; di += 1) {
          dt = data[di];
          tVal = dt.value;
          
          for (li = 0, ll = labels.length; li < ll; li += 1) {
            tLabel = labels[li];
            tNum = tVal[tLabel];
            
            if ('undefined' === typeof fData[li]) {
              fData[li] = $.extend(true, {}, templateData);
            }
            // round date to the start of the day
            ts = new Date(parseInt(dt._id.ts, 10));
            ts.setHours(0,0,0,0);
            
            fData[li][ts.getTime()] = parseInt('undefined' === typeof tNum ? 0 : tNum, 10);
          }
        }        
      }
      
      // convert fData array or objects to an array of arrays
      for (fi = 0, fl = fData.length; fi < fl; fi += 1) {
        aData.push(self.convertObjectToArray(fData[fi]));
      }
  
      labels = self.transformLabels(labels);

      result = {
        labels: labels,
        data: aData
      };
      
      callback(result);
    },
    
    convertObjectToArray: function (obj) {
      var oKey, oVal, oArray = [];
      
      for (oKey in obj) {
        oVal = obj[oKey];
        oArray.push([parseInt(oKey, 10), oVal]);
      }
      
      return oArray;
    },
        
    transformLabels: function (labels) {
      var self = this, li, ll, lt, tLabels = [];
      
      // Apply language transform to labels, if possible 
      for (li = 0, ll = labels.length; li < ll; li += 1) {
        lt = labels[li];

        tLabels.push(self.getLangForLabel(lt));
      }
      
      return tLabels;
    },
    
    getLangForLabel: function (label) {
      var lLabel;

      lLabel = $fw.client.lang.getLangString('metriclabel_' + label);
      if (lLabel === null) {
        lLabel = label;
      }
      
      return lLabel;
    }
    
  });
}());
