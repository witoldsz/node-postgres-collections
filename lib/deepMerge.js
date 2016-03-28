"use strict";

const isDeep = (value) => Object.prototype.toString.apply(value) === '[object Object]';

const deepMerge = (dst, src) => {
  if (src === undefined || src === null) return dst;
  if (dst === src || !isDeep(dst) || !isDeep(src)) return src;

  Object.keys(src).forEach(p => {
    const goDeeper = isDeep(src[p]);
    if (goDeeper && !isDeep(dst[p])) dst[p] = {};
    if (goDeeper) deepMerge(dst[p], src[p]);
    else dst[p] = src[p];
  });

  return dst;
};

module.exports = deepMerge;
