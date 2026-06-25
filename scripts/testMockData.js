import { mockStudents } from '../src/data/mockData.js';

console.log("Total mock students:", mockStudents.length);

const regNos = {};
const duplicates = [];

mockStudents.forEach(s => {
  if (regNos[s.regNo]) {
    duplicates.push(s);
  } else {
    regNos[s.regNo] = s;
  }
});

if (duplicates.length > 0) {
  console.log("Found duplicates:", duplicates.length);
  duplicates.slice(0, 10).forEach(d => {
    console.log(`Duplicate RegNo: ${d.regNo}, Name: ${d.name}, Year: ${d.year}, Dept: ${d.department}`);
    const original = regNos[d.regNo];
    console.log(`Original RegNo: ${original.regNo}, Name: ${original.name}, Year: ${original.year}, Dept: ${original.department}`);
  });
} else {
  console.log("No duplicate register numbers found!");
}
