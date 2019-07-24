import { RegMgr } from '../src/reg';

const regMgr = new RegMgr();

describe('RegMgr', () => {
  const k1 = 'TEST_KEY';
  const v1 = 'test value';
  const v2 = 'd:/test-dir';
  const v3 = 'd:/test-dir-new';

  const initKey = async (fn: () => Promise<unknown>) => {
    await regMgr.set(k1, v1);
    await fn();
    await regMgr.remove(k1, 0);
  };

  test('list', async () => {
    const list = await regMgr.list();
    expect(list.length).not.toBe(0);
  });

  test('list Path', async () => {
    const list = await regMgr.list('Path');
    expect(list.length).toBe(1);
    expect(list[0].values.length).toBeGreaterThan(0);
  });

  test('set', async () => {
    await regMgr.set(k1, v1);
    const item = (await regMgr.list('TEST_KEY'))[0];

    expect(item.value).toBe(v1);
  });

  test('remove', async () => {
    await regMgr.set(k1, v1);
    await regMgr.remove(k1);
    const list = await regMgr.list(k1);

    expect(list.length).toBe(0);
  });

  test('push', async () => {
    await initKey(async () => {
      await regMgr.push(k1, v2);
      const item = await regMgr.item(k1);

      expect(item.values.includes(v2)).toBe(true);
    });
  });

  test('unshift', async () => {
    await initKey(async () => {
      await regMgr.unshift(k1, v2);
      const item = await regMgr.item(k1);

      expect(item.values.includes(v1)).toBe(true);
    });
  });

  test('remove index', async () => {
    await initKey(async () => {
      await regMgr.unshift(k1, v2);
      let item = await regMgr.item(k1);
      const index = item.values.indexOf(v2);
      await regMgr.remove(k1, index);
      item = await regMgr.item(k1);

      expect(item.values.includes(v2)).toBe(false);
    });
  });

  test('replace index', async () => {
    await initKey(async () => {
      await regMgr.unshift(k1, v2);
      let item = await regMgr.item(k1);
      const index = item.values.indexOf(v2);
      await regMgr.replace(k1, index, v3);
      item = await regMgr.item(k1);

      expect(item.values.includes(v3)).toBe(true);
      expect(item.values.includes(v2)).toBe(false);
    });
  });
});
