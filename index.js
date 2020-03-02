const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const async = require("async");

/**
 * 获取图片链接
 * @param {*} url 
 * @param {*} callback 
 */
function getImgUrl(url, callback) {
    console.log('-------开始解析-------');
    request(url, function (err, res) {
        if (err) {
            callback(err);
        }
        const $ = cheerio.load(res.body.toString()); //利用cheerio对页面进行解析
        let img = $(".rich_media_content p img");
        let urlarr = [];

        img.each(function (i, elem) {
            const imgFirstUrl = $(elem).attr('data-src');
            let data = {
                url: imgFirstUrl,
                index: i
            }
            urlarr.push(data);
        });
        console.log('--------获取得到以下地址----------');
        console.log(urlarr);
        callback(null, urlarr);
    });
}

/**
 * 下载图片
 * @param {*} url 
 * @param {*} desc 
 * @param {*} callback 
 */
function downLoad(url, desc, callback) {

    console.log('准备下载' + url);
    let opts = {
        url: url,
        headers: {
            "authority": "mmbiz.qpic.cn",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": " 1",
            "user-agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36"
        }
    }
    request(opts).pipe(fs.createWriteStream(`./wechat_image/${desc}.jpeg`)).on('close', () => {
        callback(desc + '下载完成!');
    });
}

/**
 * 创建文件夹
 */
function mkdir() {
    fs.exists(filePath, function (exist) {
        if (!exist) {
            fs.mkdir(`./wechat_image`, (error) => {
                if (error) {
                    console.log(error);
                    return false;
                }
                console.log(`创建目录---wechat_image---成功`);
            });
        }
    });
}

/**
 * 开始下载
 * @param {*} url 
 */
function startDown(url) {
    getImgUrl(url, function (err, urlList) {
        if (err) {
            return console.log(err);
        }
        mkdir();
        async.mapSeries(urlList, function (item, callback) {
            downLoad(item.url, item.index, (res) => {
                console.log(res);
            });
            callback(null, item);
        }, function (err, results) { });
    });
}


startDown('https://mp.weixin.qq.com/s/LZH7LUoBRmYyWqFXJOcTtA');