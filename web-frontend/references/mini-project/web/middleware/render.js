function renderMiddleware(fixedVars = {}) {
    return (req, res, next) => {
        res.templateRender = (view, templateVars = {}) => {
            const mergedVars = {
                ...fixedVars,
                ...templateVars,
            };

            for (const [key, value] of Object.entries(mergedVars)) {
                if (value === undefined) {
                    delete mergedVars[key];
                }
            }

            res.render(view, {
                ...mergedVars,
                'template-vars': `<script id="template-vars" type="application/json">${JSON.stringify(mergedVars)}</script>`,
            });
        };

        next();
    };
}

export { renderMiddleware };