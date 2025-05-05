module.exports = {
  presets: ['babel-preset-expo', '@babel/preset-flow'],
  plugins: [
    ['@babel/plugin-transform-modules-commonjs'], // ES modül sorunlarını çözmek için
    //['module-resolver', {
     // alias: {
      //  '^@react-native-firebase/app$': '@react-native-firebase/app/lib/common/index.js',
    //    '^@react-native-firebase/storage$': '@react-native-firebase/storage/lib/index.js'
     // }
   // }]
  ]
};