const inquirer = require('inquirer');
const {checkApiKey, getKeys, addKeyToFile, list} = require('./util.js');

module.exports.init = ()=> {
    inquirer.prompt({
        type: 'input',
        name: 'apiKey',
        message: '请输入api-key：',
        validate: (apiKey)=> {
            // console.log('\n正在检测，请稍候...');
            process.stdout.write('\n正在检测，请稍候...');
            return new Promise(async (resolve)=> {
                const res = await checkApiKey(apiKey);
                resolve(res);
            });
        }
    }).then(async res=> {
        await addKeyToFile(res.apiKey);
        console.log('apikey 已完成初始化，压缩工具可以使用了');
    })
}

module.exports.addKey = async key=> {
    await checkApiKey(key);
    const keys = await getKeys();
    if (keys.includes(key)) {
        console.log('该api-key已存在文件内');
        return;
    }
    const content = keys.length === 0 ? '' : keys.join(' ') + ' ';
    await addKeyToFile(key, content);
    list();
}

module.exports.deleteKey = async key=> {
    const keys = await getKeys();
    const index = keys.indexOf(key);
    if (index < 0) {
        console.log('该api-key不存在');
        return;
    }
    keys.splice(index, 1);
    console.log(keys);
    const content = keys.length === 0 ? '' : keys.join(' ');
    await addKeyToFile('', content);
    list();
}

module.exports.emptyKey = async key=> {
    inquirer.prompt({
        type: 'confirm',
        name: 'emptyConfirm',
        message: '确认清空所有已存储的api-key？',
        default: true
    }).then(res=> {
        if (res.emptyConfirm) {
            addKeyToFile('');
        } else {
            console.log('已取消');
        }
    })
}

module.exports.list = list;