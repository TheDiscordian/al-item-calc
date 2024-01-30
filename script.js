var S = {};
//S.ugrace = [0, 0, 1, 1, 2, 2, 3, 8, 24, 24, 24, 24, 24, 24, 24];
S.ugrace = [];
for (var i = 0; i < 25; i++) {
  S.ugrace[i] = 0;
}
var player = {p: {ugrace: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ograce: 0}};
//let player = {p: {ugrace: [0, 0, 1, 1, 2, 2, 3, 8, 24, 24, 24, 24, 24, 24, 24], ograce: 0.6}};
//let player = {p: {ugrace: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ograce: 0}};
let high = false;

let new_level = 8;

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
  let item_def = item_upgrades[itemid] || item_compounds[itemid];
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
  let item_def = item_upgrades[item_id] || item_compounds[item_id];
  if (!item_def) {
    return;
  }
  return item_def.g;
}

function set_item_value() {
  document.getElementById("item_value").value = get_item_value();
}

function get_compound_probability(item, item_def, new_level) {
  let oprobability = probability = compounds[item_def.igrade][new_level];
  let grace = 0;
  let proc = 0;

  if (offering) {

  } else {
    grace = 0.007 * (/*(item0.grace || 0) + (item1.grace || 0) + (item2.grace || 0) + */player.p.ograce);
    probability = probability + Math.min(25 * 0.007, grace) / Math.max(new_level - 2, 1);
  }

  if (item_def.type == "booster") {
      probability = 0.9999999999999;
      proc = offering && 0.12; // FIXME offering not implemented yet
    } else {
      probability = Math.min(
        probability,
        Math.min(oprobability * (3 + ((high && high * 0.6) || 0)), oprobability + 0.2 + ((high && high * 0.05) || 0)),
      );
    }

    return probability;
}

function get_upgrade_probability(item, item_def, new_level) {
  let oprobability = probability = upgrades[item_def.igrade][new_level];
  let grace = Math.max(0, 
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

function get_compound_scroll_value(item, level) {
  let grade = 0;
  for (let i = 0; i < item.grades.length; i++) {
    if (level >= item.grades[i]) {
      grade++;  
    }
  }
  return [6400, 240000, 9200000, 92000000][grade];
}

function run_numbers(item_id) {
  let item_def = get_item_def(item_id);
  let item_value = parseInt(document.getElementById("item_value").value);

  player = {p: {ugrace: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ograce: 0}};
  S.ugrace = player.p.ugrace;
  if (document.getElementById("lucky_check").checked) {
    S.ugrace = [0, 0, 0, 0, 1, 1, 2, 4, 3, 2, 24, 24, 24, 24, 24];
    player = {p: {ugrace: [0, 0, 0, 0, 1, 1, 2, 4, 3, 2, 0, 0, 0, 0, 0], ograce: 0.3}};
  }

  if (item_def["upgrade"]) {
    run_upgrade_numbers(item_def, item_value);
  } else {
    run_compound_numbers(item_def, item_value);
  }
}

function run_upgrade_numbers(item_def, item_value) {
  let item = item_def;
  let output = "";
  let total_odds = 1;
  let total_value = item_value;

  for (let i = 1; i <= 12; i++) {
    let probability = get_upgrade_probability(item, item_def, i);
    total_odds *= probability;
    //item_value += get_upgrade_scroll_value(item, i-1);
    total_value += get_upgrade_scroll_value(item, i-1);
    total_value /= probability;
    if (i < 10) {
      output += `Level ${i}:  ${(probability*100).toFixed(2)}% (${parseInt(total_value).toLocaleString()}g) (odds total: ${(total_odds*100).toFixed(3)}%)<br>`;
    } else {
      output += `Level ${i}:  ${(probability*100).toFixed(2)}% (${parseInt(total_value).toLocaleString()}g) (odds total: ${(total_odds*100).toFixed(6)}%)<br>`;
    }
  }
  document.getElementById("output").innerHTML = output;
}

function run_compound_numbers(item_def, item_value) {
  let item = item_def;
  let output = "";
  let total_odds = 1;
  let total_value = item_value;

  for (let i = 1; i <= 7; i++) {
    let probability = get_compound_probability(item, item_def, i);
    total_odds *= probability;
    //item_value += get_compound_scroll_value(item, i-1);
    total_value /= probability/3;
    total_value += get_compound_scroll_value(item, i-1)/probability;

    output += `Level ${i}:  ${(probability*100).toFixed(2)}% (${parseInt(total_value).toLocaleString()}g) (odds total: ${(total_odds*100).toFixed(3)}%)<br>`;
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