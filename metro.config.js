const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Désactiver les node polyfills qui causent le problème sur Windows
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
