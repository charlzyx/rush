/**
 * @type {import('vitepress').UserConfig}
 */
 const config = {
  title: "Rush!",
  description: "一个兴趣使然的图片压缩客户端",
  lastUpdated: true,
  base: "/rush",
  // lang: 'zh-CN',
  head: [["link", { rel: "icon", type: "svg", href: "/assets/logo.svg" }]],
  themeConfig: {
    logo: "/assets/logo.svg",
    nav: [
      { text: "首页", link: "/" },
      {
        text: "配置文档",
        link: "/settings",
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/charlzyx" }],
  },
};

export default config;
