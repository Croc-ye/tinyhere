const fs = require('fs');
const path = require('path');
const tinify = require('tinify');
const KEY_FILE_PATH = path.join(__dirname, './data/key');

// 睡眠
const sleep = (ms)=> {
    return new Promise(function(resolve) {
        setTimeout(()=> {
            resolve(true);
        }, ms);
    });
}
// 判定apikey是否有效
const checkApiKey = async apiKey=> {
    return new Promise(async resolve=> {
        let res = true;
        res = /^\w{32}$/.test(apiKey);
        if (res === false) {
            console.log('api-key格式不对');
            resolve(res);
            return;
        }
        res = await checkKeyValidate(apiKey);
        resolve(res);
    })
}
// 检查api-key是否存在
const checkKeyValidate = apiKey=> {
    return new Promise(async (resolve)=> {
        tinify.key = apiKey;
        tinify.validate(function(err) {
            if (err) {
                console.log('该api-key不是有效值');
                resolve(false);
            }
        });
        let count = 500;
        Object.defineProperty(tinify, 'compressionCount', {
            get: ()=> {
                return count;
            },
            set: newValue => {
                count = newValue;
                resolve(true);
            },
            enumerable : true,
            configurable : true
        });
    });
};

// 获取文件内的key，以数组的形式返回
const getKeys = ()=> {
    const keys =  fs.readFileSync(KEY_FILE_PATH, 'utf-8').split(' ');
    return keys[0] === '' ? [] : keys;
}

// 把api-key写入到文件里
const addKeyToFile = (apiKey, content = '')=> {
    return new Promise(async resolve=> {
        const writerStream = fs.createWriteStream(KEY_FILE_PATH);
        // 使用 utf8 编码写入数据
        writerStream.write(content + apiKey,'UTF8');

        // 标记文件末尾
        writerStream.end();

        // 处理流事件 --> data, end, and error
        writerStream.on('finish', function() {
            console.log('=====已更新=====');
            resolve(true);
        });

        writerStream.on('error', function(err){
            console.log(err.stack);
            console.log('写入失败。');
            resolve(false);
        });
    })
}

// 显示文件内的api-key
const list = ()=> {
    const keys = getKeys();
    if (keys.length === 0) {
        console.log('没有存储api-key');
    } else {
        keys.forEach((key)=> {
            console.log(key);
        });
    }
};
module.exports = {
    sleep,
    checkApiKey,
    getKeys,
    addKeyToFile,
    list
}