#!/usr/bin/env node

import CLI from './cli';
import { RegMgr } from './reg';

const cli = new CLI();
const regMgr = new RegMgr();

async function list(key?: string) {
  const list = await regMgr.list(key);

  if (list.length === 1) {
    const item = list[0];
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
  } else {
    list.forEach((item, i) => {
      console.log(`[${i}] ${item.key}: ${item.value}`);
    });
  }
}

async function success() {
  console.log('操作成功');
}

async function edit({
  key,
  operator,
  value,
  index = -1,
}: {
  key: string;
  operator: string;
  value: string;
  index?: number;
}) {
  switch (operator) {
    case 'set':
      return await regMgr.set(key, value).then(success);
    case 'remove':
      return await regMgr
        .remove(key, value ? ~~value : undefined)
        .then(success);
    case 'push':
      return await regMgr.push(key, value).then(success);
    case 'unshift':
      return await regMgr.unshift(key, value).then(success);
    case 'replace':
      return await regMgr.replace(key, index, value).then(success);
  }

  console.log('operator未识别');
}

const isWindows = !!~(process.env.OS || '').toLowerCase().indexOf('windows');

if (isWindows) console.log('仅仅支持windows上使用');
else
  cli
    .action('-h --help', '显示帮助', '', () => cli.help())
    .action<{ key?: string }>(
      '-l --list [?key]',
      '列出环境变量',
      '',
      async ({ key }) => await list(key),
    )
    .action(
      '-e --edit [key] [operator] [value]',
      '编辑环境变量path路径',
      '',
      edit,
    )

    .action(
      '-lp --list-path',
      '= -l Path',
      'Alias',
      async () => await list('Path'),
    )
    .action<{ value: string }>(
      '-a --add-path [value]',
      '= -e Path push [value]',
      'Alias',
      ({ value }) => edit({ key: 'Path', operator: 'push', value }),
    )
    .action<{ key: string; value: string }>(
      '-p --push [key] [value]',
      '= -e [key] push [value]',
      'Alias',
      ({ key, value }) => edit({ key, operator: 'push', value }),
    )
    .action<{ key: string; value: string }>(
      '-s --set [key] [value]',
      '= -e [key] set [value]',
      'Alias',
      ({ key, value }) => edit({ key, operator: 'set', value }),
    )
    .action<{ key: string; value: string }>(
      '-us --unshift [key] [value]',
      '= -e [key] unshift [value]',
      'Alias',
      ({ key, value }) => edit({ key, operator: 'unshift', value }),
    )
    .action<{ key: string; index: string }>(
      '-r --remove [key] [?index]',
      '= -e [key] remove [?index]',
      'Alias',
      ({ key, index }) => edit({ key, operator: 'remove', value: index }),
    )
    .action<{ key: string; index: string; value: string }>(
      '-rp --replace [key] [?index] [value]',
      '= -e [key] replace [?index] [value]',
      'Alias',
      ({ key, index, value }) =>
        edit({ key, operator: 'replace', value, index: ~~index }),
    )

    .action(
      "env-mgr -e Path push 'D:\\DEV\\Android'",
      '// path增加路径',
      'Examples',
    )
    .action(
      'env-mgr -e DEPOT_TOOLS_WIN_TOOLCHAIN set 0',
      '// 设置值',
      'Examples',
    )

    .run(process.argv.slice(2));
