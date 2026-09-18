// 复现：父 logger 有自定义级别时，子 logger 再加一个新级别，child() 直接抛「未知级别」
const pino = require('../')
const out = []
const dest = { write (s) { out.push(s) } }

const log = pino({ customLevels: { foo: 35 }, level: 'foo' }, dest)
log.info('父级用 foo 正常')

try {
  const child = log.child({}, { customLevels: { bar: 45 } })
  console.log('child() 没抛')
  child.bar('子级 bar')
  child.foo('子级用父的 foo')
  console.log('child.level =', child.level)
} catch (e) {
  console.log('child() 抛 =', e.message)
}
out.forEach(l => {
  let ok = true; let lv = null
  try { lv = JSON.parse(l).level } catch (e) { ok = false }
  console.log('可解析 =', ok, 'level =', lv, ok ? '' : l.slice(0, 60))
})
