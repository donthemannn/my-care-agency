export const computeAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const getAgeCategory = (age: number): string => {
  if (age < 21) return 'young-adult';
  if (age < 30) return 'adult';
  if (age < 50) return 'middle-age';
  if (age < 65) return 'pre-senior';
  return 'senior';
};

export const isEligibleForACA = (age: number): boolean => {
  return age >= 18 && age < 65;
};

export const getSubsidyEligibilityAge = (age: number): boolean => {
  return age >= 18 && age <= 64;
};
