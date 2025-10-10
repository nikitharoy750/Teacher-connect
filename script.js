function toggleLanguage() {
  alert("Language toggled! (Simulated bilingual support)");
}

function resolveDoubt() {
  const input = document.getElementById("doubtInput").value;
  const response = document.getElementById("doubtResponse");

  if (input.toLowerCase().includes("photosynthesis")) {
    response.textContent = "Photosynthesis is the process by which plants make food using sunlight.";
  } else {
    response.textContent = "AI is thinking... (Simulated response)";
  }
}

// Simulated leaderboard data
const leaderboardData = [
  { name: "Ms. Anjali", impactScore: 92 },
  { name: "Mr. Ramesh", impactScore: 88 },
  { name: "Ms. Farah", impactScore: 85 }
];

const leaderboardList = document.getElementById("leaderboardList");
leaderboardData.forEach(teacher => {
  const li = document.createElement("li");
  li.textContent = `${teacher.name} — Impact Score: ${teacher.impactScore}`;
  leaderboardList.appendChild(li);
});
