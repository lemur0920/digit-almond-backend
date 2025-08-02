export const formatDate = (date: Date): string => {
  return date.toISOString().replace('T', ' ').substring(0, 19);
};