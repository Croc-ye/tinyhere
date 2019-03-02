const tinify = require('tinify');
const fs = require("fs");
const path = require('path');
const imageinfo = require('imageinfo');
const inquirer = require('inquirer');
const {checkApiKey, getKeys} = require('./util');

// __dirname 是 当前文件所在的目录
// process.cwd(); 是命令执行的目录

// 1、获取当前目录下的所有图片名称，存在数组里
// 2、遍历数组，给所有图片都执行压缩
// 3、给压缩失败的图片一个数组，然后询问是否继续压缩
// 4、成功

// 对当前目录内的图片进行压缩
const compress = (newPath = '')=> {
    newPath = path.join(process.cwd(), newPath);
    mkDir(newPath);

    const imageList = readDir();
    if (imageList.length === 0) {
        console.log('当前目录内无可用于压缩的图片');
        return;
    }
    findValidateKey(imageList.length);
    console.log('===========开始压缩=========');
    if (newPath !== process.cwd()) {
        console.log('压缩到：  ' + newPath.replace(/\./g, ''));
    }
    compressArray(imageList, newPath);
};

// 生成目录路径
const mkDir = (filePath)=> {
    if (filePath && dirExists(filePath) === false) {
        fs.mkdirSync(filePath);
    }
}

// 判断目录是否存在
const dirExists = (filePath)=> {
    let res = false;
    try {
        res = fs.existsSync(filePath);
    } catch (error) {
        console.log('非法路径');
        process.exit();
    }
    return res;
};


/**
 * 检查api-key剩余次数是否大于500
 * @param {*} count 本次需要压缩的图片数目
 */
const checkCompressionCount = (count = 0)=> {
    return (500 - tinify.compressionCount - count) >> 0;
}

/**
 * 找到可用的api-key
 * @param {*} imageLength 本次需要压缩的图片数目
 */
const findValidateKey = async imageLength=> { // bug高发处
    const keys = getKeys();
    for (let i = 0; i < keys.length; i++) {
        await checkApiKey(keys[i]);
        res = checkCompressionCount(imageLength);
        if (res) return;
    }
    console.log('已存储的所有api-key都超出了本月500张限制，如果要继续使用请添加新的api-key');
    process.exit();
}

// 获取当前目录的所有png/jpg文件
const readDir = ()=> {
    const filePath = process.cwd()
    const arr = fs.readdirSync(filePath).filter(item=> {
        // 这里应该根据二进制流及文件头获取文件类型mime-type，然后读取文件二进制的头信息，获取其真实的文件类型，对与通过后缀名获得的文件类型进行比较。
        if (/(\.png|\.jpg|\.jpeg)$/.test(item)) { // 求不要出现奇奇怪怪的文件名。。
            const fileInfo = fs.readFileSync(item);
            const info = imageinfo(fileInfo);
            return /png|jpg|jpeg/.test(info.mimeType);
        }
        return false;
    });
    return arr;
};

/**
 * 对数组内的图片名进行压缩
 * @param {*} imageList 存放图片名的数组
 * @param {*} newPath 压缩后的图片的存放地址
 */
const compressArray = (imageList, newPath)=> {
    const failList = [];
    imageList.forEach(item=> {
        compressImg(item, imageList.length, failList, newPath);
    });
}

/**
 * 压缩给定名称的图片
 * @param {*} name 文件名
 * @param {*} fullLen 全部文件数量
 * @param {*} failsList 压缩失败的数组
 * @param {*} filePath 用来存放的新地址
 */
const compressImg = (name, fullLen, failsList, filePath)=> {
    fs.readFile(name, function(err, sourceData) {
        if (err) throw err;
        tinify.fromBuffer(sourceData).toBuffer(function(err, resultData) {
          if (err) throw err;
          filePath = path.join(filePath, name);
          const writerStream = fs.createWriteStream(filePath);
          // 标记文件末尾
          writerStream.write(resultData,'binary');
          writerStream.end();
      
          // 处理流事件 --> data, end, and error
          writerStream.on('finish', function() {
            failsList.push(null);
            record(name, true, failsList.length, fullLen);
            if (failsList.length === fullLen) {
                finishcb(failsList, filePath);
            }
          });

          writerStream.on('error', function(err){
            failsList.push(name);
            record(name, false, failsList.length, fullLen);
            if (failsList.length === fullLen) {
                finishcb(failsList, filePath);
            }
          });
        });
    });
}

// 生成日志
const record = (name, success = true, currNum, fullLen)=> {
    const status = success ? '完成' : '失败';
    console.log(`${name} 压缩${status}。 ${currNum}/${fullLen}`);
}

/**
 * 完成调用的回调
 * @param {*} failList 存储压缩失败图片名的数组
 * @param {*} filePath 用来存放的新地址
 */
const finishcb = (failList, filePath)=> {
    const rest = 500 - tinify.compressionCount;
    console.log('本月剩余次数：' + rest);
    const fails = failList.filter(item=> item !== null);
    if (fails.length > 0) {
        // 存在压缩失败的项目(展示失败的项目名)，询问是否把压缩失败的继续压缩 y/n
        // 选择否之后，询问是否生成错误日志
        inquirer.prompt({
            type: 'confirm',
            name: 'compressAgain',
            message: '存在压缩失败的图片，是否将失败的图片继续压缩？',
            default: true
        }).then(res=> {
            if (res) {
                compressArray(failList, filePath);
            } else {
                // inquirer.prompt({
                //     type: 'confirm',
                //     name: 'genLog',
                //     message: '是否生成错误日志？',
                //     default: true
                // }).then(res=> {
                //     if (res) {
                //         // 写文件
                //     } else {
                //         process.exit();
                //     }
                // });
                // process.exit();
            }
        })
    } else {
        // 压缩完成
        console.log('======图片已全部压缩完成======');
    }
}

module.exports = {
    compress
}