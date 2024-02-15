const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const fs = require('fs')

if (!fs.existsSync(path.join(__dirname, 'public'))) {
    const indexDefaultData = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Globe ThreeJs</title>
</head>
<body>
    
</body>
</html>`
    fs.mkdirSync(path.join(__dirname, 'public'))
    fs.writeFileSync(`${path.join(__dirname, 'public')}/index.html`, indexDefaultData)
}

module.exports = {
    entry: {
        app: `${path.join(__dirname, 'src')}/index.ts`
    },
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.ts/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.glsl$|\.frag$|\.vert$|\.txt$/i,
                use: 'raw-loader'
            }
        ]
    },
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        hot: true,
        historyApiFallback: true
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': path.join(__dirname, 'src')
        }
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: `${path.join(__dirname, 'public')}/index.html`,
            scriptLoading: 'defer'
        }),
    ]
}