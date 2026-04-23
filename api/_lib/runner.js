'use strict';

require('./bootstrap');
const path = require('path');
const CommandStrategy = require('@strategies/CommandStrategy');

function captureConsole() {
  const stdout = [];
  const stderr = [];
  const origLog = console.log;
  const origErr = console.error;

  console.log = (...args) => stdout.push(args.map(stringify).join(' '));
  console.error = (...args) => stderr.push(args.map(stringify).join(' '));

  return {
    stdout,
    stderr,
    restore() {
      console.log = origLog;
      console.error = origErr;
    },
  };
}

function stringify(value) {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.message;
  try {
    return String(value);
  } catch {
    return '[unserializable]';
  }
}

function run(command, args, cwd) {
  const strategy = CommandStrategy[command];
  if (!strategy) {
    const available = Object.keys(CommandStrategy).join(', ');
    return {
      ok: false,
      stdout: '',
      stderr: `mini-git: '${command}'은(는) 깃 명령이 아닙니다.\n사용 가능한 명령어: ${available}`,
    };
  }

  const capture = captureConsole();
  const originalCwd = process.cwd();

  try {
    process.chdir(cwd);
    const gitDir = path.join(cwd, '.mini-git');
    strategy.run(Array.isArray(args) ? args : [], gitDir);
  } catch (err) {
    capture.stderr.push(stringify(err));
  } finally {
    capture.restore();
    try {
      process.chdir(originalCwd);
    } catch {
      /* cwd may have been removed by caller — safe to ignore */
    }
  }

  return {
    ok: capture.stderr.length === 0,
    stdout: capture.stdout.join('\n'),
    stderr: capture.stderr.join('\n'),
  };
}

module.exports = { run };
