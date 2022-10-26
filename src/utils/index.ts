export const uniquName = (
  memo: Record<string, any>,
  basename: string,
  ext: string,
  acc = 0,
): string => {
  const has = Boolean(memo[`${basename}${ext}`]);
  // console.log('acc ', acc);
  if (has) {
    const trytrybase = `${basename}_${acc}`;
    const still = Boolean(memo[`${trytrybase}${ext}`]);
    if (still) {
      return uniquName(memo, basename, ext, acc + 1);
    }
    return `${trytrybase}${ext}`;
  } else {
    return `${basename}${ext}`;
  }
};
