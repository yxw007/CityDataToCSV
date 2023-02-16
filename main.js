/**
 * 创建日期: 2023-02-16
 * 文件名称：main.js
 * 创建作者：Potter
 * 开发版本：1.0.0
 * 相关说明：功能说明：地址树形结构转平级结构至CSV表格中
 */
const fs = require('fs')
const path = require('path')

const str = fs.readFileSync(path.resolve(__dirname, './city.txt'), {
  encoding: 'utf8',
})
const res = JSON.parse(str)

let ret = ''

//1.拼接头
let rowName = 'id,name,letter,region_code,mshort,level,parent,type,city'
ret += rowName + '\r\n'
let rowNameV =
  'id,区域名称（北京市）,拼音首字母缩写,邮编,地区名称缩写（北京）,当前级别,上级ID没有上级为0,类型0省1市2区,城市列表没有则为0'
ret += rowNameV + '\r\n'

let appOneRow = (c) => (ret += c + '\r\n')

function getChild(level) {
  switch (level) {
    case 0:
      return 'city'
    case 1:
      return 'region'
  }
  return 'data'
}

//2.内容
let datas = res.data
let queue = []

queue.push({level: -1, data: res})

while (queue.length != 0) {
  let {level, data} = queue.shift()
  if (level >= 0) {
    let p = data
    let cs = (p[getChild(level)] || []).map((it) => it.id)
    let csStr = cs.length != 0 ? cs.join('+') + '+' : 0
    let row = `${p.id},${p.name},${p.letter},${p.region_code},${p.short},${
      p.level
    },${p.parent},${p.level - 1},${csStr}`
    appOneRow(row)
  }
  let child = data[getChild(level)]
  if (child && child.length > 0) {
    for (const item of child) {
      queue.push({level: level + 1, data: item})
    }
  }
}

while (queue.length != 0) {
  let row = queue.shift()
  appOneRow(row)
}

//3.写入
const filePath = path.resolve(__dirname, './city.csv')
fs.writeFileSync(filePath, ret, {encoding: 'utf8'})
