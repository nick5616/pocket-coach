var checklist = [];
var workout = [];

var global = {
  "logLevel": "debug",
  "debug": "debug",
  "none": "none"
}

function input_interface(input){

}

function most_utilized(a, b){
  if (a.capacity < b.capacity) {
    return -1;
  }
  if (a.capacity > b.capacity) {
    return 1;
  }
  // a must be equal to b
  return 0;
}

function driver(){
  checklist = init_checklist();
  debug("initialized checklist", checklist);
  workout = ["tbar", "pull_up", "lateral_raise", "cable_row", "standing_calve_raise", "glute_bridge", "cable_pullover"];

  workout.forEach((item) => {
    debug(exercises[item]);
    let muscles_involved = exercises[item]["muscles"];
    muscles_involved.forEach((muscle) => {
      debug("GOING TO CALC FOR", muscle);
      calculate_usage(muscle);
    });
  });

  console.log(generateReport());
}

function generateReport(){
  let report = "==========\n  REPORT  \n==========\n";
  report += "[your workout]: "+workout.toString()+"\n";
  let score = 100;
  let demerits = 0;
  let total_size = checklist.length;
  checklist.forEach((item)=>{
    demerits += item.capacity; 
  });
  score -= demerits/total_size;
  report += "[score]: "+score+"\n"; 
  let checklist_sorted_by_usage = checklist.sort(most_utilized); 
  console.log("sorted", checklist_sorted_by_usage);
  let top_three = checklist_sorted_by_usage.slice(0,3);
  let top_three_muscles = [top_three[0].muscle_name, top_three[1].muscle_name, top_three[2].muscle_name]; 
  let bottom_three = checklist_sorted_by_usage.slice(checklist_sorted_by_usage.length-3, checklist_sorted_by_usage.length);
  let bottom_three_muscles = [bottom_three[0].muscle_name, bottom_three[1].muscle_name, bottom_three[2].muscle_name]; 
  console.log(top_three, bottom_three);
  report += "[most worked]: " +top_three_muscles.toString()+ "\n"; 
  report += "[least worked]: " +bottom_three_muscles.toString()+ "\n"; 
  return report;
}

function debug(statement, value){
  //console.log(statement, value)
  //console.log("in debug");
  //console.log(global.logLevel, global.debug);
  if(global.logLevel == global.debug){
    if(value !== undefined) console.log(statement, value);
    else console.log(statement);
  }
  
}


var muscle_groups = {
  "back": ["upper_back", "lats", "traps"], 
  "arms": ["biceps", "triceps"], 
  "shoulders": ["rear_delts", "side_delts", "front_delts"],
  "chest": ["upper_chest", "lower_chest"],
  "legs": ["quads", "glutes", "hamstrings", "calves"],
  "core": ["abs", "lower_back", "obliques"]
};

var exercises = {
  "tbar": {
    "weight": 45,
    "muscles": [
      {
        "muscle_name": "upper_back",
        "decimal": 0.45,
        "focus": "primary"
      },
      {
        "muscle_name": "rear_delts",
        "decimal": 0.2,
        "focus": "secondary"
      },
      {
        "muscle_name": "biceps",
        "decimal": 0.17,
        "focus": "tertiary"
      },
      {
        "muscle_name": "traps",
        "decimal": 0.18,
        "focus": "secondary"
      }
    ]
  },
  "pull_up": {
    "weight": 160,
    "muscles": [
      {
        "muscle_name": "upper_back",
        "decimal": 0.45,
        "focus": "primary"
      },
      {
        "muscle_name": "rear_delts",
        "decimal": 0.2,
        "focus": "tertiary"
      },
      {
        "muscle_name": "biceps",
        "decimal": 0.17,
        "focus": "secondary"
      },
      {
        "muscle_name": "lats",
        "decimal": 0.18,
        "focus": "secondary"
      }
    ]
  },
  "cable_row": {
    "weight": 160,
    "muscles": [
      {
        "muscle_name": "upper_back",
        "decimal": 0.45,
        "focus": "secondary"
      },
      {
        "muscle_name": "rear_delts",
        "decimal": 0.2,
        "focus": "secondary"
      },
      {
        "muscle_name": "biceps",
        "decimal": 0.17,
        "focus": "tertiary"
      },
      {
        "muscle_name": "lats",
        "decimal": 0.18,
        "focus": "primary"
      },
      {
        "muscle_name": "lower_back",
        "decimal": 0.18,
        "focus": "secondary"
      }
    ]
  },
  "lateral_raise": {
    "weight": 30,
    "muscles": [
      {
        "muscle_name": "side_delts",
        "decimal": 0.25,
        "focus": "secondary"
      },
      {
        "muscle_name": "traps",
        "decimal": 0.25,
        "focus": "secondary"
      }
    ]
  },
  "tricep_pushdown": {
    "weight": 75,
    "muscles": [
      {
        "muscle_name": "triceps",
        "decimal": 0.5,
        "focus": "primary"
      }
    ]
  },
  "glute_bridge": {
    "weight": 75,
    "muscles": [
      {
        "muscle_name": "glutes",
        "decimal": 0.5,
        "focus": "primary"
      },
      {
        "muscle_name": "abs",
        "decimal": 0.5,
        "focus": "secondary"
      }
    ]
  },
  "glute_bridge": {
    "weight": 75,
    "muscles": [
      {
        "muscle_name": "glutes",
        "decimal": 0.5,
        "focus": "primary"
      },
      {
        "muscle_name": "abs",
        "decimal": 0.5,
        "focus": "secondary"
      }
    ]
  },
  "standing_calve_raise": {
    "weight": 150,
    "muscles": [
      {
        "muscle_name": "calves",
        "decimal": 0.5,
        "focus": "primary"
      }
    ]
  },
  "cable_pullover": {
    "weight": 70,
    "muscles": [
      {
        "muscle_name": "lats",
        "decimal": 0.5,
        "focus": "primary"
      },
      {
        "muscle_name": "upper_back",
        "decimal": 0.5,
        "focus": "secondary"
      },
      {
        "muscle_name": "abs",
        "decimal": 0.5,
        "focus": "secondary"
      }
    ]
  }
};

