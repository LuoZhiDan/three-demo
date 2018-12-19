var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        libs: './libs/index.js',
        zdPlugin: './index.js'
    },
    devServer: {
        contentBase: './dist',
        // host: "10.0.3.114",
        port: 9099,
        hot: true,
        open: true
    },
    module: {
        rules:[{
            test: /\.(png|jpg|gif|webp)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 5*1024*1024,
                    mimetype: 'image/png'
                }
            }]
        }]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    /* resolve: {
        alias: {
            utils: 'common-utils-zdluoa',
            config: __dirname + '/src/config',
            cmp: __dirname + '/src/components',
            img: __dirname + '/src/public/img',
            mock: __dirname + '/src/public/mock',
            svg: __dirname + '/src/public/svg'
        }
    }, */
    output: {
        path: __dirname + '/dist',
        filename: '[name].[hash].js',
    }
};
