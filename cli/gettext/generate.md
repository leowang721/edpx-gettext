## 二级命令 edp gettext generate(gen)

针对着当前项目内的源代码，生成 .po 文件

### Usages

    edp gettext generate(gen) [<path>]

### Arguments

    -o 输出为文件，不指定则打印在 console 中
    --keyword=[keyword] gettext标记的关键词，默认为 _
    --info=[info] 描述，当前项目的描述

### Results

    默认将生成整个项目唯一的 .po 文件，默认存储于 projectPath/output/po/下。

    文件自动存储为 [info].zh-CN.po
