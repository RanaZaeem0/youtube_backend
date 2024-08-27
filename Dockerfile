FROM node:20-alpine

WORKDIR /app

# Copy only package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .


EXPOSE 3000

# Use a non-root user (optional)
USER node

CMD [ "npm", "run", "start" ]
