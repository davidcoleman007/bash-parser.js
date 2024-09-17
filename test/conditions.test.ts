import { describe, expect, it } from 'vitest';
import bashParser from '~/parse.ts';

describe('conditions', async (t) => {
  it('if [ "$a" -eq 10 ]', async (t) => {
    expect(await bashParser('if [ "$a" -eq 10 ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('if [ "$a" -ne 10 ]', async (t) => {
    expect(await bashParser('if [ "$a" -ne 10 ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('[ "$a" -gt 10 ]', async (t) => {
    expect(await bashParser('if [ "$a" -gt 10 ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('if [ "$a" -ge 10 ]', async (t) => {
    expect(await bashParser('if [ "$a" -ge 10 ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('[ "$a" -lt 10 ]', async (t) => {
    expect(await bashParser('if [ "$a" -lt 10 ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('if [ "$a" -le 10 ]', async (t) => {
    expect(await bashParser('if [ "$a" -le 10 ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('if [ "$a" == 10 ]', async (t) => {
    expect(await bashParser('if [ "$a" == 10 ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('if [ "$a" != 10 ]', async (t) => {
    expect(await bashParser('if [ "$a" != 10 ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('if [ ! "$a" = 10 ]', async (t) => {
    expect(await bashParser('if [ ! "$a" = 10 ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('if [ -z "$a" ]', async (t) => {
    expect(await bashParser('if [ -z "$a" ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('if [ -n "$a" ]', async (t) => {
    expect(await bashParser('if [ -n "$a" ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('if [ -d "$a" ]', async (t) => {
    expect(await bashParser('if [ -d "$a" ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('if [ -f "$a" ]', async (t) => {
    expect(await bashParser('if [ -f "$a" ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('if [ -r "$a" ]', async (t) => {
    expect(await bashParser('if [ -r "$a" ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('if [ -w "$a" ]', async (t) => {
    expect(await bashParser('if [ -w "$a" ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('if [ -x "$a" ]', async (t) => {
    expect(await bashParser('if [ -x "$a" ]; then echo 1; fi')).toMatchSnapshot();
  });

  it('while [ "$a" -le 10 ]', async (t) => {
    expect(await bashParser('while [ "$a" -le 10 ]; do echo 1; done')).toMatchSnapshot();
  });

  it('until [ "$a" -ge 10 ]', async (t) => {
    expect(await bashParser('until [ "$a" -ge 10 ]; do echo 1; done')).toMatchSnapshot();
  });

  it('if [ "$(command)" -eq 1 ]', async (t) => {
    expect(await bashParser('if [ "$(command)" -eq 1 ]; then echo 1; fi')).toMatchSnapshot();
  });
});
