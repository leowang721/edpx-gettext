## 二级命令 edp gettext generate(gen)

针对着当前项目内的源代码，生成 .po 文件

### Usages

    edp gettext generate(gen) [<path>]

### Arguments

    -o 输出为文件，不指定则打印在 console 中
    --json 是否同时输出一个同名的json文件
    --amd 是否输出一个可直接加载的amd文件，必须跟 json 参数一起用
    --keyword=[keyword] gettext标记的关键词，默认为 _
    --info=[info] 描述，当前项目的描述
    --lang=[lang] 目标的 .po 文件的语言是什么，例如 zh-cn，会转为全小写，默认是 zh-cn

### Results

    默认将生成整个项目唯一的 .po 文件，默认存储于 projectPath/output/po/下。

    文件自动存储为 [info].zh-CN.po
