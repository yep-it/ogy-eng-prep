import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
    root: '.',
    plugins: [viteSingleFile()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        open: true,
    }
});
