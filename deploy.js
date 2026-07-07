const ci = require('miniprogram-ci');
const path = require('path');

// 动态配置
const appid = process.env.WX_APPID || 'wxdccb3d908e950565';
const pkg = require('./package.json');

// 基础版本号从 package.json 拿，末尾增加 CI 的构建号
// 比如 1.0.2 变成 1.0.2.build45
const buildNumber = process.env.GITHUB_RUN_NUMBER || 'local';
const version = `${pkg.version}.${buildNumber}`;
const desc = `zhouxin上传 - Build: ${buildNumber}`;

const project = new ci.Project({
    appid: appid,
    type: 'miniProgram',
    projectPath: path.join(__dirname, './dist/build/mp-weixin'),
    privateKeyPath: path.join(__dirname, './private.key'),
    ignores: ['node_modules/**', '.github/**'],
});

(async () => {
    try {
        const uploadResult = await ci.upload({
            project,
            version,
            desc,
            setting: {
                es6: true,
                minify: true,
                autoPrefixer: true,
            },
            onProgressUpdate: console.log,
        });
        console.log('--- 上传成功 ---');
        console.log(uploadResult);
    } catch (error) {
        console.error('--- 上传失败 ---');
        console.error(error);
        process.exit(1);
    }
})();
