# Base image
FROM node:20-alpine AS development

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (with legacy-peer-deps to handle NestJS version conflicts)
RUN npm install --legacy-peer-deps

# Copy application source
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Set node environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
# Using npm install instead of npm ci since lock file may be out of sync
RUN npm install --omit=dev --legacy-peer-deps

# Copy built application from development stage
COPY --from=development /usr/src/app/dist ./dist

# Copy necessary files
COPY --from=development /usr/src/app/.env* ./

# Start the server using production build
CMD ["node", "dist/main"]

# Expose the port the app runs on
EXPOSE 4000