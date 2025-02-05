module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['next/babel', { 'preset-env': { modules: 'commonjs' } }]
  ],
  plugins: [
    '@babel/plugin-transform-modules-commonjs'
  ]
}; 