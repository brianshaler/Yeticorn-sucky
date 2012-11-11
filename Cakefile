fs = require 'fs'

{print} = require 'sys'
{spawn} = require 'child_process'

runCoffee = (args, callback) ->
  coffee = spawn 'coffee', args
  coffee.stderr.on 'data', (data) ->
    process.stderr.write data.toString()
  coffee.stdout.on 'data', (data) ->
    print data.toString()
  coffee.on 'exit', (code) ->
    callback?() if code is 0

task 'build', 'Build lib/ from src/', ->
  runCoffee ['-c', '-o', 'lib', 'src']
  runCoffee ['-c', '-o', 'lib/db', 'src/db']
  runCoffee ['-c', '-o', 'lib/models', 'app/models']

task 'watch', 'Build lib/ from src/ and watch', ->
  runCoffee ['-w', '-c', '-o', 'lib', 'src']
  runCoffee ['-w', '-c', '-o', 'lib/db', 'src/db']
  runCoffee ['-w', '-c', '-o', 'lib/models', 'app/models']