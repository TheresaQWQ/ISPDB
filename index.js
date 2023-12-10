const child_process = require("child_process");
const fs = require("fs")

const exec = cmd => {
  const p = child_process.spawnSync('/bin/sh', ['-c', cmd])
  return p.stdout.toString().trim()
}

const exportWithFilter = filter => {
  const cmd = `birdc show route where ${filter}`

  console.log(`exec -> ${cmd}`)

  const ipList = exec(cmd).split("\n").slice(2).filter(line => !line.startsWith("    ")).map(line => line.split(/\s+/)[0])

  return ipList.filter(Boolean)
}

const exportTargetASN = asn => exportWithFilter(`bgp_path.last = ${asn}`)

const ispList = {
  "中国电信(国内)": [4134, 4812, 4809, 140083, 140056, 58461, 58519, 4816, 4835, 138169, 135089, 139767, 140053, 59265, 134425, 58518, 58517],
  "中国电信(海外)": [23764, 136167, 63527, 64079, 44218],
  "中国联通(国内)": [4837, 4808, 17621, 9929, 136958, 17622, 17623, 138421, 133119, 134542, 10206, 17816, 135061, 136959, 133118, 137539, 134543],
  "中国联通(海外)": [10099, 197407, 132281],
  "中国移动(国内)": [9808, 56048, 56046, 56041, 141425, 56042, 56044, 134810, 132510, 56047, 135054, 24400, 56040, 24444, 24445, 24547, 132525],
  "中国移动(海外)": [58453, 58807, 9231, 268862, 137872, 209141, 141419, 139619, 149967, 328787, 132389],
  "中国铁通": [24138, 9394, 38370, 45057],
  "教育网": [7497], // as block AS143674 - AS144185
}

for (const name in ispList) {
  const asnList = ispList[name]

  for (const asn of asnList) {
    const start = Date.now()
    console.log(`exporting ${name}/${asn}...`)
    const ip = exportTargetASN(asn)
    const path = `./data/${name}`

    try {
      fs.mkdirSync(path)
    } catch (e) {}
    fs.writeFileSync(`${path}/${asn}.txt`, ip.join("\n"))
    console.log(`took ${((Date.now() - start)/1e3).toFixed(3)}s`)
  }
}
