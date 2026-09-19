'use strict'

const test = require('node:test')
const assert = require('node:assert')

const pino = require('../')

test('child custom levels preserve parent custom levels', () => {
  const lines = []
  const destination = {
    write (line) {
      lines.push(line)
    }
  }
  const logger = pino({ customLevels: { foo: 35 }, level: 'foo' }, destination)

  const child = logger.child({ component: 'child' }, {
    customLevels: { bar: 45 }
  })

  assert.equal(child.levels.values.foo, 35)
  assert.equal(child.levels.labels[35], 'foo')
  assert.equal(child.levels.values.bar, 45)
  assert.equal(child.levels.labels[45], 'bar')

  child.bar('child bar')
  child.foo('child foo')

  const records = lines.map(JSON.parse)
  assert.deepEqual(records.map(record => [record.level, record.msg]), [
    [45, 'child bar'],
    [35, 'child foo']
  ])
  assert.deepEqual(records.map(record => record.component), ['child', 'child'])
})

test('grandchild custom levels preserve levels from both ancestors', () => {
  const lines = []
  const destination = {
    write (line) {
      lines.push(line)
    }
  }
  const logger = pino({ customLevels: { foo: 35 }, level: 'foo' }, destination)
  const child = logger.child({}, { customLevels: { bar: 45 } })
  const grandchild = child.child({}, { customLevels: { baz: 55 } })

  assert.equal(grandchild.levels.values.foo, 35)
  assert.equal(grandchild.levels.values.bar, 45)
  assert.equal(grandchild.levels.values.baz, 55)

  grandchild.baz('grandchild baz')
  grandchild.bar('grandchild bar')
  grandchild.foo('grandchild foo')

  const records = lines.map(JSON.parse)
  assert.deepEqual(records.map(record => record.level), [55, 45, 35])
})
