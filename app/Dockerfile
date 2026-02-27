# Étape 1 : Construction du site web
FROM node:20-alpine AS build
WORKDIR /app

# Copier les fichiers de configuration et installer les paquets
COPY package*.json ./
RUN npm install

# Copier le reste du code de l'application
COPY . .

# Exporter le projet React Native pour le Web (crée un dossier /dist)
RUN npx expo export -p web

# Étape 2 : Serveur web Nginx léger pour héberger les fichiers
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]