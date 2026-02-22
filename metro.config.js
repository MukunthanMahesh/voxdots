const { getDefaultConfig } = require("expo/metro-config");

/** @type {import("metro-config").ConfigT} */
const config = getDefaultConfig(__dirname);

// Enable SVGs to be imported as React components
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg",
);
config.resolver.sourceExts.push("svg");
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer",
);

module.exports = config;

