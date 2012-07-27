

model.StoreInfo = model.Model.extend({
  // Model config
  config: {},

  init: function() {},

  getInfo: function(success, fail) {
            var MAM_STORE_INFO_URL = '/box/srv/1.1/mas/appstore/read'; // /box/srv/1.1/mas/appstore/read
//    var storeInfo_dummy_data = {
//        "status": "ok",
//        "name": "Martin\'s Test Store",
//        "description": "This is mock store data used for Martin\'s test. " +
//                       "This is mock store data used for Martin\'s test. " +
//                       "This is mock store data used for Martin\'s test. " +
//                       "This is mock store data used for Martin\'s test. " + 
//                       "This is mock store data used for Martin\'s test. ",
//        "authpolicies": [
//          {"id": "auth_policy_global_unique_id_1", "type":"oauth", "name": "My Google 1"},
//          {"id": "auth_policy_global_unique_id_2", "type":"oauth", "name": "My Google 2"},
//          {"id": "auth_policy_global_unique_id_3", "type":"ldap", "name": "My Enterprise 1"}
//        ],
//        iconData: 
//"iVBORw0KGgoAAAANSUhEUgAAAQgAAACCCAYAAAC6qlb1AAAACXBIWXMAAAsTAAAL" +
//"EwEAmpwYAAAgAElEQVR4Ae2dd5AXR5bnE2icDCC89zTeCQ/CCZAQRiAz8pqRZqS9" +
//"1e7dxsZFXFzc3B83F/vnKebi9m5Wo4mJlYRmRyBp5ZAECGGEkxDee++9R3jd+2R3" +
//"/qiuLpP1+9Wv6W7yEU3VryorzavMVy9fvvy+KqpLv59VSlSrZg31319/WX0yb5Fa" +
//"s2VHSrm6bBwHHAfuFAcKunVoqzq3aaVaNWusrt+4oa5du65Wy+Bes7VogE8aMUQ1" +
//"afBApn4fzJqvLl+5kvltTqpVraoKqlXTPznnz9DNW7fMqTs6DjgOVCAOFDw3/mER" +
//"CNvV0jUb1D21aqkxg/up3YeOZJqw78gxdfbCRdW0YQPVu3MHVa3a7YFvErVt3lT9" +
//"5smJ5qeaMvoh/WcuvPPZLLX74GHz0x0dBxwHKggHCj6eu1Ct3747U91RA/oq5Zl0" +
//"bNhRdK9Hx3ZaQGQSek4Onzip/jD9U1WzRg31mgiK+ctXqy179mVSnD53PnPuThwH" +
//"HAcqDgcKvMIh22pfu35DHT15WmGDgM5evKh/Z5ufe85xwHGgfHCg9HyhfNTL1cJx" +
//"wHGgHHCghIBo9EA9MTSWuJSsisVTkyqqSrLnXGrHAceBcsmBjDSoWb26emHCWFXV" +
//"s/qQtMZXrl2TFY6r6oE69yd91KV3HHAcKIccKBjZv4/CiDiiX2+90lD3/nvVzz97" +
//"rJS+Sjdv1EBdvPcedeHyT+r8xUu+u0odEYNlr8L2Yvjcpe93bN1CXb1+Xe3cf6hU" +
//"WnfBccBxoHxzoGCsLGtekwG8YtM2NWfJctWve2cV5bfw0qRHdIsWr16vvlm2olTr" +
//"Pp2/RL08aZz6hxef0oIG34qZ3y0rlc5dcBxwHCj/HKjSeOiYn0+fu6Bu3Lyp7run" +
//"tvqvv35B/fvc79TabTtzqv39omXwd+L0GXHAuplTXu5hxwHHgTvDgYLjp8/qkqtW" +
//"qaLGDOqnvSl3Hsh9OnDh0mXFnyPHAceBisuBgpdkOvDT1WuqZZNGqt7996nPZIpw" +
//"UewLjhwHHAccBwpOnjmnbolRctbiH9S+w8e0QdGxxXHAccBxAA5USXM3p2Op44Dj" +
//"QOXiQMYPonI1y7XGccBxIA0OOAGRBhddHo4DlZQDTkBU0hfrmuU4kAYHnIBIg4su" +
//"D8eBSsqBMhcQjw4bqMCWSEotGjdUv3ligl6KTfpsZUp/b+1amgcsSfv/6sq1sqZJ" +
//"I4eoLu1al3Wxrrwy4kBBGZWTKaZXp/Z6r+fGnXsy12xO6skGsJZNG2vvTBCu8klA" +
//"57FHZfPuvbK35FQ+i0qc91NjR6pObVoGPoc37P98693Ae/m62LdLobp0+Yraumd/" +
//"vopw+d5BDpS5gMi2rZtEoGyRAXvrVvhGsmzz9j9XUFBNjRogm9jOny93AuK7lWvV" +
//"KoEI9NPAHl3UvbVr+y+7344DOXGgwggIWlkWwiEnbpbBw2CE+qnuffeqp8aOUDMX" +
//"uk1xft6437lxIBbVOkn2rWQKwO7QZgJw+9PVq2rXgcNqztIfA70zUePHDHpQ2yNu" +
//"COo16fxq6q/F5uCHnvn420XqnG+KUUOwLIY/2Et1bttKMVj2HD6qvpQdpEEu493a" +
//"t1FD+/bUSN2oxkdPnRaI/u1q294DuqlJ0LmZezMVaVCvjn4Wr1TasGjVulJsa1C3" +
//"jnp58qNq7+Ej2p29VIIsL1SRPTRPjxupt9MbJPIss4p9jLK6Cv+8KOhoW36y6QeP" +
//"jxomkAGX1aKV69TogX2lH7SXXcQ39e91AhXgpSTv1/ucO8+dA9X+0z/8x98dOXlK" +
//"YRM4c/6i6tO1kzomg2bvoaOJcgf34ZUpj6mjMmeft3yVOnT8pBrYo6vq3aWTWr15" +
//"u3bnJsNhfXpo1X1Qz26qVdMmasOOPaq1CJa+Uu5GOQdwxtA9YpA7dfa8/qNzAtG/" +
//"ctPWEmm4/qIA3XSS8kHn3rbvgBY6PTt1UCs2bjFZ6ePDAx9Uk6Vj7pLNaItXrVeH" +
//"pa4IFGi/fJlB5/7Pv3xGPSQCBEIAAOJr/nBFP3P+gr5HKIBfT52gTpw5qxauWKs2" +
//"7dor2+Zv6Hv7RED5qVObFqp/9y4aTGeJIIinRWMH91cdWjVX02bOyfuuWQzMEx4a" +
//"pLz9pV3LZmrfkaOZ/mLbD+Bp9YIC1UNsUp1at1QrN29TtWvWFOHdQ23etU9d+qko" +
//"tEKS95sWT10+tzkQi2p9O2n4GS9x4vAhGnhm+uz5mYRnReAAhz+4VzflHRT9u3VR" +
//"22Ug/5+/fKQBtHceOCgrFBO1kJj7/crM80DxG6IT9evW2fzMHIeKwMFo54XWR3N4" +
//"ceI4VSgahdEMALoZ2b+3Wrp2o5otuBeGECqGkqBzN2/UUKNvLRDhgHCB/BqQyZfj" +
//"pp17Va0aywTM91QkII/3mbhzBMPwfr3UtC/mlBCacc9lc5+VJwTnR98sCEVBT9oP" +
//"EMDw7vfvf6injytE+P/2tZdUa4nRclxgAiDb95tNm9wz8RyomgaqdX1ZYWj4QN1S" +
//"qFG8/KsCQ1cogXm8xFcYzAljbjxw5LjeZp4NVF2Hls113A6AaVBt+TNf8sb1bwf8" +
//"6dq+rR7QSwToJowMOjcaFGTQuUHs5s/kyz20EFYNnn10tBomA6d2rZpcDiVAeH4U" +
//"jWb/0eOhaZLcqC0I4k+OGaFWbtyq65Lk2WzS9u7cUR2Qukf1l6T9AEHOB8XYln4S" +
//"7RE+1ZLwCYZs369J747pciAVI+UDdYswKP2qNbtEDxw9oYWHt9rb9u4vYZegUzDY" +
//"gmwG3ueCzpuLfwTBfJiHewkYPW+QHwTYZVFbsynDm685Py9YF3/6eKa2uYwX1Rvb" +
//"C9M0YoKYaYhJm4/jSOKXCM0JQPXKR3nAAZgYKWH5J+0HGFzNVMLkeUv6gve92b5f" +
//"87w7psuBEgIiW1Tri5eK8CP4YjMX91Lj+vUUgymKQLJi/nnwWPKvK4IALeU9UbOj" +
//"CFsBanIjERQnxJgYScWqTRw6Nz4S78/8RmGAHNizq/5jKvTmu9O1wIssI4eb8Itl" +
//"ze/EwAdcYL6JeCeUeVOEuJf8/SXXfuDN25zbvl+T3h3T5UDGkzIXVOuTZ8/pVQsM" +
//"VF5CYNQRIyCqaRSNFMBcpghJDaPkuVcMgjhQ3ROj4pu8MYrFUVJ07lMipGaJXQNb" +
//"AJ6OCIkgYqD5V2WC0sVdYxqFgY9pjg01bVBfplfZl3xFAIV4P21bNMsUV6K/FGed" +
//"az/IZO45sX2/nkd0AKfsW+vNyZ1XZZmupwya156apFGt6QhRqNZBLGN6sODHNXqg" +
//"YpCsUb1AuwFPGD5If939y364CPP1aSaGQ4IDD+7dXX06b3GsphFU9jIxOjJ3BUyX" +
//"/BgIDevVVaOkXX1lBcXQHokNCtI27WVJlFUIbB60vWu7NiZZ5mjQuakng6G7rKB4" +
//"BeDkkUN1XpTF0iirId07ttXPn5PIYn5CRQfv8/WnJ/tvJf7NXB8KQhX3Z4Zh9++f" +
//"f0K98cxU/61Ev7fLMnCRobd0fzEZJe0H5rmoo+37NXmkyWeT5918TIxqHcas79dt" +
//"0kbAR4YOUBOGD1ZYtMG7/PMnX5Wa93cXVZ+/mzdv6SWyT8S3IW5+a+alfgBcbAp8" +
//"uZ8UR6G/fWaK/kJTNgZS7/ycWQOGUZZRsYxTTwh/jYUi3PwUh859TKzsfcRwx8oI" +
//"Ph2UyVQHTYLlUz+hWZCujgD58nUrnsX4k1n9JgYqdE2EeRwxp4eaNqyv0OjM6kDc" +
//"c/77X0u7Gogw9KKgsxrUByHsaUySfuAvI+i37fs1z6bJZ5Pn3XxMHdUa8NuG8tVl" +
//"4IWB1jJAasmUgDmtd2Ug6kU82LVQPTFmuPqnt6eFzrux7KMVnBFHKrSKKOLLzwCL" +
//"+wrHoXPT3kZiZ0HYsUeEr2gYMTXAgJmWoTSsHP91/Eeef2yMevO9GaWczPxpo34j" +
//"BLHhGBT0qLQ2/SDq+aB7tu/3TvE5qM4V/VrqqNasXMR9pfjgxA1gL2NR4ft26agd" +
//"dKKMcoDv/hTw9fbmZc6ZL9tQHDo37T12qmjNPi6/OFtM3PPZ3mdqcFgc1/weqEnz" +
//"Y+ppUNDjnrXpB3F5+O/bvt87xWd/fSvD73KLaj1RbBN8rVgBadG4kVbN3/tidmXg" +
//"eZm2AXf2XoUdtCNZmRbsCqsUHKgy/jdv/Iy033voSLlCtWZfBVZzDIRoJDv2HVSs" +
//"FjhKxgGWmVnWTWp4TlaKS11ZOeBQrSvrm3XtchxIgQMZP4gU8nJZOA44DlQyDjgB" +
//"UcleqGuO40CaHHACIk1uurwcByoZB5yAqGQv1DXHcSBNDjgBEcJNwGNAtGKT0t1A" +
//"d1t7y/s7xeGvX7dCjYHihS3IV73xCO7fvTTeSondnPkqvCLmW192aOKRh+tuWXs+" +
//"3gl+3W3tteExrvF3At2cgTppxFDxRL4k+5qqa6yR2QLJyL6UbMimHV1kPxJevis3" +
//"bStRhBMQJdhx+wdIU2u37ciAmdy+UznP7rb22rzFO4FujsaKcFi0ep3GFmHz4dPj" +
//"Ruk9MD9u2BLpyh/Wplza4aYYYVyV6wbpKCJJpbp1t7W3PL48phZsTNxWHGeEdwKU" +
//"Idv778R0t+DVqY+FolADsAJc3Lc/rFTPjH9Y/Sw7A6cJQErvzh0UALBAqAHYCrEZ" +
//"aJdsqQagNgqtGnXnV48/qrEhAVwB0bhDqxZ6p+O3P6xSqwS81JAtmrEturRNOraf" +
//"sxXc0Aez5ssO0CIAVXPNHJmCxKF4J0FvNvlGHZ+V9wBy1w/rN2eSsb3+Zdnuvnj1" +
//"Bo31aW6k2d4k7WBTlx/9+tq16wIqvEMlRd62ba9t/zO8iTsmQTe36Qdx5Zn7h46f" +
//"0PuURohN4MPZCzQEH7uGGSvZBIxK0g7qQHqDMn7rZ0H36tJ/0O/CUKg7ysAF+BX0" +
//"6YsCUV4oIKNslgJPgQ1KvQo7ZiDeHxO0Y3ZwxqFVVxMBMeXhhzRS9fhhg3SFfhRc" +
//"RUBWjp85kwGNoZPZoFXbokvbpmMrNTaH6gXVNao125eDNoiljd5sOkjcEXg7YNp2" +
//"7D+YSYoK+fjohzSeB4jTUNrttUWhpuwg9Ots0dJt22vb/6hfHCVBN7ftB3Flmvuy" +
//"60Fd/OknPcbaNG8ioRxay16khuqvX89NDEycpB3YPa4LKrsXZRxs0II4FOqG9erJ" +
//"V+mg+kawD1sI6MkIQX/644efa6Qo0KTRCMwWZ1u0apiB1XSxAMiiNUAAvHhxBWzR" +
//"jG3RpW3TGVwKtCc0pSBCeCVB8bZBbw4qJ5drabbX1MOmHTbo1ya/tI9J+l9U2bbo" +
//"5kn7QVSZ3ntrRNPqJiDL8BsCxyQWJtGbQfG5bTvMo0Hvt4QNIgiFGkDZJaK6Qjdu" +
//"3NRfLjZN+fEJuZ8ErXq3TEfmFQsHnv1G4O4BszVki2Zsiy5tm86UH3XMB3pzVHnZ" +
//"3EuzvaZ8NKs4FGob9GuTX9rHJP0vqmxbdPOk/SCqTO+9MYP66SBQfDzZXo/G3V7Q" +
//"25OSbTtMvkHvt8QqBrs6/SjUZyQ+pXcOvkd2fYZRErRqwG09QERq3badJbK1RTO2" +
//"RZe2TVeiEiE/8oHeHFJU1pfTbK+phA0KtQ36tckv7WOS/pdG2Un7gU2Z2BuIC/vF" +
//"wqUS+GmrDv70qgRoenHiWPX2RzNjsVZsyghLE/R+SwgIHoxDoU6ybRira77Rqqmz" +
//"Lbq0bTryjKJ8oDdHlee9B/9Rbb0U5kiTVnu9ZUWd26JfR+Xhv5ekvf5nc+l/Oq/i" +
//"L1gYunk++gHTWpC8EQ4QEInTZ89T//jSL8Q+0E6WPu3AifTD5r+YdphkQccSUwxb" +
//"FOqgjIKulQVatbdcW3Rp23TevL3n+UBv9uYfdY7BFIwMQzhyYemHfHLDJNE4Gjao" +
//"25kHsjyJRb/OIt9s2muKyaX/kUccunk++gFj0B8rhHgu2PnuyzJ6e1w7DL+CjlVt" +
//"UKiDHgy6difQqm3RpW3T+dsFXBtWZOD7DeUDvdnkHXdkTooxqU2zJgqczteenKRA" +
//"nPZTmu315x31Owr9Oon2acqwbS/p0+x/pvwodPN89IPdMoVn2ZS4ttVldYpwDqwK" +
//"sRjgtdGZ+tkeo9oRlUeBDQp1VAbee9mgVXuf955jMLFBq7ZFl7ZN560D58DpQ6y4" +
//"sJJjKG30ZpNv3BEkaUIU8AeKNv4QGJEHSCAdlsgMpd1ek2/cMQj9eo7UuZ8so2Hw" +
//"Tkq27SXfNPufqWccunna/WDW4h90CIXJo4aKYBggTlPV9Ore/B9XZ+LMmrolOca1" +
//"IyyvKlW79v85DoU67GHv9f/yynM69NzClWsToVV78wg7t0EztkWXtk0XVhf/9Xyg" +
//"N/vLCPpt0KXjBl3a7Q2qi/8aNhJTP60aiy2KmCAs1631GaP9z4b9NvmFtTef/Y86" +
//"2aCbpzGOTPvxY6lfp45GXidWLB/MNCiuHf4yCtJEH0aFTIJW7a9M2G8bNGPaYYMu" +
//"bZsurC7+62nyz5931G/bdfG02xtVJzw6CZJMgCKDfo2AYtmOgEw7LSOBBZVh0958" +
//"9T/qY4NuHofmHtSusGv0ZZv+HPZ82PW4dvifK7WK4U/gfjsO2HKgapWqaqqs2eP9" +
//"qF2GJQwBy57YBj6bvyS1r6BtfVy63DmQGmgtIexwVDl47ETutXI5VFgOsNSJFyDL" +
//"5WgvZYWW7vpffrpMagIiP9VzuToOOA7cSQ6U8IO4kxVxZTsOOA6UPw44AVH+3omr" +
//"keNAueGAExDl5lW4ijgOlD8OOAFR/t6Jq5HjQLnhQDXVsPnvbGoD+MSTY0fo7d5s" +
//"I61ohLsqDldmfd62/rhZP/PIKMUuVnzaHSlx/62leXlV9oWEEXsKQJWqK0uc7CW4" +
//"LlABQWSTjveGw5Wf8B5l2xpr+9lSbXFlHtKruxrWt4eGMwiL+g54yr3i8IX3qg2x" +
//"RwZMk1MSRT5ovITlN2X0MM03/EdsfD9s6pJLGms/iIqOetxLlmHpTBt37knEr3p1" +
//"7lctxTceD7RsIL+SFGaDPpwkv7TTUj/gyIb17akuiWff/3p3emARwPYN6tVNO/ow" +
//"UNhTAFQheCNeikvXQJDFfynwhPD+1NnziujuxqOwe4e2GmTon//6794sE52zNPq4" +
//"DMirAoe3WeAHTkqQ4yACD/KNZ6dof47/8S/vBCUpdY0tDIyZ78Sz2E9R+fEhwtkM" +
//"iMdjJ08L3+aU2rzlzy+fv60FxN2KerxJBMqW3XvLBMA2F/ThfHYS8sbh6ReiSTHg" +
//"8Ri8V7SIIBrSu7sWDjNmz9fCGIzDX00Zr345+VH1+2kzMrBpNukG9uwq+CTHBRth" +
//"mWCePqzASliyZoPC12LSyKHq8wVL9OAOqkfcNdqDRrx26w71tex/CNNwyAfHLwb7" +
//"Lcu9JGy2AjjnrRmfBVYjKr/123eLJ+pu7UfCPiCwNt/5bFZW+1gCC094MZEN4m5F" +
//"Pb5b2+3tS+CT7tx/SP3fDz5Vew4eKQH2403HoN6+70BGU2PvBOhjNWtUV31l96kh" +
//"m3TgMfJlZ8v3lt37NcoSz4M/uVeAe0F7zobQSF6YMDYjfKKEA5iT4DXSJhtiHwo7" +
//"aVcIRH2Qq7RtfkyFP5g1TwGcNGnkEJui85Km4D/84nHVoF4dnTkqFkxftGpdpjBb" +
//"lOc7hXpMRZOgCqMmR6Fukx8RtUpCsij18beL1LkLF7mdIVvUbR7oJvPxoaKaswnn" +
//"0uUr6qhswFkjsTe2FW/VToI+zHZvArpEvTdTSdT0l+XrvffwEe3ubK4nPbIJL46a" +
//"NqivGtarq5bKV94QX1JAj7ETMC3gnm06QJCrF2NfsM+DPTlArxHk5Z//7WNTROIj" +
//"fRVCy4nago6m8sTDw9WydZtkj9EVjb4eV9hAsYsggOYtX10qadL8APz5atH34r4+" +
//"XI9L01dKZZzSBYSbH4286hV5CV8sWKo+kQGwY9/BUmhFwFBRsXMXL6u2LZppzP6g" +
//"+jQT3ARePOAlqIJMSc5duKSeEDUOQ5SXmJ89J+l+ln90mI079qhWgm9Qr8593mRW" +
//"50jk3zw5UW8S+3juQrVgxRr9pfkbEXwIAy+hwr84cZye460TNQ5D0XOiwtGpvUR7" +
//"zR/gMrS7hjzrJZhJGx7s2kkBdDtXQgOAHfHKlMdKCRdCBDwvX6yTZ87qHY0I4Buy" +
//"ecnwBQPw7/7uVb3jkTKmCEI1v82fF48QAYPaGffeTF1bNGmoBUk3GZzUOZ9U9/4i" +
//"zAxjXAPLgK/9/OWrZG/GSb2NmfJt04Etwdeb6QCCBrdt9nqwBdwPqmLbLqZIhQK2" +
//"jGYSlweawBWxT3ixU6PKIe8xg/tpWIAgg3bS/CgLAFuMnF7tK6oOudwLGpcFCySu" +
//"hTEeBalsNijPplJBqLi/fe0l1bpZ4wyWXpqox3T4JOjStqjH3i8gcPz9upWOWWiP" +
//"ut1AI3gvXbtRd2zDKwSooSTow7Zo1SbvTTv3iiBcpo4KHH7U19Kkz+XIlxO6LLDt" +
//"0IThg7XW9b1gVjwgmgwDExFlm+779ZtUI9nTge0D4x3bqTFWYjdA4wrb+q0LD/kP" +
//"YVtVno3bM0Q/5e9PH88MXEEJyp4BdkKmBkGxP7LJjzLYzwLYS8dWzYOKTO1a2Lis" +
//"+uyjo7VVmuWeXCkIFZeXyJfaUJqox0lRhdNCPaYttqjbWKTpkEsEcCaMkqAPJ0Wr" +
//"hv8EONovxr58k7HV0KnR7FglwJCIYEKb4DqYNrbpgLD7cM4C9b/f/0hjNPYsbK+X" +
//"2f/b6y+p377+shov2klSYmcpFCUgwLLka79o1Xqt+diUwTQXzflLmRL4KZv8vHkc" +
//"kA2QxGthuTdfFDYuC5gLY1UlQhRLgPNl7sRAyoaCUHGx/BJKzBDqotFKzLVsj0lR" +
//"hdNEPbZF3W74QF3tB2CW57Jtq3kuH2jVJu9cj+cl2CzElG2iLHWCdnVY5tEQ06mL" +
//"xf4Ktun0g/If8SmZh9M38X2YI4Fs0Xr/5unH1XIpI0l/NbOsIlFlSih5xL7DB5Mw" +
//"eE+MGa5vMn3GN8H8Zvny9LmicYImi0Ah8C12Az8lzc//fEbzM5X3J0jhd9i4LHhf" +
//"1qcxZGFV5g+V+k1Z3w5yTMm1HhhpkKb+mBqNRHUs8AgR23JyRRXOBfUY5GGcZt77" +
//"Yk5kdU+I3QH1DUQkMzcPfaAYMi4MRdk8V9Zo1abcuOPZ80VG3MkYAUVbIGIbxMBC" +
//"UB44UqTF2KYz5Y14sLcGnMFGhtbAMiAANGgBGH+ZvtmS8WVp2biRnq4EPXdY7CXe" +
//"EJCkQfvRR/ngQcU/9TlCq65glr4jdqggSpqfP49W8lFlJScfYEyUFTkuSWBQnrFB" +
//"YMFHSGzZs49bqVLaqMdeVGGMk4b4WgEyS+yNKMoF9ZhlNjoGqjPQ5GG099BRpQYo" +
//"HdJswY+36xiUPin6sO17owNcFXW9WP4EFZ3KNd4H9hTsJP/21dyMByHaFgbj9Tt2" +
//"6XJs05EYwfrQgz3FFvClhl/jGhoFVF1WNi6Kl2YS2i1LtAx2nN/WCfJVEGFD8NsR" +
//"RvTrpTDEfy4GfS9hmET7nrN0hV5l8d4z50nyM8+YI9oJ/Nt14LC5VOqIdkPYSjN1" +
//"K5Ug5kLkuEQdxOCDBOzesa3O6tzFkst53vyDUJ699+PO00Q9TooqnCbq8TL5aiHR" +
//"cWah49Bp4SUhBPt26ZRhwx6JIAYEG2omMU1ZhUB1ZX7eVZbr/BSHPowqS1627w3V" +
//"ETzI15+e7C8q0e86YoDE7Zw/NC/6jPkNOIyhZWs36VPaCGGQxFuRKRZffkM26RAD" +
//"TC3QEHDOOn/xkjoqKnw/8adg0DAwtnuisZm8o47UY5f4c6B5INxzJQyTGE5Xe4JO" +
//"55qn9/nehR0Uy+l+gWXSYED/++efUG88M9VcyuoYNi4L/u65qVq6I6lQmYmfYOaN" +
//"QSWFoTwHpQ26ljbqcRJU4WxQj439xO9MQ0ezQd3mqw1YK1oGKx90KIg1/oUBGkUc" +
//"+nBStGq+cHy9GeAMuGy1CFynicvqpb99Zor+iQr9lsRrhYiQRllMBQj4i2ENH4h/" +
//"/fQrrSbrRJbpmPJinFu08rZfzmyxP7AMPFzqQtR5fCOSEoZTXKefHjdKvS+uzNny" +
//"xBgmWenINo+ouiN4ma6xarNld7BGb7w7mzasr+082eJiBo1LlpM1qjVLSTdv3tJ7" +
//"DfJhe/AzAWFkUIopjy9SrqjHRfPcenrghW3eYYDUkq8GNpCgDTT+evKb2BMYpv7p" +
//"7WklOrg3LYOAL+YZcaSKmyfy5b8m82e+hlHEl5e/E/Ll9AsnnqO9tu+NjowhLy1D" +
//"aVS9zT1Wrij3kix5HpE9BRlDm0lQfIxKh9MOy4ZhG6h8WSX6ie/JK1Mf0x6PQMpn" +
//"I2haS/uYvhHcOm1CK2V595r4Yfz5k68ibYL4uOAb8+Z7M0o58yWpl39c8myZQs55" +
//"UY9Nh6GjIyUJOfb7aR+WaSeOYx5q9CtTxqua0gn+ZXqwX31cHu5++eVAv26Fek8H" +
//"NcRfZP6PqzIrE3eq1r1kKXdYn556CoVgfOfTrxUrV1GEDQS7odHiotImvVeQ9IFc" +
//"0lcE1GOW59BueCktxNKNuswuQkeVjwOrNm/X3sNMn7DVNG3Y4I4LiMI2rdVp0fZ+" +
//"2LBZrdu6M7N6EsZ9tg30EjsFG7ryQWWqQdAAVLJu4jxU1qjHtszr3LaVdq0m/iXz" +
//"OZbWWC1w5DhQHjnAOGL53GjkadexzAVE2g1w+TkOOA7kjwO3XRzzV4bL2XHAcaCC" +
//"csAJiAr64ly1HQfKggNOQJQFl10ZjgMVlANOQFTQF+eq7ThQFhywRrWOq4xDjY7j" +
//"kP19hxodzys8RCsSarTZEMXR/4ezoNkMhjMfznT4NYBdgbPcBQFrCsO+wEEPpC72" +
//"v+DsGAeCE8bZsPGbmh+EQ40OY739dVyiHWr0O1YMw2W9IqFGsw/H76puGvqv4gwF" +
//"IA40RRCz2F+Bpy1hBdjpjDfqX76cWwrDArStSSOGiiv7Jb1fgy3quKKzTygphY3f" +
//"1ARE0gqZ9A41uogTOOo41OiirdSmb4QdceEG4KSioUazW3e6ANH6CbQvQ6vFeZo5" +
//"pJIAAA9gSURBVGvJ6g0Z93Kc9t54dqrG13j7oy9MMr09AeGwaPU6jZPBZkH2luBV" +
//"+aMA5qa1ZaJc2CCy3aaa4VYlOHGo0Qes3iL7BdjRWhFRo5kCsG3b/+fdBwLyl3fv" +
//"CU5Qu2VHsEHCMkxiasFGwm3FyN6MIeAaiLnB3qa0yEqDQGIjmZqJKyq7EGkgqD5B" +
//"kZVQkx1qdPLX41CjKz9qdPJeQRSzmtoW4d/Neej4Cb0xcET/3urD2Qu0jQLIO8CE" +
//"DChONuX5x2+sgABbkC3eW2W7KajR94hxaNzg/qqN7IZDxfOqMgY1GukGajSbYUCN" +
//"/n9//aSEVAQxGmMMBNIQc64w1GjwE4AuQzAxhwM1+g8ffFJiey2o0czdQQEC+xEj" +
//"X/uWzfT2V8pi5x7I14bYLsyfIfzYkdKQQY3mN2jftA/ByJcriAxq9D21a2owkXy5" +
//"vFJ2FBp0OzFogdWRJJ1BjSY8HCo7MPxpoUav2Lg11mCGJmBQo4f26a7rHvWfQY2e" +
//"tXh5YBjEpPlRFqjRE4YP0ajR9JV8EsbJV2UHKWjvuPHTX73agynbYIagNQBKBOjQ" +
//"zO+Wmdv6iMYwa+lyDctP9DHgBHju3c+z35MRNH4jBQSDwqFGq8gALQ41ukS/1V87" +
//"hxpdkif8IogOAhkh114QqvtKuATwMj6bvzgTZMg8hSYwoAdYGNX1Hgsg+oM+Twg3" +
//"9jWBJg+BOxILa2gKCTgGob5HCgiDGg0oi5cADAVcprBNKx0KzdzLJ2o0ZRgMByDl" +
//"jLRPghqNBIfOCmLWUcEoCCIvajQBU4Cnj8J4MKjRQXmlfc3YalgSM6jRGK7QWuJQ" +
//"o4PSGdRo6gk6FPgIwOKBGl2tajW1YtPWElD9Nu0xc+V8oUb/0WOoM/Vhzo32kASF" +
//"2jzLEdRoNGJwPYK+6N602Z6DKsafoXYSa+WpcSN1+L9jAhztHdhzlq1Q/IEkxeZB" +
//"QKUBO/qjgPKYMUA+Ywb10/e//WGV3tHJCgi7kI02bMqyPQaN30gB4VCj00H7tn1B" +
//"cels0aBt05nyHGp0MR5UyDTS8CnNI8uaBKtiylEoIQZPnLkdjcyUA1AtCPCXJaoX" +
//"U+uenTpkwHTRMkYN6CNxS5fqkAArJLTBq1MnSGCosertj2Zm4tCYvGyOQajvkQLC" +
//"oUaXDdq3zcsjjS0atG06U65Djc4varThs/9otFimHVFEVDKoft0inE/OAVgCWR1b" +
//"D4QNYvrseeofX/qFACS3k6XPM/p6Lv+hmUUKCJZbMA6izjrU6HC0b6YuDjW6qCs6" +
//"1Gj7Icm4ggiGHEV4SkLA7xlimn3OB1t4WRC+MarfVzudZU5Q3yP9ICiMOSkQ4YMF" +
//"dQfIOOaYE4YP0jYIb5BfKs49PL/A0yPo72AJBf/pvMWxkFmm0d6jQ412qNH0h8qC" +
//"Gg3aOTY7bEXYFkA1J4gwWoTxoqS9o8VwyfiBmPphgBwucUGIr7J59159nf92yxQF" +
//"94OBYsysLnFjyRd3aZYpmSpkQ0HjN1KDoBCHGh2N9o16yEtxqNG3u6RDjb7NC3MG" +
//"6vRogYcDg9Ushe/cf0jNmDO/hKtAoRglH5Z02B8wgNeuWVP8jg7pJXSvgXLW4h90" +
//"qIrJo4aKYBggTlPVNGQ5ALzGgG/Ktj0Gob5bI0o51OiboXxGkjvU6JLscajRJfnB" +
//"LzTwJhLLg9USPCZZRQoi4n00qFdHCw40BxPiLygtvg/169TRSOmshuSCXM5Sqh/1" +
//"3VpABFUu12sONTpXDpbv5x1qdPl+Pza1i51i2GSSJI1DjU7CrYqd1qFGV+z3R+3L" +
//"XINwqNEVv9PcTS3IN2p0eedlmQuI8s4QVz/HAceB2xyIXOa8ncydOQ44DtyNHHAC" +
//"4m58667NjgOWHHACwpJRLpnjwN3IAScg7sa37trsOGDJgcSo1gBjDunVXQ3r20Pd" +
//"uHGzBBBMUJmTRg4Rl9Gqsem8z+KZ+PjoYdrNFFdT/oDTKm+Ey2ynNi31XhUcYHA0" +
//"uXD5pxLVnCLtIIw9jmbeLb0lErkfiTmQTb/yFsJeBt5LXdkewB6G69KX06DKNj4S" +
//"+UFo/3Hp8FevXVeAWJwUvLw46tulUF26fCXxABeIA014iuGp+Nn8JaFFIVBGiq87" +
//"vupAbpUFDevTQ40d0l+jJp2VaMxNxJW2Vo0aaqkgCs9esjxTBfzswax4ZvzD6pj4" +
//"3U+bOScWaSnzsDsJ5UC2/YoM2SdERG9AXHCVZy/DtJnfKHBOcqHKOD6sBQSoy0+O" +
//"HaHWbt2hvhY/8LQkbtALYZMY/vzQUNnwhYCIIqCy2Bt/+vz5MhMQaANvzfg8s++e" +
//"jTUvTBinEBw/CNCMwQVcL9B7/LGeDnTf8wLBB8RdWJyDqHa6e7lzYIj0J4TDjNnz" +
//"NZIT3ry/mjJe/XLyo+r302bobdPZlFJZx4eVDYLgHS9MGKsOiP/4FwuX5VU4ZPNy" +
//"7sQz2/cdyAgHygftad22nboq7Kzz03HZqvuBQJ43F+Qm1GNHd4YDA3t2Vby7jTv3" +
//"6AogqG/KBwl4t75dC7OqVGUeH1YaBNtSIaSu2YkWxEkwLJnXdZZtra2aNRZBckPx" +
//"dfcTc3cCieBVWfe+e9Wew0fVl98ty2qjCV8AphgQ5/wZ8n+lude9Y1u97bZF40Ya" +
//"lfu67JpjWpCGjQMVk4Anh0OmOUx/vlr0vQDDDtflZbvrzrQv6ghPfiVgprSNcgH1" +
//"7dCqheYVEGUAphqyeR/PyhRpn7wnAIQNsfnoZdGKFkscBwadIWxGTPnYcAQxFYW/" +
//"fngAm3J53rZfkTaK2ARF1Kqla26jNwHW26ppEwk+c1lHqPLei8rLe68yj49YAcEc" +
//"rVAMcTYoxezdR8UGxxFGgy6N8c6LuMnLfk46G7aFOLRq70sIOk+CVs3zU8cMVz07" +
//"ttdYi4sF/Zr97wyc9QLrlSsRBg7h+Nevv43MqqxQlOFzW8E93COIyOOHDdLRlxig" +
//"jwwZoOrcd0+mjrbvAxWaQeQlU8aarUWaE/d4r0yj4lDBbcslT5t+Rbo4skUFj8vH" +
//"e7+yj49YAUF8QFuU4of69lQffbNAz7kNE0Hu9WLUM5Cw/Huh5tmi+uLEcYLN1yrR" +
//"XvbDJ06qP0z/VNTDGuo1gbWfv3y12rJnnylaQ3KZHwDe9C7sILDgszOgnnzBEBBR" +
//"WpF5PurYrUNbDdYxS4yT/vgF/ucAnD0i9e4oyMZlQSMlbgLCEK0BArgkX++D/IkR" +
//"SX9ZsGJtxugXpJ3Z9oMeAtZq068oO46YCkCXJZQdNGH4YIGgv6i+F63ogbp19IeQ" +
//"lahi+7hOE/dfZR8fsQKCrywUhVLMfVQ1bBQY5KKogwgcDHhMP4zx0QBheNGqo/Iw" +
//"93gORB4btGpAPumo2SL+mjL9R4KsEjJvngxA25iIZYGibOpJe6mboW++XynQZbfx" +
//"CtN8H5RhiwpuW65tvzLtizraooJH5eG/V9nHR6yAEE1V088xchUVFATeOMJIR8iw" +
//"pwXy20sAcHI9H4TtoakEv/FCdqVRDm0mMBCwfP75dVT+GY3FMDcqcY73NslytPeL" +
//"aAypJtu03wew63/6eKaOxAZcOxHZMAii3QGqY8i2XNt+ZfKNOiZF+47Ky9wzr7Cy" +
//"jo9YAWGW61qKUe/U2fOGLyWOfMFBwMUa7CXwKQt8gx5BQEyN976Y402a23nxCKji" +
//"NXZ4cgQNGOFDbEQvmUhU3mu257SZadGGHbsSCQfybyWCBUixqHgbtvXINZ3t+0Co" +
//"YTfwEhpfEGEUfV/8ChqI2s6qAX9oWm++Oz0Dr2ZTbpJ+FVQP/7WkaN/+54N+V/bx" +
//"EfvJ9qIUBzGIa0BnMWXAKGaopszvWRplPuodt3vFEg4IbtBSoHk26ZGoycB+E/Iv" +
//"iC5cKppzEhzFEALtmUdH659mFcTcszlipacD4xOShBhkfD2JbxpGWNvxqygLsn0f" +
//"CDTeqSGMc6xsQD65YZKoU/IxwC4zTT4GpEdIGLIpN0m/MvlGHUFpx27FytmXsppk" +
//"pra8D/rAehH2Samyj49YV2uY2FoGdLsWTbWTVJiDFPEriYeJByQArk+MGaHoBI3F" +
//"qo2HGvEFIbzXMBZ2addGLwcSFKRB3boanZcBbmIFmBeFnQKj5o59BxVGJjopwsBP" +
//"GP1Y1WDgocmw1IbVGjw/HK9Y4mvTvIn2AuXLh9PXGnH6ai1LXMcF9y9qwPrL4vc4" +
//"UZ1xNWdZk/y8f9y/JO67QYQthOXQuWILCPJEJU4psRa7Cn9MzIOgfOKuMa1CiIFw" +
//"HLbsSh627wPhDyoz7xJePiFLtdgbiMiFbcd4sBLhClTmS2J4xuOWvtC/R2fFVGHJ" +
//"mvUZV3Tbcm37VRw/zH36L0ZlbGr80af4UKB9fi6xWP1L4+a5sGNlHx+xAgLGMNBR" +
//"E1kv9oYP8zINEE5C2PeSwc+A3ihzX76uI/r1KRIQkgcEQxnsLAmC3gvMN/D4SPAN" +
//"Mlf1Y/0bAdG/e2fVv3sXgdWvq9Zuu72sZuqALwUWb8KRDe9X5GNBvY3AwYBKmdSP" +
//"sGfLN2xRC1es0cZVOsWmYscZk1/ccYgEm20k3pGU6f/DtZyy/YQ35QuZacl6/239" +
//"G+2BeqLhEPczTNAEPuy5aCsgbN8H/OslwVqGyUoVHwKEK7YXAipv2S0C4mSRi3u9" +
//"OvdpfrA6RFBl0vPOEIibJQC0IdtybfuVyTfuCLArgv0RsY/gVckqD9Ondz77utQy" +
//"blxe5n5lHh/WiFI2KMWoz3QG89U2DAw7gu6L1nBGVjXSmo/zReAPS71f20Ftb1iv" +
//"nthSziX+UoS1wfY6X1VWO67JV/XPn3yVmYsHPc8XDl+CN9+boZfhgtLk45rN+zDv" +
//"N+5Ly+Y0BCh2H+bpaHFhFFdu0n4VVo73Ovtm+PhckiXPI7ISljEcexMlOK+s48Na" +
//"QMCr8ohSnOAd3pGkvQrbi/NYT213YA78zqdfxwYSwvLPfP0tCdbqqOJwoDKOD6sp" +
//"hnlFzDPXiJck0pYvCdMBcPsdhXOAqEhXxcC3RDxLv5A57hXRIKJojEy7WPv/y5dz" +
//"Q+MmRD3v7t05DlTG8ZFIg7hzrL97Sr7bUZTvnjddMVoa6wdRMZpReWrJrk9HjgPl" +
//"hQPipODIccBxwHEgmANOQATzxV11HHAcEA44AeG6geOA40AoB5yACGWNu+E44DgQ" +
//"a6R8VDzODolLqoHoCmOZbbqw5/HVx1MSpKNcQpgH5Y+Xph/mLQoENyiPu/0aHod4" +
//"da7cdBuJqqx5gncpvgZtmzdToEcDYPPhnPnaIS5f9cMBCo/fD+csSL1fZss/2/5s" +
//  "my6qHv8fK/FOteyEQ1wAAAAASUVORK5CYII="
//        
//        
//    };
//console.log("called getInfo, scheduling info return for 2 seconds");
//    return setTimeout(function() {
//console.log("Returning info");
//        return success(storeInfo_dummy_data);
//        }, 2000);
        
    var url = MAM_STORE_INFO_URL;
    var params = {};
    console.log('about to call serverPost to : ' + url);
    return this.serverPost(url, params, success, fail);
  }
});