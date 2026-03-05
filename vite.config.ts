import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    server: {
        host: "0.0.0.0",
        port: 5173,
        allowedHosts: ["hub.vcore.dev"]
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // React core — rarely changes, caches well
                    if (id.includes('node_modules/react/') ||
                        id.includes('node_modules/react-dom/') ||
                        id.includes('node_modules/react-router')) {
                        return 'vendor-react';
                    }
                    // Monaco Editor — huge, only used in vision-bot
                    if (id.includes('node_modules/monaco-editor') ||
                        id.includes('node_modules/@monaco-editor')) {
                        return 'vendor-editor';
                    }
                    // Charts — only used on dashboard
                    if (id.includes('node_modules/recharts') ||
                        id.includes('node_modules/d3-')) {
                        return 'vendor-charts';
                    }
                    // Rich text editor — only used in knowledge
                    if (id.includes('node_modules/@tiptap') ||
                        id.includes('node_modules/prosemirror')) {
                        return 'vendor-tiptap';
                    }
                    // DnD — only used in boards
                    if (id.includes('node_modules/@dnd-kit')) {
                        return 'vendor-dnd';
                    }
                    // UI libs
                    if (id.includes('node_modules/react-aria') ||
                        id.includes('node_modules/@react-aria') ||
                        id.includes('node_modules/@internationalized') ||
                        id.includes('node_modules/@react-stately')) {
                        return 'vendor-ui';
                    }
                    // Motion/animation
                    if (id.includes('node_modules/motion') ||
                        id.includes('node_modules/framer-motion')) {
                        return 'vendor-motion';
                    }
                },
            },
        },
    },
})

