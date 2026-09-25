module.exports = function override(config, env) {
    const fileLoaderRule = config.module.rules.find((rule) =>
        rule.oneOf
    );

    if (fileLoaderRule) {
        fileLoaderRule.oneOf.unshift({
            test: /\.txt$/,
            type: 'asset/source',
        });
    }

    return config;
};