let S = {};
S.ugrace = [0, 0, 1, 1, 2, 2, 3, 8, 24, 24, 24, 24, 24, 24, 24];
/*for (var i = 0; i < 25; i++) {
  S.ugrace[i] = 1;
}*/
let player = {p: {ugrace: [0, 0, 1, 1, 2, 2, 3, 8, 24, 24, 24, 24, 24, 24, 24], ograce: 0.6}};
let high = false;

let new_level = 8;

/*{
    "type":"weapon",
    "wtype":"pmace",
    "tier":2,
    "skin":"pmace",
    "class":["priest"],
    "int":8,
    "dex":4,
    "damage_type":"magical",
    "upgrade":{
      "int":2,
      "dex":1,
    },
    "name":"Priest's Mace",
    "g":89000,
    "a":true,
    "grades":[0,8],
  }*/
/*
let item_def = { // "helmet"
                 "tier":1,
                 "type":"helmet",
                 "skin":"helmet",
                 "scroll":true,
                 "upgrade":{
                 },
                 "name":"Helmet",
                 "g":3200,
               }*/

let offering = false;

function calculate_item_grade(def,item) {
  if(!(def.upgrade || def.compound)) return 0;
  if((item&&item.level||0)>=(def.grades||[9,10,11,12])[3]) return 4;
  if((item&&item.level||0)>=(def.grades||[9,10,11,12])[2]) return 3;
  if((item&&item.level||0)>=(def.grades||[9,10,11,12])[1]) return 2;
  if((item&&item.level||0)>=(def.grades||[9,10,11,12])[0]) return 1;
  return 0;
}

//item = item_def;
//item.grace = 1;

function get_item_def(itemid) {
  let item_def = item_upgrades[itemid];
  item_def.igrade = calculate_item_grade(item_def);
  if (!item_def.igrade) {
    item_def.igrace = 1;
  } else if (item_def.igrade == 1) {
    item_def.igrace = -1;
  } else if (item_def.igrade == 2) {
    item_def.igrace = -2;
  }
  return item_def;
}

function get_item_value() {
  let item_id = document.getElementById("item_id").value;
  let item_def = item_upgrades[item_id];
  if (!item_def) {
    return;
  }
  return item_def.g;
}

function set_item_value() {
  document.getElementById("item_value").value = get_item_value();
}

function get_probability(item, item_def, new_level) {
  oprobability = probability = upgrades[item_def.igrade][new_level];
  grace = Math.max(0, 
      Math.min(new_level + 1, (item.grace || 0) + Math.min(3, player.p.ugrace[new_level] / 4.5) + item_def.igrace) +
      Math.min(6, S.ugrace[new_level] / 3.0) +
      player.p.ograce / 3.2,
  );
  grace = (probability * grace) / new_level + grace / 1000.0;
  
  //console.log("Base probability: " + probability);
  //console.log("Initial grace: " + grace);
  
  if (offering) {
    
  } else {
    grace = Math.max(0, grace / 4.8 - 0.4 / ((new_level - 0.999) * (new_level - 0.999)));
    probability += grace; // previously 12.0 // previously 9.0 [16/07/18]
  }
  
  if (high) {
    probability = Math.min(probability, Math.min(oprobability + 0.36, oprobability * 3));
  } else {
    probability = Math.min(probability, Math.min(oprobability + 0.24, oprobability * 2));
  }

  //console.log("Final probability: " + probability);
  //console.log("Final grace: " + grace);

  return probability;
}

function get_upgrade_scroll_value(item, level) {
  let grade = 0;
  for (let i = 0; i < item.grades.length; i++) {
    if (level >= item.grades[i]) {
      grade++;  
    }
  }
  return [1000, 40000, 1600000, 48000000, 640000000][grade];
}

function run_numbers(item_id) {
  let item_def = get_item_def(item_id);
  let item = item_def;
  let output = "";
  let total_odds = 1;
  let item_value = parseInt(document.getElementById("item_value").value);
  for (let i = 1; i <= 12; i++) {
    let probability = get_probability(item, item_def, i);
    total_odds *= probability;
    item_value += get_upgrade_scroll_value(item, i-1);
    if (i < 10) {
      output += `Level ${i}:  ${(probability*100).toFixed(2)}% (${parseInt(item_value/total_odds).toLocaleString()}g) (odds total: ${(total_odds*100).toFixed(3)}%)<br>`;
    } else {
      output += `Level ${i}:  ${(probability*100).toFixed(2)}% (${parseInt(item_value/total_odds).toLocaleString()}g) (odds total: ${(total_odds*100).toFixed(6)}%)<br>`;
    }
  }
  document.getElementById("output").innerHTML = output;
}

/*
let total_odds = 1;
for (let i = 1; i < 12; i++) {
  let probability = get_probability(item, item_def, i);
  total_odds *= probability;
  console.log(`Level ${i}:  ${probability*100}% (total: ${total_odds*100}%)`);
}
*/