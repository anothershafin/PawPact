export const calculateMatchScore = (userLifestyle, pet) => {
  if (!userLifestyle || Object.keys(userLifestyle).length === 0) return null;
  
  let score = 100;
  
  const isYoung = pet.age.toLowerCase().includes('month') || pet.age.toLowerCase().includes('week');


  if (isYoung && userLifestyle.timeAvailable === "Minimal (Quick walks)") score -= 20;
  
  
  if (!pet.pottyTrained && userLifestyle.experience === "First-time Owner") score -= 15;
  
  // Deduct points if they have a quiet home but want a high-energy situation
  if (userLifestyle.homeVibe === "Quiet & Relaxed" && userLifestyle.weekendActivity === "Exploring the outdoors") score -= 5;

  
  if (pet._id) {
    const charSum = pet._id.charCodeAt(0) + pet._id.charCodeAt(pet._id.length - 1);
    const variation = (charSum % 16) - 8; 
    score += variation;
  }

  
  return Math.max(65, Math.min(Math.round(score), 98)); 
};