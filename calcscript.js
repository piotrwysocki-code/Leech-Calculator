const lvlUpExp = [];
const totalexp = [];
const formulaString = "Formula: (((endLvl totalExp - startLvl totalExp)";
let isHourlyRate = true;
let players = JSON.parse(localStorage.getItem("players")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let totalGain = JSON.parse(localStorage.getItem("total-gain")) || 0.00;
let totalLoss = JSON.parse(localStorage.getItem("total-loss")) || 0.00;
const infoUrl = "https://maplelegends.com/api/character?name=";
const oddJobs = ["Beginner", "Islander"];
const warriorJobs = ["Hero", "Dark Knight", "Paladin", "Spearman", "Warrior",
  "Fighter", "Page", "Crusader", "White Knight"
];
const pirateJobs = ["Pirate", "Brawler", "Marauder", "Buccaneer", "Gunslinger",
  "Outlaw", "Corsair"
];
const bowmanJobs = ["Bowman", "Hunter", "Ranger", "Bowmaster", "Crossbowman",
  "Sniper", "Marksman"
];
const thiefJobs = ["Thief", "Assassin", "Bandit", "Hermit", "Chief Bandit", "Night Lord", "Shadower"];
const magicianJobs = ["Bishop", "Archmage (Ice/Lightning)", "Archmage (Fire/Poison)",
  "Cleric", "Priest", "Wizard (Fire/Poison)", "Wizard (Ice/Lightning)",
  "Mage (Fire/Poison)", "Mage (Ice/Lightning)"
];

historyRecord = class {
  constructor(id, date, time, playerName, startLvl, startExp, endLvl, endExp, expGained, total, type) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.playerName = playerName;
    this.startLvl = startLvl;
    this.startExp = startExp;
    this.endLvl = endLvl;
    this.endExp = endExp;
    this.expGained = expGained;
    this.total = total;
    this.type = type;
  }
}

Player = class {
  constructor(id, name, date, guild, level, job, exp) {
    this.id = id;
    this.name = name;
    this.date = date;
    this.guild = guild;
    this.level = level;
    this.job = job;
    this.exp = exp;
  }
}

