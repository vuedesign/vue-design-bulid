#!/usr/bin/env node

const path = require('path');
const os = require('os');
const program = require('commander');
const { spawn } = require('child_process');

program
    .version(require('../package').version)
    .usage('<command> [options]');


const [, , ...args] = process.argv;
const cwd = process.env.INIT_CWD;
spawn('node', ['../../../bin/webpack-dev-server.js', ...args], {
  cwd,
  stdio: 'inherit',
});