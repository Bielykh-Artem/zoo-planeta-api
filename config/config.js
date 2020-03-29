require('dotenv').config()

const _ = require('lodash')

const NODE_PORT = process.env.PORT || 4000

const config = {
  development: {
    config_id: 'development',
    app_name: 'zoo-planeta-api',
    node_port: NODE_PORT,
    // db_url: 'mongodb://localhost:27017/admin',
    db_url: process.env.MONGODB_URI,
  },
  release: {
    config_id: 'release',
    node_port: NODE_PORT,
    db_url: process.env.MONGODB_URI,
  },
  production: {
    config_id: 'production',
    node_port: NODE_PORT,
    db_url: process.env.MONGODB_URI,
  },
}

const defaultConfig = config.development
const environment = process.env.NODE_ENV
const environmentConfig = config[environment]
const finalConfig = _.merge(defaultConfig, environmentConfig)

global.gConfig = finalConfig
