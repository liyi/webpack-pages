const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const config = require('./pages.config.js')

module.exports = (env, argv) => {

  const debug = argv.mode === 'development'

  let entry = {}
  config.forEach(v => {
    entry[v.name] = v.entry
    console.log('*', v.title, v.name, v.entry)
  })

  return {
    entry,
    output: {
      path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json']
    },
    module: {
      rules: [
        {
          test: /\.art$/,
          loader: "art-template-loader",
          options: {
            // art-template options (if necessary)
            // @see https://github.com/aui/art-template
            debug
          }
        },
        {
          test: /\.(c|sa|sc)ss$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                sourceMap: debug
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                sourceMap: debug,
                plugins: loader => [
                  require('autoprefixer')(),
                  require('cssnano')()
                ]
              }
            },
            {
              loader: 'sass-loader',
              options: {
                implementation: require('sass'),
                sourceMap: debug,
                sassOptions: {
                  outputStyle: debug ? 'expanded' : 'compressed'
                }
              }
            }
          ]
        },
        {
          test: /\.jsx?$/i,
          include: [path.resolve('src')],
          use: [
            {
              loader: 'babel-loader',
              options: {
                sourceMaps: debug,
                presets: ['@babel/preset-env'],
                plugins: [
                  ['@babel/plugin-transform-react-jsx']
                ]
              }
            },
            {
              loader: 'eslint-loader',
              options: {
                root: true,
                useEslintrc: false,
                baseConfig: {
                  extends: ['standard', 'plugin:react/recommended'],
                  settings: {
                    react: {
                      version: '*'
                    }
                  }
                },
                parser: 'babel-eslint',
                parserOptions: {
                  sourceType: 'module'
                },
                formatter: require('eslint-friendly-formatter'),
                env: {
                  browser: true
                },
                rules: {
                  'prefer-const': 'off',
                  'react/react-in-jsx-scope': 'off',
                  'no-unused-vars': 'warn',
                  'eol-last': 'warn',
                  'new-cap': 'off'
                }
              }
            }
          ]
        },
        {
          test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: undefined,
                name: '[name].[hash:6].[ext]',
                outputPath: ''
              }
            }
          ]
        }
      ]
    },
    plugins: [
      ...(debug ? [
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, 'index.html'),
          filename: 'index.html',
          title: '目录',
          minify: false,
          inject: false,
          chunks: [],
          cache: false,
          links: config.map(v => ({ title: v.title, href: v.name + '.html' }))
        })
      ] : []),
      ...config.map(v => new HtmlWebpackPlugin({
        template: v.template || path.resolve(__dirname, 'template.html'),
        filename: v.name + '.html',
        title: v.title,
        inlineSource: '\.(js|css)$',
        inject: 'body',
        minify: {
          removeComments: !debug,
          collapseWhitespace: !debug,
          minifyCSS: !debug,
          minifyJS: !debug
        },
        chunks: [v.name],
        chunksSortMode: 'none',
        cache: false
      })),
      new HtmlWebpackInlineSourcePlugin()
    ],
    devServer: {
      contentBase: path.resolve(__dirname, 'src'),
      host: '0.0.0.0',
      port: 8090,
      stats: {
        children: false,
        modules: false
      }
    },
    stats: {
      children: false,
      modules: false
    }
  }

}
