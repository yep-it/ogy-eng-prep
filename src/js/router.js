/**
 * Simple Hash Router
 */
export const Router = {
    routes: {},

    init(routes) {
        this.routes = routes;
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute(); // Handle initial load
    },

    handleRoute() {
        const hash = window.location.hash || '#/';
        const [path, query] = hash.split('?');

        // Find matching route
        // Support simple /lesson/:id style matching manually if needed, 
        // but for now let's stick to simple paths and parse params from hash manually in components if needed
        // Or simple regex match

        let match = null;
        for (const routePath in this.routes) {
            // Convert /lesson/:id to regex
            const regexPath = routePath.replace(/:\w+/g, '([^/]+)');
            const regex = new RegExp(`^#${regexPath}$`);
            const found = path.match(regex);

            if (found) {
                const params = found.slice(1);
                this.routes[routePath](...params);
                match = true;
                break;
            }
        }

        if (!match && this.routes['*']) {
            this.routes['*']();
        }
    },

    navigate(path) {
        window.location.hash = path;
    }
};
