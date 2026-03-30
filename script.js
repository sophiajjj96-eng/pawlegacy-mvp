const petsContainer = document.getElementById("pets-container");
const addPetBtn = document.getElementById("add-pet-btn");
const trustForm = document.getElementById("trust-form");
const resultCard = document.getElementById("result-card");
const summary = document.getElementById("summary");
const checklist = document.getElementById("checklist");
const legalDoc = document.getElementById("legal-doc");
const downloadDocBtn = document.getElementById("download-doc-btn");
const livePreview = document.getElementById("live-preview");
const continuitySummary = document.getElementById("continuity-summary");
const caregiverGrid = document.getElementById("caregiver-grid");
const speciesFilter = document.getElementById("species-filter");
const sortSelect = document.getElementById("sort-select");
const contactModal = document.getElementById("contact-modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const closeModalBtn = document.getElementById("close-modal");
const sendMessageBtn = document.getElementById("send-message-btn");
const contactMessage = document.getElementById("contact-message");
const calcSpecies = document.getElementById("calc-species");
const calcBudget = document.getElementById("calc-budget");
const calcResult = document.getElementById("calc-result");
const legalState = document.getElementById("legal-state");
const notaryMethod = document.getElementById("notary-method");
const legalStatusBtn = document.getElementById("legal-status-btn");
const legalStatusResult = document.getElementById("legal-status-result");

let petIdCounter = 0;
let latestDoc = "";
let activeCaregiver = null;

const caregivers = [
  { name: "Emily Park", species: "dog", rating: 4.9, experience: 8, price: 35, bio: "Senior dog care specialist" },
  { name: "Lucas Kim", species: "cat", rating: 4.8, experience: 6, price: 30, bio: "Medication and nutrition support" },
  { name: "Mia Chen", species: "both", rating: 4.7, experience: 10, price: 40, bio: "Multi-pet household experience" },
  { name: "Noah Lee", species: "dog", rating: 4.6, experience: 5, price: 28, bio: "High-energy dog routines" },
  { name: "Ava Johnson", species: "cat", rating: 5.0, experience: 9, price: 45, bio: "Cat behavior and comfort care" },
  { name: "Ethan Choi", species: "both", rating: 4.5, experience: 7, price: 32, bio: "Emergency-response capable" },
];

const careCostProfiles = {
  golden_retriever: { label: "Golden Retriever", annualCost: 1650, lifespan: 11 },
  small_dog: { label: "Small Dog", annualCost: 1200, lifespan: 14 },
  cat: { label: "Cat", annualCost: 1050, lifespan: 15 },
};

function usd(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function createPetCard() {
  petIdCounter += 1;
  const wrapper = document.createElement("div");
  wrapper.className = "pet-card";
  wrapper.dataset.petId = String(petIdCounter);
  wrapper.innerHTML = `
    <div class="row space-between">
      <h5>Pet #${petIdCounter}</h5>
      <button type="button" class="secondary remove-pet-btn">Remove</button>
    </div>
    <div class="grid two-col">
      <label>Name<input class="pet-name" required /></label>
      <label>Species
        <select class="pet-species">
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label>Age<input class="pet-age" type="number" min="0" max="40" required /></label>
      <label>Weight (lbs)<input class="pet-weight" type="number" min="1" max="250" required /></label>
    </div>
  `;

  wrapper.querySelector(".remove-pet-btn").addEventListener("click", () => {
    if (petsContainer.children.length > 1) {
      wrapper.remove();
      updateLivePreview();
    }
  });

  petsContainer.appendChild(wrapper);
  updateLivePreview();
}

function readPets() {
  return Array.from(petsContainer.querySelectorAll(".pet-card")).map((card) => ({
    name: card.querySelector(".pet-name").value.trim(),
    species: card.querySelector(".pet-species").value,
    age: Number(card.querySelector(".pet-age").value),
    weight: Number(card.querySelector(".pet-weight").value),
  }));
}

function estimateTrustFunding(monthlyCare, medicalBuffer, pets) {
  const longestLife = Math.max(...pets.map((pet) => Math.max(1, 18 - pet.age)));
  const months = longestLife * 12;
  const weightFactor = pets.reduce((acc, pet) => acc + pet.weight, 0) / 100;
  const adjustedMonthly = monthlyCare * (1 + weightFactor / 4);
  const base = months * adjustedMonthly;
  const contingency = base * (medicalBuffer / 100);

  return {
    months,
    adjustedMonthly,
    recommendedTrust: Math.round(base + contingency),
  };
}

function buildChecklist(ownerName, state, trustee, caregiver) {
  return [
    `Final attorney review for ${state} state compliance`,
    `${ownerName} signature + e-notary completion`,
    `Document role confirmation for trustee (${trustee}) and caregiver (${caregiver})`,
    "Link trust account or life-insurance beneficiary funding",
    "Recalculate care costs and update plan every 6 months",
  ];
}

function buildLegalDocument(data, funding) {
  const petsText = data.pets
    .map((pet, idx) => `${idx + 1}. ${pet.name} (${pet.species}, ${pet.age} yrs, ${pet.weight} lbs)`)
    .join("\n");

  return `PawLegacy AI Pet Trust Draft (Demo)\n\nGrantor: ${data.ownerName}\nState: ${data.state}\nTrustee: ${data.trustee}\nPrimary Caregiver: ${data.primaryCaregiver}\nEmergency Contact: ${data.emergencyContact}\n\nCovered Pets:\n${petsText}\n\nCare Instructions:\n- Diet/Allergy: ${data.dietNotes || "N/A"}\n- Medical Notes: ${data.medicalNotes || "N/A"}\n- Daily Routine: ${data.dailyRoutine || "N/A"}\n\nFunding Recommendation:\n- Estimated Coverage: ${funding.months} months\n- Adjusted Monthly Cost: ${usd(funding.adjustedMonthly)}\n- Recommended Trust Amount: ${usd(funding.recommendedTrust)}\n\nDistribution Clause (Sample):\nThe Trustee shall distribute trust funds solely for the health, housing, nutrition, grooming, and wellbeing of the listed pets. If the Primary Caregiver is unable to serve, a substitute caregiver shall be appointed in consultation with the Trustee and documented in writing.\n\nCompliance Notice:\nThis AI-generated draft is for planning and educational demonstration only and must be reviewed by a licensed attorney in the relevant jurisdiction before execution.`;
}

function renderCaregivers() {
  const filter = speciesFilter.value;
  const sort = sortSelect.value;
  let items = caregivers.filter((person) => filter === "all" || person.species === filter || person.species === "both");

  if (sort === "rating") {
    items = items.sort((a, b) => b.rating - a.rating);
  } else if (sort === "experience") {
    items = items.sort((a, b) => b.experience - a.experience);
  } else {
    items = items.sort((a, b) => a.price - b.price);
  }

  caregiverGrid.innerHTML = "";
  for (const person of items) {
    const card = document.createElement("article");
    card.className = "caregiver-card";
    card.innerHTML = `
      <h4>${person.name}</h4>
      <p>${person.bio}</p>
      <p>Pet type: ${person.species === "both" ? "Dog/Cat" : person.species}</p>
      <p>Rating: ${person.rating} · Experience: ${person.experience} yrs · ${usd(person.price)}/visit</p>
      <button type="button" class="contact-btn">Contact</button>
    `;

    card.querySelector(".contact-btn").addEventListener("click", () => {
      activeCaregiver = person;
      modalTitle.textContent = `Contact ${person.name}`;
      modalBody.textContent = `Send a caregiver matching message to ${person.name} (${person.experience} years experience).`;
      contactMessage.value = "";
      contactModal.hidden = false;
    });

    caregiverGrid.appendChild(card);
  }
}

function renderCareCostCalculator() {
  const profile = careCostProfiles[calcSpecies.value];
  const budget = Number(calcBudget.value || 0);
  const yearsCovered = profile.annualCost > 0 ? budget / profile.annualCost : 0;
  const enough = yearsCovered >= profile.lifespan;

  calcResult.innerHTML = `
    <p><strong>${usd(budget)}</strong> covers about <strong>${yearsCovered.toFixed(1)} years</strong> of food + basic checkups for a <strong>${profile.label}</strong>.</p>
    <p>Against expected lifespan (${profile.lifespan} years): ${enough ? "likely sufficient ✅" : "may be insufficient ⚠️"}.
    ${enough ? "Adding a medical reserve is still recommended." : `Suggested minimum budget is about ${usd(profile.annualCost * profile.lifespan)}.`}</p>
  `;
}

function updateLivePreview() {
  const ownerName = document.getElementById("ownerName").value.trim() || "Owner";
  const trustee = document.getElementById("trustee").value.trim() || "Trustee";
  const monthlyCare = Number(document.getElementById("monthlyCare").value || 0);
  const medicalBuffer = Number(document.getElementById("medicalBuffer").value || 0);
  const petNames = Array.from(petsContainer.querySelectorAll(".pet-name"))
    .map((input) => input.value.trim())
    .filter(Boolean);

  const estimatedYearly = Math.round(monthlyCare * 12 * (1 + medicalBuffer / 100));
  const namesText = petNames.length ? petNames.join(", ") : "pet name(s)";

  livePreview.innerHTML = `
    <p><strong>Live preview</strong></p>
    <p>Generating a trust draft for <strong>${namesText}</strong> under ${ownerName}'s profile.</p>
    <p>Based on current inputs, estimated annual budget is <strong>${usd(estimatedYearly)}</strong>, and trustee is <strong>${trustee}</strong>.</p>
  `;
}

function renderLegalStatus() {
  const checkedItems = Array.from(document.querySelectorAll(".legal-item")).filter((item) => item.checked).length;
  const totalItems = document.querySelectorAll(".legal-item").length;
  const readiness = Math.round((checkedItems / totalItems) * 100);
  const methodText = notaryMethod.value === "online" ? "Online e-notary" : "In-person notary";
  const eta = checkedItems === totalItems ? "Ready to schedule now" : `${totalItems - checkedItems} item(s) remaining`;

  legalStatusResult.innerHTML = `
    <p><strong>State:</strong> ${legalState.value} · <strong>Notary:</strong> ${methodText}</p>
    <p><strong>Readiness score:</strong> ${readiness}% (${checkedItems}/${totalItems} completed)</p>
    <p><strong>Next step:</strong> ${eta}</p>
  `;
}

trustForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const pets = readPets();

  if (!pets.length || pets.some((pet) => !pet.name || Number.isNaN(pet.age) || Number.isNaN(pet.weight))) {
    alert("Please complete all pet details before generating.");
    return;
  }

  const data = {
    ownerName: document.getElementById("ownerName").value.trim(),
    ownerEmail: document.getElementById("ownerEmail").value.trim(),
    state: document.getElementById("state").value.trim().toUpperCase(),
    trustee: document.getElementById("trustee").value.trim(),
    primaryCaregiver: document.getElementById("primaryCaregiver").value.trim(),
    emergencyContact: document.getElementById("emergencyContact").value.trim(),
    monthlyCare: Number(document.getElementById("monthlyCare").value),
    medicalBuffer: Number(document.getElementById("medicalBuffer").value),
    dietNotes: document.getElementById("dietNotes").value.trim(),
    medicalNotes: document.getElementById("medicalNotes").value.trim(),
    dailyRoutine: document.getElementById("dailyRoutine").value.trim(),
    pets,
  };

  const funding = estimateTrustFunding(data.monthlyCare, data.medicalBuffer, pets);
  const docText = buildLegalDocument(data, funding);
  latestDoc = docText;

  summary.innerHTML = `
    <p>Recommended trust amount for <strong>${data.ownerName}</strong> and ${pets.length} pet(s): <strong>${usd(funding.recommendedTrust)}</strong>.</p>
    <p>Calculation basis: ${funding.months} months, adjusted monthly cost ${usd(funding.adjustedMonthly)}, medical contingency ${data.medicalBuffer}%.</p>
  `;
  continuitySummary.innerHTML = `
    <p><strong>Recommended Trust Fund: ${usd(funding.recommendedTrust)}</strong></p>
    <p>Includes:</p>
    <ul>
      <li>✔ Lifetime care cost</li>
      <li>✔ Medical contingency buffer</li>
      <li>✔ Insurance gap coverage</li>
    </ul>
  `;

  checklist.innerHTML = "";
  for (const item of buildChecklist(data.ownerName, data.state, data.trustee, data.primaryCaregiver)) {
    const li = document.createElement("li");
    li.textContent = item;
    checklist.appendChild(li);
  }

  legalDoc.textContent = docText;
  resultCard.hidden = false;
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
});

