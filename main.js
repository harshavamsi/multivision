  var config = {
      apiKey: "AIzaSyD7M3lReAFhKUwsjrkxA_v4amWkwq8gOCo",
      databaseURL: "https://multu-62bc1.firebaseio.com/",
  };
  var monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
  ];
  firebase.initializeApp(config);
  var obj1 = {}
  var dbref = firebase.database().ref('user-data');
  dbref.once('value').then(function(snapshot) {
      obj1 = snapshot.val();
      var keyNames = Object.keys(obj1);
      var reA = /[^a-zA-Z]/g;
      var reN = /[^0-9]/g;

      function sortAlphaNum(a, b) {
          var aA = a.replace(reA, "");
          var bA = b.replace(reA, "");
          if (aA === bA) {
              var aN = parseInt(a.replace(reN, ""), 10);
              var bN = parseInt(b.replace(reN, ""), 10);
              return aN === bN ? 0 : aN > bN ? 1 : -1;
          } else {
              return aA > bA ? 1 : -1;
          }
      }
      var newarr = keyNames.sort(sortAlphaNum);
      var total_cards = Object.keys(obj1).length;
      $('#total_cards').html(total_cards)
      for (var i = 0; i < Object.keys(obj1).length; i++) {
          var val = obj1[newarr[i]]
          $('#user-data').append("<tr id='" + newarr[i] + "'><td contenteditable='true' class='changeable card' >" + val["card-number"] + "</td><td class='changeable name' contenteditable='true' >" + val["name-address"] + "</td><td class='changeable package' contenteditable='true'>" + val["package"] + "</td><td class='changeable phone' contenteditable='true'>" + val["phone-number"] + "</td><td class='changeable box' contenteditable='true'>" + val["stb-number"] + "</td></tr>")
      }
      var brf = firebase.database().ref('recents/')
      var balance_cards = 0
      brf.once('value').then(function(snapshot) {
          var newobj = snapshot.val();
          var keyNames = Object.keys(newobj);
          var exc_arr = [];
          for (var i = 0; i < keyNames.length; i++) {
              var d = new Date();
              var curr_month = monthNames[d.getMonth()];
              if (newobj[keyNames[i]]["date"]["month"] == curr_month)
                  exc_arr.push(keyNames[i]);
          }
          for (var i = 0; i < exc_arr.length; i++) {
              var index = newarr.indexOf(exc_arr[i]);
              console.log(index)
              newarr.splice(index, 1);
          }
          balance_cards = newarr.length;
          $('#balance_cards').html(balance_cards)
      })
      var contents = ""
      var newc = ""
      $(".changeable").focus(function() {
          contents = $(this).html();
      });
      $('.changeable').blur(function() {
          newc = $(this).html();
          if (contents != $(this).html()) {
              typex = $(this).attr('class');
              var type = typex.replace("changeable ", "");
              content = $(this).html();
              var card = $(this).parent().attr('id');
              if (type == "card") {
                  var child = dbref.child(card);
                  child.once('value', function(snapshot) {
                      dbref.child(content).set(snapshot.val());
                      child.remove();
                  });
                  firebase.database().ref('user-data/' + content).update({
                      'card-number': content,
                  });
                  $(this).parent().attr('id', content)
              } else if (type == "name") {

                  firebase.database().ref('user-data/' + card).update({
                      'name-address': content,
                  });

              } else if (type == "package") {
                  firebase.database().ref('user-data/' + card).update({
                      'package': content,
                  });

              } else if (type == "phone") {
                  firebase.database().ref('user-data/' + card).update({
                      'phone-number': content,
                  });

              } else if (type == "box") {
                  firebase.database().ref('user-data/' + card).update({
                      'stb-number': content,
                  });

              }
              $.notify({
                  icon: 'pe-7s-bell',
                  message: "<h5><b>Data successfully changed!</b></h5>"
              }, {
                  type: 'danger',
                  timer: 100
              });
          }
      });


  });

  $('table').keypress(function(evt) {
      if (evt.which == 13) {
          event.preventDefault();

      }
  })
  var obj2 = {}

  function search() {
      $("#history-data tr").remove();
      var query = $('#search-value').val()
      firebase.database().ref('/payments/' + query).once('value').then(function(snapshot) {
          obj2 = snapshot.val();
          if (obj2 == null) {
              $("#nohistory").show();
              $("#history_total_amount").hide();
          } else {
              $("#nohistory").hide();
              $("#history_total_amount").show();
          }
          var history_total_amount = 0;
          var keyNames = Object.keys(obj2);
          var arr = []
          for (var i = 0; i < keyNames.length; i++) {
              arr.push(obj2[keyNames[i]])
          }
          var newarr = _.sortBy(arr, 'jsdate')
          var newnewarr = newarr.reverse();
          for (var i = 0; i < newarr.length; i++) {
              history_total_amount += newnewarr[i]["amount"];
              $('#history-data').prepend("<tr id=''><td class='' >" + newnewarr[i]["date"] + "</td><td class=''>" + newnewarr[i]["amount"] + "</td></tr>")
          }
          $('#history_total_amount').html("Amount - Rs." + history_total_amount)
      })

  }

  var d = new Date();
  var today_day = d.getDate();
  var today_year = d.getFullYear();
  var today_month = monthNames[d.getMonth()];
  var y = new Date(d);
  y.setDate(d.getDate() - 1);
  var yesterday_day = y.getDate();
  var yesterday_year = y.getFullYear();
  var yesterday_month = monthNames[y.getMonth()];
  var obj = {}

  function createArray(length) {
      var arr = new Array(length || 0),
          i = length;

      if (arguments.length > 1) {
          var args = Array.prototype.slice.call(arguments, 1);
          while (i--) arr[length - 1 - i] = createArray.apply(this, args);
      }

      return arr;
  }
  var rf = firebase.database().ref('yearly-payments/' + today_year + "/" + today_month + "/" + today_day)
  var today_total_cards = 0;
  var today_total_amount = 0;
  var yesterday_total_cards = 0;
  var yesterday_total_amount = 0;
  var initial = false;
  var newref1 = firebase.database().ref('yearly-issues/plan-change/' + today_year + "/" + today_month + "/" + today_day)
  var newref2 = firebase.database().ref('yearly-issues/not-working/' + today_year + "/" + today_month + "/" + today_day)
  var newref3 = firebase.database().ref('yearly-issues/add-on/' + today_year + "/" + today_month + "/" + today_day)
  var newref4 = firebase.database().ref('yearly-issues/deactivate/' + today_year + "/" + today_month + "/" + today_day)
  rf.on('child_added', function(data) {
      if (!initial) return;
      today_total_cards++;
      var obj = data.val()
      var keyNames = Object.keys(obj);
      var real = obj[keyNames[0]]
      today_total_amount += real["amount"]
      $('#today-data').prepend("<tr id=''><td class='' >" + real["card-number"] + "</td><td class=''>" + 'Rs.' + real["amount"] + "</td></tr>")
      $('#today_total_amount').html("Amount - Rs." + today_total_amount)
      $('#today_total_cards').html("Cards - " + today_total_cards)
      $.notify({
          icon: 'pe-7s-bell',
          message: "<h5><b>New card collected!</b></h5>"
      }, {
          type: 'danger',
          timer: 100
      });
  });
  rf.once('value', function(data) {
      initial = true;
      var obj = data.val()
      if (obj != null) {
          $('#noyesterdaydata').hide();
          var keyNames = Object.keys(obj);
          var valkeyNames = createArray(keyNames.length, 0)
          for (var i = 0; i < Object.keys(obj).length; i++) {
              val = obj[keyNames[i]];
              var valkeyNamesx = Object.keys(val);
              for (var k = 0; k < Object.keys(val).length; k++) {
                  today_total_cards++;
                  if (!valkeyNames[i].includes(valkeyNamesx[k])) {
                      valkeyNames[i].push(valkeyNamesx[k])
                      val2 = val[valkeyNames[i][k]]
                      today_total_amount += val2["amount"]
                      $('#today-data').prepend("<tr id='" + valkeyNames[i][k] + "'><td class='' >" + val2["card-number"] + "</td><td class=''>" + 'Rs.' + val2["amount"] + "</td></tr>")
                  }
              }
          }
          $('#today_total_amount').html("Amount - Rs." + today_total_amount)
          $('#today_total_cards').html("Cards - " + today_total_cards)
      }

  });



  var initial1 = false
  var initial2 = false
  var initial3 = false
  var initial4 = false

  newref1.on('child_added', function(data) {
      if (!initial1) return;
      $.notify({
          icon: 'pe-7s-bell',
          message: "<h5><b>New issue!</b></h5>"
      }, {
          type: 'danger',
          timer: 100
      });

  });
  newref1.once('value', function(data) {
      console.log(data.val())
      initial1 = true;
  });
  newref2.on('child_added', function(data) {
      if (!initial2) return;
      $.notify({
          icon: 'pe-7s-bell',
          message: "<h5><b>New issue!</b></h5>"
      }, {
          type: 'danger',
          timer: 100
      });

  });
  newref2.once('value', function(data) {
      console.log(data.val())
      initial2 = true;
  });
  newref3.on('child_added', function(data) {
      if (!initial3) return;
      $.notify({
          icon: 'pe-7s-bell',
          message: "<h5><b>New issue!</b></h5>"
      }, {
          type: 'danger',
          timer: 100
      });

  });
  newref3.once('value', function(data) {
      console.log(data.val())
      initial3 = true;
  });
  newref4.on('child_added', function(data) {
      if (!initial4) return;
      $.notify({
          icon: 'pe-7s-bell',
          message: "<h5><b>New issue!</b></h5>"
      }, {
          type: 'danger',
          timer: 100
      });

  });
  newref4.once('value', function(data) {
      console.log(data.val())
      initial4 = true;
  });

  firebase.database().ref('yearly-payments/' + yesterday_year + "/" + yesterday_month + "/" + yesterday_day).on('value', function(snapshot) {
      obj = snapshot.val();
      var val;
      if (obj != null) {
          $('#noyesterdaydata').hide();
          var keyNames = Object.keys(obj);
          var valkeyNames = createArray(keyNames.length, 0)
          for (var i = 0; i < Object.keys(obj).length; i++) {
              val = obj[keyNames[i]];
              var valkeyNamesx = Object.keys(val);
              for (var k = 0; k < Object.keys(val).length; k++) {
                  yesterday_total_cards++;
                  if (!valkeyNames[i].includes(valkeyNamesx[k])) {
                      valkeyNames[i].push(valkeyNamesx[k])
                      val2 = val[valkeyNames[i][k]]
                      yesterday_total_amount += val2["amount"]
                      $('#yesterday-data').prepend("<tr id='" + valkeyNames[i][k] + "'><td class='' >" + val2["card-number"] + "</td><td class=''>" + 'Rs.' + val2["amount"] + "</td></tr>")
                  }
              }
          }
          $('#yesterday_total_amount').html("Amount - Rs." + yesterday_total_amount)
          $('#yesterday_total_cards').html("Cards - " + yesterday_total_cards)
      } else {
          $('#yesterday-data').prepend("<h3 class='text-center' id='noyesterdaydata'>No data!</h3>")
      }

      // }
  });
