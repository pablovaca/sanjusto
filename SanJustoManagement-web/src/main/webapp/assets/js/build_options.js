
({
    baseUrl: "./",
    mainConfigFile: 'require_config.js',
    out: "../../../../../../target/sanjusto/assets/js/main.min.js",
    paths: {
      requireLib: './libs/require'
    },
    include: 'requireLib',
    findNestedDependencies: true,
    preserveLicenseComments: false
})