addPetBtn.addEventListener("click", createPetCard);

speciesFilter.addEventListener("change", renderCaregivers);
sortSelect.addEventListener("change", renderCaregivers);
calcSpecies.addEventListener("change", renderCareCostCalculator);
calcBudget.addEventListener("input", renderCareCostCalculator);
legalStatusBtn.addEventListener("click", renderLegalStatus);
legalState.addEventListener("change", renderLegalStatus);
notaryMethod.addEventListener("change", renderLegalStatus);
document.querySelectorAll(".legal-item").forEach((item) => item.addEventListener("change", renderLegalStatus));

closeModalBtn.addEventListener("click", () => {
  contactModal.hidden = true;
});

sendMessageBtn.addEventListener("click", () => {
  if (!activeCaregiver) {
    return;
  }

  const message = contactMessage.value.trim();
  if (!message) {
    alert("Please enter a message.");
    return;
  }

  alert(`Inquiry sent to ${activeCaregiver.name}.\n\nMessage: ${message}`);
  contactModal.hidden = true;
});

downloadDocBtn.addEventListener("click", () => {
  if (!latestDoc) {
    return;
  }

  const blob = new Blob([latestDoc], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "pawlegacy-pet-trust-draft.txt";
  anchor.click();
  URL.revokeObjectURL(url);
});

createPetCard();
renderCaregivers();
renderCareCostCalculator();
updateLivePreview();
renderLegalStatus();

trustForm.addEventListener("input", updateLivePreview);
petsContainer.addEventListener("input", updateLivePreview);
