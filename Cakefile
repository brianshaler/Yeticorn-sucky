fs = require 'fs'

{print} = require 'sys'
{spawn} = require 'child_process'

build = (watch, callback) ->
  args = ['-c', '-o', 'lib', 'src']
  args.unshift '-w' if watch
  coffee = spawn 'coffee', args
  coffee.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  coffee.stdout.on 'data', (data) ->
    print data.toString()
  coffee.on 'exit', (code) ->
    callback?() if code is 0

task 'build', 'Build lib/ from src/', ->
  build(false)

task 'watch', 'Build lib/ from src/ and watch', ->
  build(true)