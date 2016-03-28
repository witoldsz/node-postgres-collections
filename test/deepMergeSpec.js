'use strict';

const chai = require('chai');
const expect = chai.expect;

const deepMerge = require('../lib/deepMerge');

describe("deepMerge", () => {

  it('should return src/dst when they are same object ', () => {
    const dst = {src: 'src', dst: 'dst'};
    const src = dst;
    const result = deepMerge(dst, src);
    expect(result).to.be.equal(src);
    expect(result).to.be.equal(dst);
  });

  it('should return src when dst is a value/undefined/null', () => {
    const src = {src: 'src'};
    expect(deepMerge('a simple value', src)).to.be.equal(src, 'simple value case');
    expect(deepMerge(null, src)).to.be.equal(src, 'dst is null case');
    expect(deepMerge(undefined, src)).to.be.equal(src, 'dst is undefined case');
  });

  it('should return dst when src is a undefined/null', () => {
    const dst = {dst: 'dst'};
    expect(deepMerge(dst, null)).to.be.equal(dst, 'src is null case');
    expect(deepMerge(dst, undefined)).to.be.equal(dst, 'src is undefined case');
  });

  it('should merge empty objects', () => {
    expect(deepMerge({}, {})).to.be.eql({});
  });

  it('should assign dst', () => {
    const dst = {dst: 'dst'};
    const src = {src: 'src'};
    expect(deepMerge(dst, src)).to.be.eql({dst: 'dst', src: 'src'});
  });

  it('should override dst', () => {
    const dst = {a: 'dst'};
    const src = {a: 'src'};
    expect(deepMerge(dst, src)).to.be.eql({a: 'src'});
  });

  it('should override dst leaf with object', () => {
    const dst = {a: 'leaf'};
    const src = {a: {deep: 123}};
    expect(deepMerge(dst, src)).to.be.eql({a: {deep: 123}});
  });

  it('should override dst object with leaf', () => {
    const dst = {a: {deep: 123}};
    const src = {a: 'leaf'};
    expect(deepMerge(dst, src)).to.be.eql({a: 'leaf'});
  });

  it('should override dst property with null/undefined/false values', () => {
    const dst = {a: 1, b:2, c:3, d:4};
    const src = {a: null, b: undefined, c: false};
    expect(deepMerge(dst, src)).to.be.eql({a: null, b: undefined, c: false, d: 4});
  });

  it('should merge dst deep', () => {
    const dst = {a: {deep: {a: 1, b: 2, c: 3, x:{y: 'dst'}}}};
    const src = {a: {deep: {b: -2, d: -4, x:{y: 'src', z: 'zet'}}}};
    expect(deepMerge(dst, src)).to.be.eql({a: {deep: {a: 1, b: -2, c: 3, d:-4, x: {y: 'src', z: 'zet'}}}});
  });

  it.skip/*TODO*/('should merge arrays', () => {
    const dst = [1,2];
    const src = [3,4];
    expect(deepMerge(dst, src)).to.be.eql([1,2,3,4]);
  });

});
