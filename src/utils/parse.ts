export const parse = (s?: string) => {
  try {
    return JSON.parse(s!);
  } catch (error) {
    console.log('parse error', error);
    return {};
  }
};
