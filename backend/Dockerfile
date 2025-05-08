FROM node:20.19.0-alpine

WORKDIR /app

#copy required files for dependencies install
COPY package*.json ./
COPY tsconfig.json ./

#install dependencies
RUN npm install --ignore-scripts

#copy source-code
COPY . .

#compile TypeScript code
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]