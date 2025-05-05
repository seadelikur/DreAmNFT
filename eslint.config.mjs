// eslint.config.mjs (Önceki Çalışan ve Kapsamlı Versiyon)

import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
// import reactNative from "eslint-plugin-react-native"; // React Native eklentisi (henüz yorumlu)

export default [
  // 1. Genel Yapılandırma (Tüm .js, .jsx dosyaları için)
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module", // Varsayılan ES Modül, ama globaller CommonJS'i de destekleyecek
      globals: {
        ...globals.browser, // Tarayıcı ortamı
        ...globals.commonjs, // CommonJS globalleri (require vb. içerir)
        process: "readonly", // process globali
        // React Native globalleri buraya eklenebilir (React Native aktifleşince)
        // __DEV__: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true // JSX'i etkinleştir
        }
      },
    },
    plugins: {
      react: pluginReact // React eklentisini tanımla
    },
    rules: {
      // Temel JS kuralları
      ...js.configs.recommended.rules,
      // React kuralları
      ...pluginReact.configs.recommended.rules,
      // Prop types kuralını şimdilik kapat
      "react/prop-types": "off",
      // Diğer kural özelleştirmeleri buraya eklenebilir
      "no-unused-vars": "warn", // Kullanılmayan değişkenleri hata yerine uyarı yapabiliriz (isteğe bağlı)
      "no-undef": "warn" // Tanımsız değişkenleri hata yerine uyarı yapabiliriz (isteğe bağlı)
    },
    settings: {
      react: {
        version: "detect" // React versiyonunu otomatik algıla
      }
    },
    ignores: [ // Lintlenmeyecek dosya ve klasörler
      "node_modules/",
      "android/",
      "ios/",
      ".expo/",
      "dist/",
      "eslint.config.mjs", // Kendisini lintlemesin
      // Config dosyaları aşağıdaki özel blokta ele alındığı için burada ignore ediliyor
      "babel.config.js",
      "metro.config.js",
      "*.config.js"
    ]
  },

  // 2. Yapılandırma Dosyaları İçin Özel Ayarlar (.config.js)
  {
    files: ["*.config.js", "babel.config.js", "metro.config.js"],
    languageOptions: {
      sourceType: "commonjs", // Bu dosyaların CommonJS olduğunu belirtir
      globals: {
        ...globals.node, // Node.js ortamı globalleri (require, module, __dirname vb. içerir)
        process: "readonly",
      }
    },
    plugins: {}, // Bu dosyalarda React eklentisine gerek yok
    rules: {
      // Temel JS kuralları geçerli olsun
      ...js.configs.recommended.rules,
      // React ile ilgili kuralları bu dosyalar için kapat
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      // Gerekirse diğer kuralları da kapatabilirsiniz
    }
  },

  // 3. React Native Kuralları (Hala Yorumlu - ileride etkinleştirilebilir)
  // {
  //   files: ["**/*.{js,jsx}"], // Belki sadece component/screen dosyaları?
  //   plugins: {
  //    "react-native": reactNative
  //   },
  //   languageOptions: {
  //    globals: {
  //    __DEV__: "readonly"
  //    }
  //   },
  //   rules: {
  //    // ...reactNative.configs.recommended.rules, // Hata veriyordu, manuel eklemek gerekebilir
  //   }
  // },
];