var expTable = [];
var lvls = [];
var lvlUpExp = [];
var totalexp = [];

$(document).ready(function() {
  let radios = $('input:radio[name=ratetype]');

  $.ajax({
    type: "GET",
    url: "exptable.csv",
    dataType: "text",
    success: function(data) {
      splitRows(data);
    }
  });

  if(radios.is(':checked') === false) {
    radios.filter('[value=exp]').prop('checked', true);
  }

  $("#perhour").click(() => {
    $("#rateinputbox").html(`
      <label for="hourly">EPH</label>
      <input id="eph" name="hourly" type="number"></input>
      <br><Br>
      <label for="price">Price</label>
      <input id="price" name="price" type="number"></input>
    `);
    if(!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')){
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + endExp) / eph * price
      `);
    }else if($("#startpercent").is(':checked') && $("#endpercent").is(':checked')){
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / eph * price
      `);
    }else if(!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')){
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + expToLvl[endLvl] * (endPct/100)) / eph * price
      `);
    }else{
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
    if(!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')){
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + endExp) / rate
      `);
    }else if($("#startpercent").is(':checked') && $("#endpercent").is(':checked')){
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / rate
      `);
    }else if(!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')){
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + expToLvl[endLvl] * (endPct/100)) / rate
      `);
    }else{
      $("#formula").text(`
        Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + endExp) / rate
      `);
    }
  });

  $("#startpercent").click(() => {
    if($("#perexp").is(':checked')){
      if(!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')){
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + endExp) / rate
        `);
      }else if($("#startpercent").is(':checked') && $("#endpercent").is(':checked')){
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / rate
        `);
      }else if(!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')){
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + expToLvl[endLvl] * (endPct/100)) / rate
        `);
      }else{
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + endExp) / rate
        `);
      }
    }else{
      if(!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')){
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + endExp) / eph * price
        `);
      }else if($("#startpercent").is(':checked') && $("#endpercent").is(':checked')){
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / eph * price
        `);
      }else if(!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')){
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + expToLvl[endLvl] * (endPct/100)) / eph * price
        `);
      }else{
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + endExp) / eph * price
        `);
      }
    }
  });

  $("#endpercent").click(() => {
    if($("#perexp").is(':checked')){
      if(!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')){
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + endExp) / rate
        `);
      }else if($("#startpercent").is(':checked') && $("#endpercent").is(':checked')){
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / rate
        `);
      }else if(!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')){
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + expToLvl[endLvl] * (endPct/100)) / rate
        `);
      }else{
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + endExp) / rate
        `);
      }
    }else{
      if(!$("#startpercent").is(':checked') && !$("#endpercent").is(':checked')){
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + endExp) / eph * price
        `);
      }else if($("#startpercent").is(':checked') && $("#endpercent").is(':checked')){
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - expToLvl[startLvl] * (startPct/100)) + expToLvl[endLvl] * (endPct/100)) / eph * price
        `);
      }else if(!$("#startpercent").is(':checked') && $("#endpercent").is(':checked')){
        $("#formula").text(`
          Formula: (((endLvl totalExp - startLvl totalExp) - startExp) + expToLvl[endLvl] * (endPct/100)) / eph * price
        `);
      }else{
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
  let endexp =  $("#endexp").val() ? parseFloat($("#endexp").val()) : 0;
  let totalexpstart = parseFloat(totalexp[startlvl]);
  let totalexpend = parseFloat(totalexp[endlvl]);
  let total = 0;
    if(startlvl > 0 && startlvl < 201){
      if(endlvl < 201 && endlvl > 0){
        if($("#perexp").is(':checked')){
          if(parseFloat($("#rate").val()) > 0){
            let rate = parseFloat($("#rate").val());
            let totalexp = 0;
            if(startexp !== 0){
              if($("#startpercent").is(':checked')){
                startexp = lvlUpExp[startlvl] * (startexp/100);
              }
            }
            if($("#endpercent").is(':checked')){
              endexp = lvlUpExp[endlvl] * (endexp/100);
            }
            totalexp = totalexpend - totalexpstart;
            totalexp -= startexp;
            totalexp += endexp;
            total = totalexp/rate;

            $("#total").html(`<u>${formatNum(total.toFixed(2))}</u>`);
            $("#expgained").html(`Total exp: ${formatNum(totalexp.toFixed(2))}`);
          }else{
            alert("Rate should be greater than 0");
          }
        }else{
          if($("#eph").val()){
            if($("#price").val()){
              let eph = parseFloat($("#eph").val());
              let price = parseFloat($("#price").val());
              let totalexp = 0;
              let duration = 0;
              if(startexp !== 0){
                if($("#startpercent").is(':checked')){
                  startexp = lvlUpExp[startlvl] * (startexp/100);
                }
              }
              if($("#endpercent").is(':checked')){
                endexp = lvlUpExp[endlvl] * (endexp/100);
              }
              totalexp = totalexpend - totalexpstart;
              totalexp -= startexp;
              totalexp += endexp;
              duration = totalexp / eph;
              total = (totalexp / eph) * price;

              $("#total").html(`<u>${formatNum(total.toFixed(2))}</u>`);
              $("#expgained").html(`Total exp: ${formatNum(totalexp.toFixed(2))}<br>
                Estimated duration: ${formatNum(duration.toFixed(2))} hrs`);
            }else{
                alert("Enter price");
            }
          }else{
            alert("Enter eph");
          }
        }
      }else{
        alert("Missing or invalid level. Pick a level 1-200.");
      }
    }else{
      alert("Missing or invalid level. Pick a level 1-200.");
    }
}

splitRows = (data) => {
  let values = "";
  let count = 0;
  for(i = 0; i < data.length; i++){
    if(data[i] === "\r" || data[i] === "\n" || data[i] === ""){
      expTable[i] = values;
      values = "";
    }else{
      values += data[i];
    }
  }
  expTable = expTable.filter(function( element ) {
     return element !== undefined;
  });
  expTable = expTable.filter(function(entry) {
    return /\S/.test(entry);
  });
  showExpTable();
}

showExpTable = () => {
  for(i = 0; i < expTable.length; i++){
    let row = expTable[i].split(',');
    lvls.push(row[0]);
    lvlUpExp.push(row[1]);
    totalexp.push(row[2]);
    let level = formatNum(row[0]);
    let exptolvl = formatNum(row[1]);
    let total = formatNum(row[2]);
    $("#exptable").append(`
      <tr class="exptable-row">
        <td>${level}</td>
        <td>${exptolvl}</td>
        <td>${total}</td>
      </tr>
    `);
  }
}

filterTable = () => {
  let input = $("#searchlvl").val();
  let rows = $("tr").get();
  for (i = 0; i < rows.length; i++) {
    td = rows[i].getElementsByTagName("td")[0];
    if(input){
      if (td) {
        value = td.textContent || td.innerText;
        if (value === input || new String(value).valueOf() == new String("Level").valueOf()) {
          rows[i].style.display = "";
        } else {
          rows[i].style.display = "none";
        }
      }
    }else{
      rows[i].style.display = "";
    }
  }
}

formatNum = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

syncStartExp = () {

}

syncEndExp = () {

}