function init_checklist(){
  //let checklist = [];
  let all_muscles = getAllMuscles();

  all_muscles.forEach((muscle) => {
    checklist.push({
      "muscle_name": muscle,
      "capacity": 100
    });
  });

  return checklist;
}

function getMuscleDataByName(muscle_name){
  debug("getting corresponding muscle data for", muscle_name);
  for(i in checklist){
    //debug("i", i);
    //debug(checklist[i].muscle_name+" == "+muscle_name+"?");
    if(checklist[i].muscle_name == muscle_name){
      //debug("yes. found it", i);
      return i;
    }
    else {
      //debug("No");
    }
  }
  throw new exception; 
}

function calculate_usage(muscle){
  debug("calculating usage of", muscle);
  debug("checklist", checklist);

  let muscle_name = muscle.muscle_name;
  let decimal = muscle.decimal;
  let focus = muscle.focus;
  let modifier = getModifier(focus);
  debug("modifier", modifier);
  debug("calculating for", checklist[getMuscleDataByName(muscle_name)]);
  checklist[getMuscleDataByName(muscle_name)].capacity -= modifier;
}

function getMuscles(group){

}

function getModifier(focus){
  switch (focus) {
    case "primary": 
      return 50; 
    case "secondary":
      return 25;
    case "tertiary":
      return 10;
    default:
      return 0;
  }
}

function getAllMuscles(){
  let muscles = new Set();
  // console.log("muscle_groups", muscle_groups);
  for(group in muscle_groups){
    // console.log("group", group);
    for(muscle in muscle_groups[group]){
      // console.log("group!", muscle_groups[group])
      muscles.add(muscle_groups[group][muscle]);
    }
  }
  return Array.from(muscles);
}

function getPrimaryMusclesByExercise(input){
  let list = [];
  for(muscle_i in exercises[input]["muscles"]){
    //console.log("muscle_i", muscle_i);
    //console.log("muscle", exercises[input]["muscles"][muscle_i]);
    if(exercises[input]["muscles"][muscle_i]["focus"] == "primary"){
      list.push(exercises[input]["muscles"][muscle_i]);
    }
  }
  return list;
}

function getSecondaryMusclesByExercise(input){
  let list = [];
  for(muscle_i in exercises[input]["muscles"]){
    //console.log("muscle_i", muscle_i);
    //console.log("muscle", exercises[input]["muscles"][muscle_i]);
    if(exercises[input]["muscles"][muscle_i]["focus"] == "secondary"){
      list.push(exercises[input]["muscles"][muscle_i]);
    }
  }
  return list;
}

function getTertiaryMusclesByExercise(input){
  let list = [];
  for(muscle_i in exercises[input]["muscles"]){
    //console.log("muscle_i", muscle_i);
    //console.log("muscle", exercises[input]["muscles"][muscle_i]);
    if(exercises[input]["muscles"][muscle_i]["focus"] == "tertiary"){
      list.push(exercises[input]["muscles"][muscle_i]);
    }
  }
  return list;
}

function getExercises(){
  return exercises;
}

driver();