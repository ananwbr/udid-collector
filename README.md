## 依赖
* Node.js v5.3.0
* MongoDB v2.1.2

## 环境搭建
### 开发
```
git clone git@gitlab.deepdevelop.com:deepdevelop/udid_collector.git
cd udid_collector
npm install
```

```
npm run dev
```

### 生产
```
git clone git@gitlab.deepdevelop.com:deepdevelop/udid_collector.git
cd udid_collector
npm install --production
```

```
# set UDID_SERVER_NAME to the domain name with protocol, for example:
export UDID_SERVER_NAME=http://udid.treation.com

npm start
```