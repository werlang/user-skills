class TemplateVar {
    static vars = {};
    static built = false;

    static build() {
        const script = document.querySelector('#template-vars');
        if (!script) {
            return;
        }

        try {
            TemplateVar.vars = JSON.parse(script.textContent || '{}');
        }
        catch (error) {
            console.error('Failed to parse template vars.', error);
            TemplateVar.vars = {};
        }

        script.remove();
        TemplateVar.built = true;
    }

    static get(key) {
        if (!TemplateVar.built) {
            TemplateVar.build();
        }

        return key ? TemplateVar.vars[key] : TemplateVar.vars;
    }
}

export { TemplateVar };