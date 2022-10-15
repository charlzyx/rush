/**
 * @type {import('vitepress').UserConfig}
 */
 const config = {
  title: "Rush!",
  description: "一个兴趣使然的图片压缩客户端. ting image, tiny png.",
  lastUpdated: true,
  // base: "/rush",
  // lang: 'zh-CN',
  head: [["link", { rel: "icon", type: "svg", href: "/assets/logo.svg" }]],
  themeConfig: {
    logo: "/assets/logo.svg",
    nav: [
      { text: "首页", link: "/" },
      {
        text: "配置文档",
        link: "/settings/index",
      },
      {
        text: "鸣谢",
        link: "/thanks",
      },
    ],
    footer: {
      message: 'Released under the MIT License. <a href="">Powered by tauri.</a>',
      copyright: 'Copyright © 2019-present charlzyx'
    },
    socialLinks: [{ icon: "github", link: "https://github.com/charlzyx" }],
  },
};

export default config;
