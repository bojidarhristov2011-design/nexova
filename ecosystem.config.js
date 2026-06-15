module.exports = {
  apps: [{
    name: 'nexova',
    script: 'node_modules/next/dist/bin/next',
    args: 'dev',
    cwd: 'C:/Users/x/nexova',
    interpreter: 'C:/Users/x/tools/node-v22.16.0-win-x64/node.exe',
    env: {
      NODE_ENV: 'development',
    },
    watch: false,
    autorestart: true,
    max_restarts: 10,
  }]
}
