import * as path from 'node:path'
import * as fs from 'node:fs'
import { fontSplit } from 'cn-font-split';
import { program } from 'commander'
import { Octokit } from '@octokit/rest'

const options = program
  .name('')
  .description('')
  .version('')
  // .option('-i, --srcdir <string>', "input directory")
  .option('-o, --dstdir <string>', "output directory")
  .parse()
  .opts<{
    // srcdir: string,
    dstdir: string
  }>();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const res = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
  owner: "lxgw",
  repo: "LxgwWenKai",
})

const version = res.data.tag_name.substring(1) // v1.520
const files = await Promise.all(res.data.assets
  .filter(i => i.name.endsWith('.ttf') && !i.name.includes("Mono"))
  .map(i => i.browser_download_url)
  .map(async i => {
    const name = path.basename(i)
    const res = await fetch(i)
    const data = await res.bytes()
    return [name, data]
  })
)
  .then(i => Object.fromEntries(i) as Record<string, Uint8Array>)

const fontMetas = {
  ['LXGWWenKai-Light.ttf']: { weight: 400, local: "LXGW WenKai Light" },
  ['LXGWWenKai-Medium.ttf']: { weight: 600, local: "LXGW WenKai Medium" },
  ['LXGWWenKai-Regular.ttf']: { weight: 700, local: "LXGW WenKai" },
}

await Promise.all(Object.entries(files).map(async ([name, data]) => {
  const fontName = name.replace('.ttf', '').toLowerCase();
  const fontMeta = fontMetas[name as keyof typeof fontMetas];
  await fontSplit({
    input: data,         // 输入的字体缓冲区
    outDir: path.resolve(options.dstdir, fontName),      // 输出目录

    // subsets: [                // 手动分包范围，一般而言不需要手动配置
    //   [65,66,67],             // 第一个分包，对照: 65(A)、66(B)、67(C)
    //   [102,103,104],          // 第二个分包，对照: 102(f)、103(g)、104(h)
    // ],

    css: {                        // CSS 输出产物配置，一般而言不需要手动配置
      fontFamily: 'LXGW WenKai',     // 输出 css 产物的 font-family 名称
      fontWeight: fontMeta.weight.toString(),           // 字重: 400 (常规)、700(粗体), 详细可见 https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
      // fontStyle: 'normal',         // 字体样式: normal (常规)、italic (斜体)。可见 https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-style
      // fontDisplay: 'swap',         // 字体显示策略，推荐 swap。可见 https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display
      localFamily: [fontMeta.local],  // 本地字体族名称。可见 https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face
      // commentUnicodes: false,      // 在 CSS 中添加 Unicode 码点注释
      // compress: true               // 压缩生成的 CSS 产物
    },

    // languageAreas: false,       // 是否启用语言区域优化，将同一语言的字符分到一起
    // autoSubset: true,           // 当分包超过指定大小时是否自动拆分
    // fontFeature: true,          // 是否保留字体特性（如 Code 字体的连字、字距调整等）
    // reduceMins: true,           // 是否减少碎片分包，合并小分包以减少请求数，一般不需要修改

    previewImage: {
      name: 'preview', // 预览图片的文件名
      text: '中文网字计划\nThe Chinese Web Font Project', // 预览图片的文本内容
    },

    // chunkSize: 70 * 1024,           // 单个分片目标大小
    // chunkSizeTolerance: 1 * 1024,   // 分片容差，一般不需要修改
    // maxAllowSubsetsCount: 10,       // 最大允许分包数量，可能会和 chunkSize 冲突

    testHtml: true,             // 是否生成测试 HTML 文件
    reporter: true,             // 是否生成 reporter.bin 文件

    // 自定义分包输出的文件名为 6 位短哈希，或者使用自增索引: '[index].[ext]'
    renameOutputFont: '[index].[ext]',
    // 不在控制台打印多余的日志信息
    silent: true,
  });
  await fs.promises.appendFile(
    path.resolve(options.dstdir, `style.css`),
    `@import url('./${fontName}/result.css');`
  );
}))

await fs.promises.writeFile(
  path.resolve(options.dstdir, `VERSION`),
  `v${version}`,
  {
    flag: 'w',
  }
);
