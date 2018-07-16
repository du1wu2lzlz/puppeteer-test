使用puppeteer模拟github登录，搜索用户'liuxing',并爬取所有相关用户名与邮箱，放入MongoDB中//TODO

Install:
+ npm i 
+ node index.js

(友情提示: 最好自己注册个新的账号，防止被封，另外爬的时候要温柔的爬)


+ npm install knex --save

+ npm install mysql

问题:
+ Error: No node found for selector:
  原因:
  可能是准备爬取的DOM节点在进入页面后没有渲染完毕,或者在刷新
  解决办法: 
  等待1-2秒再爬取  
  或者 page.waitForSelector(DOM)等特定的选择器渲染出来再执行

