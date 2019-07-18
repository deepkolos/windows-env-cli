"use strict";Object.defineProperty(exports,"__esModule",{value:!0});function help(){console.log(`env-mgr --help

  -l --list [?key]                   列出环境变量
  -e --edit [key] [operator] [value] 编辑环境变量path路径
                                     operator默认值 set 可选 set|push|unshift|remove
  Alias:
  -lp --list-path              = -l Path
  -a  --add-path      [value]  = -e Path  push    [value]
  -p  --push    [key] [value]  = -e [key] push    [value]
  -s  --set     [key] [value]  = -e [key] set     [value]
  -r  --remove  [key] [?index] = -e [key] remove  [?index]
  -us --unshift [key] [value]  = -e [key] unshift [value]

  Examples:
  env-mgr -e Path push 'D:\\DEV\\Android'     // path增加路径
  env-mgr -e DEPOT_TOOLS_WIN_TOOLCHAIN set 0  // 设置值
`)}exports.default=help;