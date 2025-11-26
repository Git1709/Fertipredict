# backend/Dockerfile
FROM node:18-alpine

# Install security updates
RUN apk update && apk upgrade

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 5000

# Use node directly instead of npm for better signal handling
CMD ["node", "src/server.js"]