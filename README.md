# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Regula SDK setup
- Add License in the .env file
- You will have to convert the .license file to base64
- For face capture to work, need a local docker container with valid license, also allow CORS for testing.
`docker run -p 41101:41101 -v ~/regula.license:/app/extBin/unix/regula.license -e CORS_ALLOWED_ORIGINS="*" regulaforensics/face-api:latest`
