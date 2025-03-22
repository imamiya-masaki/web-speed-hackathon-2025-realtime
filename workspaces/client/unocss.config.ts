// uno.config.js
import { defineConfig, presetWind3, presetIcons } from 'unocss'
// import presetIcons from '@unocss/preset-icons'
// JSON ファイルを ESM で読み込む場合、assert { type: 'json' } を利用します
// import biJson from '@iconify/json/json/bi.json' assert { type: 'json' }
// import bxJson from '@iconify/json/json/bx.json' assert { type: 'json' }
// import faRegularJson from '@iconify/json/json/fa-regular.json' assert { type: 'json' }
// import faSolidJson from '@iconify/json/json/fa-solid.json' assert { type: 'json' }
// import fluentJson from '@iconify/json/json/fluent.json' assert { type: 'json' }
// import lineMdJson from '@iconify/json/json/line-md.json' assert { type: 'json' }
// import materialSymbolsJson from '@iconify/json/json/material-symbols.json' assert { type: 'json' }
console.log('unocss.config.js')

const presetWind3Object = presetWind3()
console.log('presetWind3Object', presetWind3Object)
export default defineConfig({
  layers: {
    default: 1,
    icons: 0,
    preflights: 0,
    reset: -1,
  },
  preflights: [
    // {
    //   // Tailwind互換リセットCSSをビルド時に取り込む（動的インポートを利用）
    //   getCSS: () => `
    //   a,hr{color:inherit}progress,sub,sup{vertical-align:baseline}blockquote,body,dd,dl,fieldset,figure,h1,h2,h3,h4,h5,h6,hr,menu,ol,p,pre,ul{margin:0}dialog,fieldset,legend,menu,ol,ul{padding:0}*,::after,::before{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color,#e5e7eb)}:host,html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{line-height:inherit}hr{height:0;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}menu,ol,ul{list-style:none}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}
    //   `,
    //   layer: 'reset',
    // },
    {
      // グローバルなスタイル
      getCSS: () => `
        @view-transition {
          navigation: auto;
        }
        html,
        :host {
          font-family: 'Noto Sans JP', sans-serif !important;
        }
        video {
          max-height: 100%;
          max-width: 100%;
        }
      `,
    },
    {
      // キーフレーム定義
      getCSS: () => `
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `,
    },
  ],
  presets: [
  {...presetWind3Object, preflights: []},
  presetIcons({
    collections: {
      // bi: () => import('@iconify/json/json/bi.json').then((m) => m.default),
      // bx: () => import('@iconify/json/json/bx.json').then((m) => m.default),
      // 'fa-regular': () =>
      //   import('@iconify/json/json/fa-regular.json').then((m) => m.default ),
      // 'fa-solid': () =>
      //   import('@iconify/json/json/fa-solid.json').then((m) => m.default ),
      // fluent: () => import('@iconify/json/json/fluent.json').then((m) => m.default),
      // 'line-md': () =>
      //   import('@iconify/json/json/line-md.json').then((m) => m.default ),
      // 'material-symbols': () =>
      //   import('@iconify/json/json/material-symbols.json').then((m) => m.default ),
    },
  }),
  ],
})
