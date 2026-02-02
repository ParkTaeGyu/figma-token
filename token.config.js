const StyleDictionary = require("style-dictionary");
const iosColorSetAction = require("./actions/ios-color-set.js");

module.exports = {
  source: ["token.build.json"],
    // ✅ v4: hooks 사용
  hooks: {
    actions: {
      "ios/generate-colorsets": iosColorSetAction
    }
  },
  platforms: {
    scss: {
      transformGroup: "scss",
      buildPath: "build/scss/",
      files: [
        { destination: "_variables.scss", format: "scss/variables" }
      ]
    },
    
    android: {
      transformGroup: "android",
      buildPath: "build/android/",
      files: [
        { destination: "font_dimens.xml", format: "android/fontDimens" },
        { destination: "colors.xml", format: "android/colors" }
      ]
    },
    
    compose: {
      transformGroup: "compose",
      buildPath: "build/compose/",
      files: [
        {
          destination: "StyleDictionaryColor.kt",
          format: "compose/object",
          options: {
            className: "StyleDictionaryColor",
            packageName: "StyleDictionaryColor"
          },
          filter: token => token.type === "color"
        }
      ]
    },
    
    // ✅ iOS Color Sets - Action 사용
    "ios-color-set": {
      transformGroup: "css",
      buildPath: "build/ios/Assets.xcassets/",
      files: [], // ✅ 빈 배열 추가
      actions: ["ios/generate-colorsets"], // format 대신 actions 사용
      // files 배열 제거 - action이 직접 파일 생성
    },
  }
};