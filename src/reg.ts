import { exec } from './utils';

const hasExpandString = /\%[^\%]*\%/i;
const ENV_REG_PATH =
  'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment';

// error msg
const OUT_OF_RANGE = 'index out of range';
const KEY_DOEST_EXIST = "item doesn't exist";

interface EnvItem {
  key: string;
  type: string;
  value: string;
  values: string[];
}

export class RegMgr {
  constructor() {
    exec('chcp 65001');
  }
  // 基础
  async set(key: string, value: string) {
    const type = hasExpandString.test(value) ? 'REG_EXPAND_SZ' : 'REG_SZ';

    return await exec(
      `reg add "${ENV_REG_PATH}" /f /v ${key} /t ${type} /d "${value}"`,
    );
  }

  async remove(key: string, index?: number) {
    if (index !== undefined) {
      const item = (await this.list(key))[0];

      if (item && index >= 0 && index < item.values.length) {
        item.values.splice(index, 1);
        return await this.set(key, item.values.join(';'));
      } else {
        throw new Error(OUT_OF_RANGE);
      }
    } else
      try {
        return await exec(`reg delete "${ENV_REG_PATH}" /f /v ${key}`);
      } catch (error) {
        if (!~error.toString().indexOf('was unable to find')) throw error;
      }
  }

  async list(key?: string) {
    const keyArgument = key ? `/v ${key}` : '';
    let rawOutput;
    try {
      rawOutput = await exec(`reg query "${ENV_REG_PATH}" ${keyArgument}`);
    } catch (error) {
      return [];
    }

    const lines = rawOutput.split('\r\n').slice(2, -2);
    const items = lines.map(function parseLine(line: string): EnvItem {
      let [, key, type, value] = line.split('    ');

      let values: string[] = [value];
      if (key === 'Path' || value.includes(';')) {
        values = value.split(';').filter(i => i !== '');
      }

      return { key, type, value, values };
    });

    return items;
  }

  // 派生
  async item(key: string) {
    const item = (await this.list(key))[0];

    if (!item) throw new Error(KEY_DOEST_EXIST);

    return item;
  }

  async push(key: string, value: string) {
    try {
      const item = await this.item(key);

      if (item.values.includes(key)) return;
      item.values.push(value);
      this.set(key, item.values.join(';'));
    } catch (error) {
      this.set(key, value);
    }
  }

  async unshift(key: string, value: string) {
    try {
      const item = await this.item(key);

      if (item.values.includes(key)) return;
      item.values.unshift(value);
      this.set(key, item.values.join(';'));
    } catch (error) {
      this.set(key, value);
    }
  }

  async replace(key: string, index: number, value: string) {
    const item = await this.item(key);

    if (index >= 0 && index < item.values.length) {
      item.values.splice(index, 1, value);
      this.set(key, item.values.join(';'));
    } else {
      throw new Error(OUT_OF_RANGE);
    }
  }
}
