export const calculateMatchScore = (userLifestyle, petRequirements) => {
 
  if (!petRequirements || petRequirements.length === 0) return 100;
  

  if (!userLifestyle || Object.keys(userLifestyle).length === 0) return 0;

  let score = 0;

  const userValues = Object.values(userLifestyle);


  petRequirements.forEach(req => {
    if (userValues.includes(req)) score++;
  });
  
  return Math.round((score / petRequirements.length) * 100);
};