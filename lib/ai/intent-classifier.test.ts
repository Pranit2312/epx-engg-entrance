import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyIntent } from './intent-classifier'

test('classifies greetings without analytics intent', () => {
  assert.equal(classifyIntent('hello there'), 'greeting')
})

test('classifies study plan requests', () => {
  assert.equal(classifyIntent('Give me a study plan for JEE Main'), 'study-plan')
})

test('classifies performance asks', () => {
  assert.equal(classifyIntent('How am I performing this month?'), 'overall-performance-analysis')
})
