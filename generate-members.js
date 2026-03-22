const fs = require('fs');
const members = JSON.parse(fs.readFileSync('original-members.json', 'utf8'));

const trainings = [
  {id:"IC1",name:"ICS-100",states:["NO","CP"],weights:[0.15,0.85]},
  {id:"IC2",name:"ICS-200",states:["NO","CP"],weights:[0.45,0.55]},
  {id:"IC7",name:"ICS-700",states:["NO","CP"],weights:[0.15,0.85]},
  {id:"IC8",name:"ICS-800",states:["NO","CP"],weights:[0.50,0.50]},
  {id:"EC1",name:"EC-001",states:["NO","ST","TR","IN"],weights:[0.55,0.15,0.25,0.05]},
  {id:"SKY",name:"SKYWARN",states:["NO","BA","AD"],weights:[0.30,0.50,0.20]},
  {id:"WIN",name:"Winlink",states:["NO","OP","GW","SY"],weights:[0.60,0.30,0.08,0.02]},
  {id:"EOC",name:"Local EOC",states:["NO","OR","QU","LD"],weights:[0.70,0.15,0.12,0.03]}
];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pickState(training, seed) {
  const r = seededRandom(seed);
  let cumulative = 0;
  for (let i = 0; i < training.weights.length; i++) {
    cumulative += training.weights[i];
    if (r < cumulative) return training.states[i];
  }
  return training.states[training.states.length - 1];
}

const result = members.map((m, idx) => {
  const memberTrainings = trainings.map((t, tidx) => ({
    training_id: t.id,
    training_name: t.name,
    state: pickState(t, idx * 8 + tidx + 1)
  }));
  return { ...m, trainings: memberTrainings };
});

fs.writeFileSync('members.json', JSON.stringify(result, null, 2));
console.log(`Generated members.json with ${result.length} members`);
