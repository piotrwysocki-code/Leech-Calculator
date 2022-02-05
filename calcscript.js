let lvlUpExp = [];
let totalexp = [];
let players = [];
let history = [];
const infoUrl = "https://maplelegends.com/api/character?name=";

historyRecord = class {
  constructor(id, startLvl, startExp, endLvl, endExp, expGained, total) {
    this.id = id;
    this.startLvl = startLvl;
    this.startExp = startExp;
    this.endLvl = endLvl;
    this.endExp = endExp;
    this.expGained = expGained;
    this.total = total;

  }
}

Player = class {
  constructor(id, name, guild, level, job, exp) {
    this.id = id;
    this.name = name;
    this.guild = guild;
    this.level = level;
    this.job = job;
    this.exp = exp;
  }
}

$(document).ready(function() {
  $.ajax({
    type: "GET",
    url: "exptable.csv",
    dataType: "text",
    success: function(data) {
      showExpTable(data);
    }
  });

  if ($('input:radio[name=ratetype]').is(':checked') === false) {
    $('input:radio[name=ratetype]').filter('[value=exp]').prop('checked', true);
  }

  searchIgn();

  window.addEventListener('resize', responsiveAvatar);

  let input = document.getElementById("search-ign-input");
  input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("search-ign-input-btn").click();
    }
  });

  $("#perhour").click(() => {
    $("#rateinputbox").html(`
      <table>
        <tr>
          <td>
            <input id="eph" name="hourly" type="number" placeholder="EPH"></input>
          </td>
        </tr>
        <tr>
          <td>
            <input id="price" name="price" type="number" placeholder="Price /hr"></input>
          </td>
        </tr>
      </table>
    `);
    if (!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')) {
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + endExp) / eph * price
      `);
    } else if ($("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / eph * price
      `);
    } else if (!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + expToLvl[endLvl] * (endPct/100)) / eph * price
      `);
    } else {
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + endExp) / eph * price
      `);
    }
  });

  $("#perexp").click(() => {
    $("#rateinputbox").html(`
      <label for="perexp">1 meso per</label>
      <input id="rate" name="perexp" type="number" style="width:40px;"></input> exp
    `);
    if (!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')) {
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + endExp) / rate
      `);
    } else if ($("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / rate
      `);
    } else if (!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + expToLvl[endLvl] * (endPct/100)) / rate
      `);
    } else {
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + endExp) / rate
      `);
    }
  });

  $("#endpercent").click(() => {
    if ($("#perexp").is(':checked')) {
      if (!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')) {
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + endExp) / rate
        `);
      } else if ($("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / rate
        `);
      } else if (!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + expToLvl[endLvl] * (endPct/100)) / rate
        `);
      } else {
        $("#formula").text(`

          Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + endExp) / rate
        `);
      }
    } else {
      if (!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')) {
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + endExp) / eph * price
        `);
      } else if ($("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / eph * price
        `);
      } else if (!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + expToLvl[endLvl] * (endPct/100)) / eph * price
        `);
      } else {
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + endExp) / eph * price
        `);
      }
    }
  });
});

/* end of doc.ready */
calculate = () => {
  let startlvl = parseFloat($("#startlvl").val());
  let startexp = $("#startexp").val() ? parseFloat($("#startexp").val()) : 0;
  let endlvl = parseFloat($("#endlvl").val());
  let endexp = $("#endexp").val() ? parseFloat($("#endexp").val()) : 0;
  let totalexpstart = parseFloat(totalexp[startlvl]);
  let totalexpend = parseFloat(totalexp[endlvl]);
  let total = 0;
  let expGained = 0;

  if (startlvl > 0 && startlvl < 201) {
    if (endlvl < 201 && endlvl > 0) {
      if ($("#perexp").is(':checked')) {
        if (parseFloat($("#rate").val()) > 0) {
          let rate = parseFloat($("#rate").val());
          expGained = 0;
          if (startexp !== 0) {
            if ($("#startpercent").is(':checked')) {
              startexp = lvlUpExp[startlvl] * (startexp / 100);
            }
          }
          if ($("#endpercent").is(':checked')) {
            endexp = lvlUpExp[endlvl] * (endexp / 100);
          }
          expGained = totalexpend - totalexpstart;
          expGained -= startexp;
          expGained += endexp;
          total = expGained / rate;

          $("#total").html(`<u>${formatNum(total.toFixed(2))}</u>`);
          $("#expgained").html(`Total exp: ${formatNum(expGained.toFixed(2))}`);
          let record = new historyRecord(history.length > 0 ? history.at(-1).id + 1 : 0,
            startlvl, startexp, endlvl, endexp, expGained, total);
          history.push(record);
          refreshHistory();
        } else {
          alert("Rate should be greater than 0");
        }
      } else {
        if ($("#eph").val()) {
          if ($("#price").val()) {
            let eph = parseFloat($("#eph").val());
            let price = parseFloat($("#price").val());
            expGained = 0;
            let duration = 0;
            if (startexp !== 0) {
              if ($("#startpercent").is(':checked')) {
                startexp = lvlUpExp[startlvl] * (startexp / 100);
              }
            }
            if ($("#endpercent").is(':checked')) {
              endexp = lvlUpExp[endlvl] * (endexp / 100);
            }
            expGained = totalexpend - totalexpstart;
            expGained -= startexp;
            expGained += endexp;
            duration = expGained / eph;
            total = (expGained / eph) * price;
            $("#total").html(`<u>${formatNum(total.toFixed(2))}</u>`);
            $("#expGained").html(`Total exp: ${formatNum(expGained.toFixed(2))}<br>
                Estimated duration: ${formatNum(duration.toFixed(2))} hrs`);
            let record = new historyRecord(history.length > 0 ? history.at(-1).id + 1 : 0,
              startlvl, startexp, endlvl, endexp, expGained, total);
            history.push(record);
            refreshHistory();
          } else {
            alert("Enter price");
          }
        } else {
          alert("Enter eph");
        }
      }
    } else {
      alert("Missing or invalid level. Pick a level 1-200.");
    }
  } else {
    alert("Missing or invalid level. Pick a level 1-200.");
  }
}

searchIgn = () => {
  let ign = $("#search-ign-input").val();
  $.ajax({
    type: "GET",
    url: `${infoUrl}${ign}`,
    dataType: "JSON",
    success: function(data) {
      if (typeof data.name !== 'undefined') {
        let p = new Player(players.length > 0 ? players.at(-1).id + 1 : 0,
          data.name, data.guild, data.level, data.job, data.exp);
        players.push(p);
        $("#roster-box-players").html("");
        refreshLogs();
      } else {
        $("#search-ign-input").css('border', '1px solid red');
        $("#search-ign-input").css('border-right', 'none');
        $("#search-ign-input-btn").css('border', '1px solid red');
        $("#search-ign-input-btn").css('border-left', 'none');
        $("#search-ign-input").val("Player not found");
      }
    }
  });
}

showExpTable = (data) => {
  let expTable = []
  let values = "";
  let lvls = [];
  let count = 0;
  for (i = 0; i < data.length; i++) {
    if (data[i] === "\r" || data[i] === "\n" || data[i] === "") {
      expTable[i] = values;
      values = "";
    } else {
      values += data[i];
    }
  }
  expTable = expTable.filter(function(element) {
    return element !== undefined;
  });
  expTable = expTable.filter(function(entry) {
    return /\S/.test(entry);
  });
  for (i = 0; i < expTable.length; i++) {
    let row = expTable[i].split(',');
    lvls.push(row[0]);
    lvlUpExp.push(row[1]);
    totalexp.push(row[2]);
    let level = formatNum(row[0]);
    let exptolvl = formatNum(row[1]);
    let total = formatNum(row[2]);
    $("#exptable").append(`
      <tr class="exptable-row">
        <td class="exptable-td">${level}</td>
        <td class="exptable-td">${exptolvl}</td>
        <td class="exptable-td">${total}</td>
      </tr>
    `);
  }
}

deleteLog = (item) => {
  let val = $(item).attr('value');
  $(item).parent().parent().parent().remove();
  players.forEach(elem => {
    if (elem.id == val) {
      players.splice(players.indexOf(elem), 1);
    }
  });
}

deleteRecord = (item) => {
  let val = $(item).attr('value');
  $(item).parent().parent().remove();
  history.forEach(elem => {
    if (elem.id == val) {
      history.splice(history.indexOf(elem), 1);
    }
  });
}

refreshHistory = () => {
  $("#history-record-box").html("");
  history.forEach(item => {
    $("#history-record-box").append(`
    <div class="history-record-item">
      <div class="history-record-info">
        <span class="history-start"> Lvl: ${item.startLvl}</span>, Exp: ${formatNum(item.startExp.toFixed(2))}
        - <span class="history-end">Lvl: ${item.endLvl}</span>, Exp: ${formatNum(item.endExp.toFixed(2))}
        <div class="totals">
            <span class="expGained">Total exp: ${formatNum(item.expGained.toFixed(2))}</span>
            <span class="mesosTotal"><img class="totalMesoImg" src="imgs/meso.png"> ${formatNum(item.total.toFixed(2))}</span>
         </div>
        </div>
      <div class="delete-record-box">
        <button class="delete-record-btn" onclick="deleteRecord(this)" value="${item.id}">x</button>
      </div>
    </div>
    `);
  });
}

refreshLogs = () => {
  let avatarUrl = "https://maplelegends.com/api/getavatar?name=";
  let jobImg = "https://maplelegends.com/static/images/rank/";
  let lvlUrl = "https://maplelegends.com/levels?name=";
  let guildUrl = "https://maplelegends.com/ranking/guildmembers?search=";
  if (players.length > 0) {
    players.forEach(item => {
      $("#roster-box-players").append(`
      <div class="roster-player">
          <div class="roster-player-avatar-box">
            <img class="roster-player-avatar" src="${avatarUrl}${item.name}">
          </div>
          <table class="roster-player-profile">
            <tr>
              <td class="roster-player-name ">${item.name}</td>
              <td class="roster-player-level">Lv.
               ${item.level}</td>
            </tr>
              <td class="roster-player-guild">${item.guild}</td>
              <td class="roster-player-job"><div id="roster-player-job-box">${item.job}
              <img id="job-img" src="https://maplelegends.com/static/images/rank/magician.png"></div></td>
            </tr>
            <tr>
              <td class="roster-player-start-time">
                <img class="clock-icon" src="imgs/clock.svg"><span>${new Date(new Date().getTime()).toLocaleTimeString().replace(/(.*)\D\d+/, '$1')}</span>
              </td>
              <td class="roster-player-exp"><span class="player-exp-bar">${item.exp}</span></td>
            </tr>
          </table>
          <div class="roster-player-btn-box">
            <div class="roster-player-finalize-btn">
              <button class="finalize-btn" onclick="finalize(${item.id})">Finalize</button>
            </div>
            <div class="roster-player-x-btn">
              <button class="delete-log-btn" onclick="deleteLog(this)" value="${item.id}">x</button>
            </div>
         </div>
      </div>
      `);
    });
  } else {
    $("#roster-box-players").html("");
  }
}

filterTable = () => {
  console.log("hello");
  let input = $("#searchlvl").val();
  let rows = $('.exptable-row').get();
  for (i = 0; i < rows.length; i++) {
    td = rows[i].getElementsByClassName('exptable-td')[0];
    if (input) {
      if (td) {
        value = td.textContent || td.innerText;
        if (value === input || new String(value).valueOf() == new String("Level").valueOf()) {
          rows[i].style.display = "";
        } else {
          rows[i].style.display = "none";
        }
      }
    } else {
      rows[i].style.display = "";
    }
  }
}

finalize = (id) => {
  let player = {};
  players.forEach(elem => {
    if (elem.id == id) {
      player = elem;
      $("#player-name").val(elem.name);
      $("#startlvl").val(elem.level);
      $("#startexp").val(parseFloat(elem.exp.slice(0, -1)));
      $("#startpercent").prop('checked', true);
    }
  })
  $.ajax({
    type: "GET",
    url: `${infoUrl}${player.name}`,
    dataType: "JSON",
    success: function(data) {
      $("#endlvl").val(data.level);
      $("#endexp").val(parseFloat(data.exp.slice(0, -1)));
      $("#endpercent").prop('checked', true);
    }
  });
}

responsiveAvatar = () => {
  let box1 = document.querySelector('#roster-box-players');
  let width1 = box1.offsetWidth;
  let box2 = document.querySelector('body');
  let width2 = box2.offsetWidth;

  if (width1 < 510) {
    $(".roster-player-avatar-box").css('display', 'none');
    $(".roster-player-profile").css('width', '75%');

  } else {
    $(".roster-player-avatar-box").css('display', 'flex');
  }
}

clearLogs = () => {
  players = [];
  console.log(players.length);
  refreshLogs();
}

clearHistory = () => {
  history = [];
  console.log(history.length);
  refreshHistory();
}

formatNum = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
