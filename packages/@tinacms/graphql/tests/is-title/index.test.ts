import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, assertDoc, format } from '../util';

it('has the expected output and writes the expected string', async () => {
  const { get, put } = await setup(__dirname, config);
  const result = await get();
  await expect(format(result)).toMatchFileSnapshot('node.json');
  expect(assertDoc(result).data.document._sys.title).toBe('Hello');
  const written = await put(assertDoc(result).data.document._values);
  await expect(written).toMatchFileSnapshot('out.md');
});
