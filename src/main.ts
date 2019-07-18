#!/usr/bin/env node

import help from './help';
import * as shell from 'child_process';

const ENV_REG_PATH =
  'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment';

(async function main() {
  if (hasOption('--help')) return help();

  const otherOptions = process.argv.slice(3);

  const isSet = hasOption(['-s', '--set']);
  const isEdit = hasOption(['-e', '--edit']);
  const isList = hasOption(['-l', '--list']);
  const isPush = hasOption(['-p', '--push']);
  const isRemove = hasOption(['-r', '--remove']);
  const isUnshift = hasOption(['-us', '--unshift']);
  const isAddPath = hasOption(['-a', '--add-path']);
  const isListPath = hasOption(['-lp', '--list-path']);

  // 设置中文输出
  await exec('chcp 65001');

  if (isList || isListPath) {
    if (isListPath) {
      printItem(await getEnvItem('Path'));
    } else if (otherOptions.length === 0) {
      const list = await getEnvList();
      printList(list);
    } else {
      const key = otherOptions.shift();

      if (key) printItem(await getEnvItem(key));
      else console.log('参数错误');
    }
    return;
  }

  if (isEdit || isAddPath || isUnshift || isRemove || isPush || isSet) {
    let options = [...otherOptions];

    if (isSet) options.splice(1, 0, 'set');
    if (isPush) options.splice(1, 0, 'push');
    if (isRemove) options.splice(1, 0, 'remove');
    if (isUnshift) options.splice(1, 0, 'unshift');
    if (isAddPath) options = ['Path', 'push', ...otherOptions];

    const [key, operator, value, hasExpandString] = formatOptions(options);

    try {
      if (operator === 'set') {
        const type = hasExpandString ? 'REG_EXPAND_SZ' : 'REG_SZ';
        await exec(
          `reg add "${ENV_REG_PATH}" /v ${key} /t ${type} /d ${value}`,
        );
      }

      if (operator === 'push' || operator === 'unshift') {
        const item = await getEnvItem(key);
        if (item.values.includes(value)) {
          item.values.splice(item.values.indexOf(value), 1);
        }
        item.values[operator](value);
        await exec(
          `reg add "${ENV_REG_PATH}" /f /v ${key} /t ${
            item.type
          } /d "${item.values.join(';')}"`,
        );
      }

      if (operator === 'remove') {
        key && (await exec(`reg delete "${ENV_REG_PATH}" /f /v ${key}`));
      }

      console.log('操作成功');
    } catch (error) {
      console.log('出错了:', error);
    }
    return;
  }
})();

interface EnvItem {
  key: string;
  type: string;
  value: string;
  values: string[];
}

function hasOption(name: string | string[]) {
  if (typeof name === 'string') {
    return process.argv.includes(name);
  } else {
    return name.some(i => process.argv.includes(i));
  }
}

function exec(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    shell.exec(cmd, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });
}

function parseLine(line: string): EnvItem {
  let [, key, type, value] = line.split('    ');

  let values: string[] = [];
  if (key === 'Path' || value.includes(';')) {
    values = value.split(';').filter(i => i !== '');
  }

  return { key, type, value, values };
}

function formatValue(value: string): [string, boolean] {
  const hasExpandString = /\%[^\%]*\%/i;
  return [
    value.replace(/^[\'\"]/, '').replace(/[\'\"]$/, ''),
    hasExpandString.test(value),
  ];
}

function formatOptions(options: string[]): [string, string, string, boolean] {
  let key, value, valueRaw, operator, expand;
  switch (options.length) {
    case 2:
      [key, valueRaw] = options;
      [value, expand] = formatValue(valueRaw);
      return [key, 'set', value, expand];
    case 3:
      [key, operator, valueRaw] = options;
      [value, expand] = formatValue(valueRaw);
      if (operator === 'push' || operator === 'set')
        return [key, operator, value, expand];
      else throw new Error('operator只能填写 =, +');
    default:
      throw new Error('参数填写错误');
  }
}

function printList(list: EnvItem[]) {
  list.forEach((item, i) => {
    console.log(`[${i}] ${item.key}: ${item.value}`);
  });
}

function printItem(item: EnvItem) {
  if (item.values.length) {
    console.log(`key: ${item.key}
type: ${item.type}
values:
${item.values.map((v, i) => `[${i}] ${v}\n`).join('')}`);
  } else {
    console.log(`key: ${item.key}
type: ${item.type}
value: ${item.value}`);
  }
}

async function getEnvList() {
  const rawOutput = await exec(`reg query "${ENV_REG_PATH}"`);
  const lines = rawOutput.split('\r\n').slice(2, -2);
  const items = lines.map(parseLine);

  return items;
}

async function getEnvItem(key: string) {
  const rawOutput = await exec(`reg query "${ENV_REG_PATH}" /v ${key}`);
  return parseLine(rawOutput.replace(/\r\n/g, ''));
}
