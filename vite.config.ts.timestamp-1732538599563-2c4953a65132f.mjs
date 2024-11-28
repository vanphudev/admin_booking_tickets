// vite.config.ts
import path from "path";
import react from "file:///E:/HK7/DO_AN_2024/do_an/frontend_admin_booking_tickets/admin_booking_tickets/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { visualizer } from "file:///E:/HK7/DO_AN_2024/do_an/frontend_admin_booking_tickets/admin_booking_tickets/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { defineConfig, loadEnv } from "file:///E:/HK7/DO_AN_2024/do_an/frontend_admin_booking_tickets/admin_booking_tickets/node_modules/vite/dist/node/index.js";
import { createSvgIconsPlugin } from "file:///E:/HK7/DO_AN_2024/do_an/frontend_admin_booking_tickets/admin_booking_tickets/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import tsconfigPaths from "file:///E:/HK7/DO_AN_2024/do_an/frontend_admin_booking_tickets/admin_booking_tickets/node_modules/vite-tsconfig-paths/dist/index.js";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_APP_BASE_PATH || "/";
  const isProduction = mode === "production";
  return {
    base,
    plugins: [
      react(),
      tsconfigPaths(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
        symbolId: "icon-[dir]-[name]"
      }),
      isProduction && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true
      })
    ],
    server: {
      open: true,
      host: true,
      port: 8801,
      proxy: {
        "/api": {
          target: "http://localhost:8801",
          changeOrigin: true,
          rewrite: (path2) => path2.replace(/^\/api/, "")
        }
      }
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom", "antd"]
    },
    esbuild: {
      drop: isProduction ? ["console", "debugger"] : []
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      sourcemap: false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1e3,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-antd": ["antd", "@ant-design/icons", "@ant-design/cssinjs"],
            "vendor-charts": ["apexcharts", "react-apexcharts"],
            "vendor-utils": ["axios", "dayjs", "i18next", "zustand"],
            "vendor-ui": ["framer-motion", "styled-components", "@iconify/react"]
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxISzdcXFxcRE9fQU5fMjAyNFxcXFxkb19hblxcXFxmcm9udGVuZF9hZG1pbl9ib29raW5nX3RpY2tldHNcXFxcYWRtaW5fYm9va2luZ190aWNrZXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxISzdcXFxcRE9fQU5fMjAyNFxcXFxkb19hblxcXFxmcm9udGVuZF9hZG1pbl9ib29raW5nX3RpY2tldHNcXFxcYWRtaW5fYm9va2luZ190aWNrZXRzXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9ISzcvRE9fQU5fMjAyNC9kb19hbi9mcm9udGVuZF9hZG1pbl9ib29raW5nX3RpY2tldHMvYWRtaW5fYm9va2luZ190aWNrZXRzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJztcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB7IGNyZWF0ZVN2Z0ljb25zUGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4tc3ZnLWljb25zJztcclxuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xyXG4gICBjb25zdCBiYXNlID0gZW52LlZJVEVfQVBQX0JBU0VfUEFUSCB8fCAnLyc7XHJcbiAgIGNvbnN0IGlzUHJvZHVjdGlvbiA9IG1vZGUgPT09ICdwcm9kdWN0aW9uJztcclxuXHJcbiAgIHJldHVybiB7XHJcbiAgICAgIGJhc2UsXHJcbiAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICAgcmVhY3QoKSxcclxuICAgICAgICAgdHNjb25maWdQYXRocygpLFxyXG4gICAgICAgICBjcmVhdGVTdmdJY29uc1BsdWdpbih7XHJcbiAgICAgICAgICAgIGljb25EaXJzOiBbcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdzcmMvYXNzZXRzL2ljb25zJyldLFxyXG4gICAgICAgICAgICBzeW1ib2xJZDogJ2ljb24tW2Rpcl0tW25hbWVdJyxcclxuICAgICAgICAgfSksXHJcbiAgICAgICAgIGlzUHJvZHVjdGlvbiAmJlxyXG4gICAgICAgICAgICB2aXN1YWxpemVyKHtcclxuICAgICAgICAgICAgICAgb3BlbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgZ3ppcFNpemU6IHRydWUsXHJcbiAgICAgICAgICAgICAgIGJyb3RsaVNpemU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICBdLFxyXG4gICAgICBzZXJ2ZXI6IHtcclxuICAgICAgICAgb3BlbjogdHJ1ZSxcclxuICAgICAgICAgaG9zdDogdHJ1ZSxcclxuICAgICAgICAgcG9ydDogODgwMSxcclxuICAgICAgICAgcHJveHk6IHtcclxuICAgICAgICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODgwMScsXHJcbiAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcnKSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgICAgIGluY2x1ZGU6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nLCAnYW50ZCddLFxyXG4gICAgICB9LFxyXG4gICAgICBlc2J1aWxkOiB7XHJcbiAgICAgICAgIGRyb3A6IGlzUHJvZHVjdGlvbiA/IFsnY29uc29sZScsICdkZWJ1Z2dlciddIDogW10sXHJcbiAgICAgIH0sXHJcbiAgICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgIHRhcmdldDogJ2VzbmV4dCcsXHJcbiAgICAgICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxyXG4gICAgICAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgICAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXHJcbiAgICAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAgICAgICAgICd2ZW5kb3ItcmVhY3QnOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXHJcbiAgICAgICAgICAgICAgICAgICd2ZW5kb3ItYW50ZCc6IFsnYW50ZCcsICdAYW50LWRlc2lnbi9pY29ucycsICdAYW50LWRlc2lnbi9jc3NpbmpzJ10sXHJcbiAgICAgICAgICAgICAgICAgICd2ZW5kb3ItY2hhcnRzJzogWydhcGV4Y2hhcnRzJywgJ3JlYWN0LWFwZXhjaGFydHMnXSxcclxuICAgICAgICAgICAgICAgICAgJ3ZlbmRvci11dGlscyc6IFsnYXhpb3MnLCAnZGF5anMnLCAnaTE4bmV4dCcsICd6dXN0YW5kJ10sXHJcbiAgICAgICAgICAgICAgICAgICd2ZW5kb3ItdWknOiBbJ2ZyYW1lci1tb3Rpb24nLCAnc3R5bGVkLWNvbXBvbmVudHMnLCAnQGljb25pZnkvcmVhY3QnXSxcclxuICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa2EsT0FBTyxVQUFVO0FBRW5iLE9BQU8sV0FBVztBQUNsQixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLGNBQWMsZUFBZTtBQUN0QyxTQUFTLDRCQUE0QjtBQUNyQyxPQUFPLG1CQUFtQjtBQUUxQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN2QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0MsUUFBTSxPQUFPLElBQUksc0JBQXNCO0FBQ3ZDLFFBQU0sZUFBZSxTQUFTO0FBRTlCLFNBQU87QUFBQSxJQUNKO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxxQkFBcUI7QUFBQSxRQUNsQixVQUFVLENBQUMsS0FBSyxRQUFRLFFBQVEsSUFBSSxHQUFHLGtCQUFrQixDQUFDO0FBQUEsUUFDMUQsVUFBVTtBQUFBLE1BQ2IsQ0FBQztBQUFBLE1BQ0QsZ0JBQ0csV0FBVztBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sVUFBVTtBQUFBLFFBQ1YsWUFBWTtBQUFBLE1BQ2YsQ0FBQztBQUFBLElBQ1A7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNMLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNKLFFBQVE7QUFBQSxVQUNMLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLFFBQy9DO0FBQUEsTUFDSDtBQUFBLElBQ0g7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNYLFNBQVMsQ0FBQyxTQUFTLGFBQWEsb0JBQW9CLE1BQU07QUFBQSxJQUM3RDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ04sTUFBTSxlQUFlLENBQUMsV0FBVyxVQUFVLElBQUksQ0FBQztBQUFBLElBQ25EO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDSixRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsTUFDWCxjQUFjO0FBQUEsTUFDZCx1QkFBdUI7QUFBQSxNQUN2QixlQUFlO0FBQUEsUUFDWixRQUFRO0FBQUEsVUFDTCxjQUFjO0FBQUEsWUFDWCxnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsWUFDekQsZUFBZSxDQUFDLFFBQVEscUJBQXFCLHFCQUFxQjtBQUFBLFlBQ2xFLGlCQUFpQixDQUFDLGNBQWMsa0JBQWtCO0FBQUEsWUFDbEQsZ0JBQWdCLENBQUMsU0FBUyxTQUFTLFdBQVcsU0FBUztBQUFBLFlBQ3ZELGFBQWEsQ0FBQyxpQkFBaUIscUJBQXFCLGdCQUFnQjtBQUFBLFVBQ3ZFO0FBQUEsUUFDSDtBQUFBLE1BQ0g7QUFBQSxJQUNIO0FBQUEsRUFDSDtBQUNILENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiXQp9Cg==
