/** Human-readable pet requirement for match breakdown */
export function formatPetRequirement(key, petNeed) {
  if (!petNeed || petNeed === "any") return "No specific requirement";
  if (key === "experienceLevel") {
    if (petNeed === "firstTimeOk") return "OK for first-time adopters";
    if (petNeed === "experiencedOnly") return "Experienced adopters only";
  }
  if (key === "homeType") {
    return petNeed === "apartment" ? "Apartment" : "House";
  }
  if (key === "activityLevel" || key === "timeAvailable") {
    return petNeed.charAt(0).toUpperCase() + petNeed.slice(1);
  }
  if (key === "goodWithKids" || key === "goodWithOtherPets") {
    return petNeed === "yes" ? "Yes" : "No";
  }
  return String(petNeed);
}

/** Human-readable adopter answer */
export function formatUserAnswer(key, userAnswer) {
  if (userAnswer == null || userAnswer === "") return "—";
  if (key === "experienceLevel") {
    return userAnswer === "firstTime" ? "First-time" : "Experienced";
  }
  if (key === "homeType") {
    return userAnswer === "apartment" ? "Apartment" : "House";
  }
  if (key === "activityLevel" || key === "timeAvailable") {
    return userAnswer.charAt(0).toUpperCase() + userAnswer.slice(1);
  }
  if (key === "goodWithKids" || key === "goodWithOtherPets") {
    return userAnswer === "yes" ? "Yes" : "No";
  }
  return String(userAnswer);
}