$(document).ready(function() {
  /*$("#loading").hide();
  $("#success").hide();
  $("#error").hide();
  $("#loading-end").hide();
  $("#success-end").hide();
  $("#error-end").hide();
  $("#success-start").hide();*/

  $.ajax({
    type: "GET",
    url: "exptable.csv",
    dataType: "text",
    success: function(data) {
      showExpTable(data);
    }
  });

  refreshHistory();
  refreshLogs();


  if (players.length == 0) {
    $("#search-ign-input").val("srslyguys");
    $("#search-ign-input-btn").click();
    $("#search-ign-input").val("");
  }


  let input = document.getElementById("search-ign-input");
  input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("search-ign-input-btn").click();
    }
  });

  $("#export-csv-btn").click(() => {
    let dateObj = new Date();
    let csvContent = "data:text/csv;charset=utf-8,";
    //convert array of objects to JSON stringify
    let temp = JSON.stringify(history);
    csvContent += "id,date,time,ign,startlvl,startexp,endlvl,endexp,expgained,cost,isProfit\n";
    //convert the json string to a csv and add to content
    csvContent += ConvertToCSV(temp);
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    //setting encoded URI
    link.setAttribute("href", encodedUri);
    //setting a customer file name
    link.setAttribute("download",
      `history_${dateObj.getDate()}-${parseInt(dateObj.getMonth()) + 1}-${dateObj.getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
  });

  $("#rate-type").click(() => {
    isHourlyRate = !isHourlyRate;
    console.log(isHourlyRate);
    $("#total-exp").remove();
    if (isHourlyRate) {
      $("#total-exp").html("");
      $("#total").html("");
      $("#rateinputbox").html(`
          <input id="eph" name="hourly" type="number" placeholder="EPH"></input>
          <input id="price" name="price" type="number" placeholder="Price /hr"></input>
      `);
      if (!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')) {
        $("#formula").text(`
          ${formulaString} - startExp) + endExp) / eph * price
        `);
      } else if ($("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
        $("#formula").text(`
          ${formulaString} - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / eph * price
        `);
      } else if (!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
        $("#formula").text(`
          ${formulaString} - startExp) + expToLvl[endLvl] * (endPct/100)) / eph * price
        `);
      } else {
        $("#formula").text(`
          ${formulaString} - expToLvl[startLvl] * (startPct/100)) + endExp) / eph * price
        `);
      }
    } else {
      $("#total-exp").html("");
      $("#total").html("");
      $("#rateinputbox").html(`
        <span id="per-exp-input">
          <label for="perexp">1 meso per</label>
          <input id="rate" name="perexp" type="number" min="0">
          <label id="rate-label">exp</label>
        </span>
      `);
      if (!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')) {
        $("#formula").text(`
          ${formulaString} - startExp) + endExp) / rate
        `);
      } else if ($("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
        $("#formula").text(`
          ${formulaString} - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / rate
        `);
      } else if (!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
        $("#formula").text(`
          ${formulaString} - startExp) + expToLvl[endLvl] * (endPct/100)) / rate
        `);
      } else {
        $("#formula").text(`
          ${formulaString} - expToLvl[startLvl] * (startPct/100)) + endExp) / rate
        `);
      }
    }
  });

  $("#endpercent").click(() => {
    checkFields();
  });

  $("#startpercent").click(() => {
    checkFields();
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
      if (endlvl >= startlvl) {
        if (isHourlyRate === false) {
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
            $("#total").html(`${formatNum(total.toFixed(2))}`);
            $("#total-exp").remove();
            $("#outputbox").append(`<p id="total-exp"></p>`);
            $("#total-exp").html(`Total exp: ${formatNum(expGained.toFixed(2))}`);
            let dateObj = new Date();
            let record = new historyRecord(history.length > 0 ? history.at(-1).id + 1 : 0,
              `${dateObj.getDate()}/${parseInt(dateObj.getMonth()) + 1}/${dateObj.getFullYear()}`, //extract the day/month/year from the date object
              `${new Date(dateObj.getTime()).toLocaleTimeString().replace(/(.*)\D\d+/, '$1')}`, //extract the time from the date object
              $("#player-ign").val() ? $("#player-ign").val() : null, startlvl,
              startexp, endlvl, endexp, expGained, total, $("#trans-type")[0].checked);
            history.push(record);
            console.log(history);
            localStorage.setItem('history', JSON.stringify(history));
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
              if (endexp !== 0) {
                if ($("#endpercent").is(':checked')) {
                  endexp = lvlUpExp[endlvl] * (endexp / 100);
                }
              }
              expGained = totalexpend - totalexpstart;
              expGained -= startexp;
              expGained += endexp;
              duration = expGained / eph;
              total = (expGained / eph) * price;
              $("#total").html(`${formatNum(total.toFixed(2))}`);
              $("#total-exp").remove();
              $("#outputbox").append(`<p id="total-exp"></p>`);
              $("#total-exp").html(`Total exp: ${formatNum(expGained.toFixed(2))}<br>
                  Estimated duration: ${formatNum(duration.toFixed(2))} hrs`);
              let dateObj = new Date();
              let record = new historyRecord(history.length > 0 ? history.at(-1).id + 1 : 0,
                `${dateObj.getDate()}/${parseInt(dateObj.getMonth()) + 1}/${dateObj.getFullYear()}`, //extract the day/month/year from the date object
                `${new Date(dateObj.getTime()).toLocaleTimeString().replace(/(.*)\D\d+/, '$1')}`, //extract the time from the date object
                $("#player-ign").val() ? $("#player-ign").val() : null, startlvl,
                startexp, endlvl, endexp, expGained, total, $("#trans-type")[0].checked);
              $("#player-ign").val("");
              history.push(record);
              localStorage.setItem('history', JSON.stringify(history));
              refreshHistory();
            } else {
              alert("Enter price");
            }
          } else {
            alert("Enter eph");
          }
        }
      } else {
        alert("Missing or invalid level. Start level should be less than or equal to end level.");
      }
    } else {
      alert("Missing or invalid level. Pick a level 1-200.");
    }
  } else {
    alert("Missing or invalid level. Pick a level 1-200.");
  }
}

ConvertToCSV = (objArray) => {
  let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  let str = '';
  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (let index in array[i]) {
      if (line != '') line += ','
      line += array[i][index];
    }
    str += line + '\r\n';
  }
  return str;
}

searchIgn = () => {
  let ign = $("#search-ign-input").val();
  $.ajax({
    type: "GET",
    url: `${infoUrl}${ign}`,
    dataType: "JSON",
    beforeSend: function() {
      /*$("#roster-box-players").append(`<img id="loading" src="imgs/hungry2.gif">`);*/
      $("#loading").show(1000);
    },
    success: function(data) {
      console.log(data.name);
      if (typeof data.name !== 'undefined') {
        $("#success").show("fast");
        let dateObj = new Date();
        console.log(dateObj);
        let p = new Player(players.length > 0 ? players.at(-1).id + 1 : 0,
          data.name, dateObj, data.guild, data.level, data.job, data.exp);
        console.log(players);
        players.push(p);
        console.log(players);
        localStorage.setItem("players", JSON.stringify(players));
        refreshLogs();
        console.log(players);
        setTimeout(() => {
          $("#success").hide("slow");
        }, 2000)
      } else {
        $("#search-ign-input").css('color', 'red');
        $("#search-ign-input").val("Player not found");
        $("#error").show();
        setTimeout(() => {
          $("#error").hide("slow");
          $("#search-ign-input").css('color', 'black');
          $("#search-ign-input").val("");
        }, 2000)
      }
    },
    error: function() {
      $("#loading").hide();
      $("#error").show("fast");
      setTimeout(() => {
        $("#error").hide("slow");
      }, 2000)
    },
    complete: function() {
      $("#loading").hide();
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
  if (window.localStorage) {
    localStorage.setItem("players", JSON.stringify(players));
  }
}

deleteRecord = (item) => {
  let val = $(item).attr('value');
  $(item).parent().parent().remove();
  history.forEach(elem => {
    if (elem.id == val) {
      history.splice(history.indexOf(elem), 1);
      if (elem.type === true) {
        totalGain -= elem.total;
      } else {
        totalLoss -= elem.total;
      }
    }
  });
  $("#total-loss").html(`${formatNum(totalLoss.toFixed(2))}`);
  $("#total-gain").html(`${formatNum(totalGain.toFixed(2))}`);
  if (window.localStorage) {
    localStorage.setItem("history", JSON.stringify(history));
    localStorage.setItem("total-loss", JSON.stringify(totalLoss));
    localStorage.setItem("total-gain", JSON.stringify(totalGain));
  }
}

refreshHistory = () => {
  $("#history-record-box").html("");
  totalGain = 0;
  totalLoss = 0;
  if (history.length > 0) {
    history.forEach(item => {
      $("#history-record-box").append(`
        <div class="history-record-item">
          <div class="history-record-info">
            <span class="history-start"> Lvl: ${item.startLvl}</span>, Exp: ${formatNum(item.startExp.toFixed(2))}
            - <span class="history-end">Lvl: ${item.endLvl}</span>, Exp: ${formatNum(item.endExp.toFixed(2))}
            <hr class="history-record-hr">
            <div class="totals">
                <span class="expGained">Total exp: ${formatNum(item.expGained.toFixed(2))}</span>
                <span class="mesosTotal" style="${item.type == true ? "color: green;" : "color: red;"}">
                  <img class="totalMesoImg" src="imgs/meso.png">
                  ${item.type == true ? "+" : "-"} ${formatNum(item.total.toFixed(2))}
                </span>
             </div>
             <hr class="history-record-hr">
             <div class="history-record-footer-info">
               <div class="date-box">
                ${item.date} - ${item.time}
               </div>
               <div class="ign-box">
                ${item.playerName !== null ? item.playerName : ""}
               </div>
             </div>
          </div>
          <div class="delete-record-box">
            <button class="delete-record-btn" onclick="deleteRecord(this)" value="${item.id}">x</button>
          </div>
        </div>
        `);
      if (item.type == true) {
        totalGain += item.total;
      } else {
        totalLoss += item.total;
      }
    });
    $("#total-loss").html(`${formatNum(totalLoss.toFixed(2))}`);
    $("#total-gain").html(`${formatNum(totalGain.toFixed(2))}`);
  }
}

refreshLogs = () => {
  let avatarUrl = "https://maplelegends.com/api/getavatar?name=";
  let jobImg = "https://maplelegends.com/static/images/rank/";
  let lvlUrl = "https://maplelegends.com/levels?name=";
  let guildUrl = "https://maplelegends.com/ranking/guildmembers?search=";
  $("#roster-box-players").html("");
  if (players.length > 0) {
    let arrLen = players.length;
    players.forEach(item => {
      if (item.job === "Islander") {
        jobImg = "https://maplelegends.com/static/images/rank/islander.png";
      } else if (item.job === "Beginner") {
        jobImg = "https://maplelegends.com/static/images/rank/beginner.png";
      } else if (warriorJobs.includes(item.job)) {
        jobImg = "https://maplelegends.com/static/images/rank/warrior.png";
      } else if (pirateJobs.includes(item.job)) {
        jobImg = "https://maplelegends.com/static/images/rank/pirate.png";
      } else if (thiefJobs.includes(item.job)) {
        jobImg = "https://maplelegends.com/static/images/rank/thief.png";
      } else if (magicianJobs.includes(item.job)) {
        jobImg = "https://maplelegends.com/static/images/rank/magician.png";
      } else if (bowmanJobs.includes(item.job)) {
        jobImg = "https://maplelegends.com/static/images/rank/bowman.png";
      } else {
        jobImg = "https://maplelegends.com/static/images/rank/all.png";
      }
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
                <img id="job-img" src="${jobImg}"></div></td>
              </tr>
              <tr>
                <td class="roster-player-start-time">
                  <span>${new Date(new Date(item.date).getTime()).toLocaleTimeString().replace(/(.*)\D\d+/, '$1')}</span>
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

  !$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')

finalize = (id) => {
  let player = {};

  players.forEach(elem => {
    if (elem.id == id) {
      player = elem;
      $("#player-id").val(elem.id);
      $("#startlvl").val(elem.level);
      $("#startexp").val(parseFloat(elem.exp.slice(0, -1)));
      if (!$("#startpercent").is(':checked')) {
        $("#startpercent").click();
      }
      $("#player-ign").val(`${elem.name}`);
      $("#startlvl").animate({
        backgroundColor: "#0DD700"
      }, "fast");
      $("#startexp").animate({
        backgroundColor: "#0DD700"
      }, "fast");
      $("#player-ign").animate({
        backgroundColor: "#0DD700"
      }, "fast");

      $("#startlvl").animate({
        backgroundColor: "#FFFFFF"
      }, "fast");
      $("#startexp").animate({
        backgroundColor: "#FFFFFF"
      }, "fast");
      $("#player-ign").animate({
        backgroundColor: "#FFFFFF"
      }, "fast");
    }
  });

  $.ajax({
    type: "GET",
    url: `${infoUrl}${player.name}`,
    dataType: "JSON",
    success: function(data) {
      console.log(data);
      $("#endlvl").val(data.level);
      $("#endexp").val(parseFloat(data.exp.slice(0, -1)));
      if (!$("#endpercent").is(':checked')) {
        $("#endpercent").click();
      }
      $("#endlvl").animate({
        backgroundColor: "#0DD700"
      }, "fast");

      $("#endexp").animate({
        backgroundColor: "#0DD700"
      }, "fast");

      $("#endlvl").animate({
        backgroundColor: "#FFFFFF"
      }, "fast");

      $("#endexp").animate({
        backgroundColor: "#FFFFFF"
      }, "fast");
    },
    error: function(){
      $("#endlvl").animate({
        backgroundColor: "#FF0000"
      }, "fast");

      $("#endexp").animate({
        backgroundColor: "#FF0000"
      }, "fast");

      $("#endlvl").animate({
        backgroundColor: "#FFFFFF"
      }, "fast");

      $("#endexp").animate({
        backgroundColor: "#FFFFFF"
      }, "fast");
    }
  });
}

checkFields = () => {
  if ($("#perexp").is(':checked')) {
    if (!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')) {
      $("#formula").text(`
        ${formulaString} - startExp) + endExp) / rate
      `);
    } else if ($("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
      $("#formula").text(`
        ${formulaString} - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / rate
      `);
    } else if (!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
      $("#formula").text(`
        ${formulaString} - startExp) + expToLvl[endLvl] * (endPct/100)) / rate
      `);
    } else {
      $("#formula").text(`

        ${formulaString} - expToLvl[startLvl] * (startPct/100)) + endExp) / rate
      `);
    }
  } else {
    if (!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')) {
      $("#formula").text(`
        ${formulaString} - startExp) + endExp) / eph * price
      `);
    } else if ($("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
      $("#formula").text(`
        ${formulaString} - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / eph * price
      `);
    } else if (!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')) {
      $("#formula").text(`
        ${formulaString} - startExp) + expToLvl[endLvl] * (endPct/100)) / eph * price
      `);
    } else {
      $("#formula").text(`
        ${formulaString} - expToLvl[startLvl] * (startPct/100)) + endExp) / eph * price
      `);
    }
  }
}

clearLogs = () => {
  players = [];
  if (window.localStorage) {
    localStorage.setItem("players", JSON.stringify(players));
  }
  console.log(players.length);
  refreshLogs();
}

clearHistory = () => {
  history = [];
  totalLoss = 0;
  totalGain = 0;
  $("#total-loss").html(`${formatNum(totalLoss.toFixed(2))}`);
  $("#total-gain").html(`${formatNum(totalGain.toFixed(2))}`);
  if (window.localStorage) {
    localStorage.setItem("history", JSON.stringify(history));
    localStorage.setItem("total-loss", JSON.stringify(totalLoss));
    localStorage.setItem("total-gain", JSON.stringify(totalGain));
  }
  console.log(history.length);
  refreshHistory();
}

formatNum = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
