const puppeteer = require('puppeteer');
const CREDS = require('./creds');

// const mongoose = require('mongoose');
// const User = require('./models/user');

// 初始化模拟用户登录
async function init() {
  const browser = await puppeteer.launch({
    headless: false     //非无界面 模式启动
  });
  const page = await browser.newPage();

  await page.goto('https://github.com/login'); //跳转到登录页面

  const USERNAME_SELECTOR = '#login_field'; 
  const PASSWORD_SELECTOR = '#password';
  const BUTTON_SELECTOR =   '#login > form > div.auth-form-body.mt-3 > input.btn.btn-primary.btn-block'
  // await page.screenshot({path: 'screenshots/github.png'});
  
  //Puppeteer 提供了 click 方法用来点击 DOM 元素和 type 方法来输入内容。

  //模拟登录
  await page.waitFor(3000);
  await page.click(USERNAME_SELECTOR);

  await page.waitFor(3000);
  await page.keyboard.type(CREDS.username);

  await page.waitFor(3000);
  await page.click(PASSWORD_SELECTOR);

  await page.waitFor(3000);
  await page.keyboard.type(CREDS.password);

  await page.waitFor(3000);
  await page.click(BUTTON_SELECTOR);

  await page.waitForNavigation();

  const userToSearch = 'liuxing';
  const searchUrl = 'https://github.com/search?q=' + userToSearch + '&type=Users&utf8=%E2%9C%93';
 
  //模拟搜索
  await page.goto(searchUrl);
  await page.waitFor(2*1000);


  //提取 搜索结果

  //当我们跳转到搜索结果页的时候，使用 page.evaluate 方法可以将所有用户信息的 div 获取出来。

  const USER_LIST_INFO_SELECTOR = '.user-list-item';
  const USER_LIST_USERNAME_SELECTOR = '.user-list-info>a:nth-child(1)';
  const USER_LIST_EMAIL_SELECTOR = '.user-list-info>.user-list-meta .muted-link';

  //获取搜索结果的分页
  const numPages = await getNumPages(page);
  console.log('Numpages: ', numPages);

  for (let h = 1; h <= numPages; h++) {
    // 跳转到指定页码
    await page.goto(`${searchUrl}&p=${h}`);
    // 执行爬取
    const users = await page.evaluate((sInfo, sName, sEmail) => {
      return Array.prototype.slice.apply(document.querySelectorAll(sInfo))
        .map($userListItem => {
          // 用户名
          const username = $userListItem.querySelector(sName).innerText;
          // 邮箱
          const $email = $userListItem.querySelector(sEmail);
          const email = $email ? $email.innerText : undefined;
          return {
            username,
            email,
          };
        })
        // 不是所有用户都显示邮箱
        .filter(u => !!u.email);
    }, USER_LIST_INFO_SELECTOR, USER_LIST_USERNAME_SELECTOR, USER_LIST_EMAIL_SELECTOR);

    users.map(({username, email}) => {
      
      // //启动MongoDB服务
      // upsertUser({
      //   username: username,
      //   email: email,
      //   dataCrawled: new Date()
      // });

      console.log(username, '->', email);
    });
  }

}

// 获取准备爬取的页面总数
async function getNumPages(page) {
  const NUM_USER_SELECTOR = '#js-pjax-container > div.container> div.columns > div.column.three-fourths.codesearch-results> div.pl-2> div.d-flex.flex-justify-between.border-bottom.pb-3 >h3';

  let inner = await page.evaluate((sel) => {
    return document.querySelector(sel).innerHTML;
  }, NUM_USER_SELECTOR);

  // 调整格式为: "69,803 users"
  inner = inner.replace(',', '').replace(' users', '');
  const numUsers = parseInt(inner);
  console.log('numUsers: ', numUsers);

  /*
   * GitHub 每页显示 10 个结果
   */
  const numPages = Math.ceil(numUsers / 10);
  return numPages;
}


//将爬取的数据放入mongoose DB 
// function upsertUser(userObj){

//   const DB_URL = 'mongodb://localhost/luke';

//     if(mongoose.connection.readyState == 0) {
//       mongoose.connect(DB_URL);
//     }

//     //如果爬取的邮箱存在,就更新实例,不新增
//     const conditions = {
//       email: userObj.email
//     };

//     const options = {
//       upsert: true,
//       new: true,
//       setDefaultOnInsert: true
//     };

//     User.findOneAndUpdate(conditions,userObj,options,(err,result) => {
//       if(err) {
//         throw err;
//       }
//     });
// }

init();