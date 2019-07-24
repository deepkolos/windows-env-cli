# windows-env-cli

一个简单的 windows 全局环境变量设置工具, 方便增加路径和查看

```shell
> echo 安装
> npm i -g windows-env-cli
> echo 使用
> env-mgr -h

  -h --help                              显示帮助
  -l --list [?key]                       列出环境变量
  -e --edit [key] [operator] [value]     编辑环境变量path路径

Alias:
  -lp --list-path                        = -l Path
  -a --add-path [value]                  = -e Path push [value]
  -p --push [key] [value]                = -e [key] push [value]
  -s --set [key] [value]                 = -e [key] set [value]
  -us --unshift [key] [value]            = -e [key] unshift [value]
  -r --remove [key] [?index]             = -e [key] remove [?index]
  -rp --replace [key] [?index] [value]   = -e [key] replace [?index] [value]

Examples:
  env-mgr -e Path push 'D:\DEV\Android'          // path增加路径
  env-mgr -e DEPOT_TOOLS_WIN_TOOLCHAIN set 0     // 设置值

> echo 修改之后通过env-update更新环境变量
> env-update
```

# TODO

0. 单元测试 √
1. 支持删除 path replace √
1. 错误处理 √
1. OOP √
