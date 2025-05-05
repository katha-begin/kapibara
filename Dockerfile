# Use a base image that includes both Node.js and Python
FROM node:latest as build

# Set the working directory
WORKDIR /app

# Create data directory to prevent cache errors
RUN mkdir -p /app/data /app/src/data /app/public

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React frontend
RUN npm run build

# Use a smaller image for the final stage
# FROM python:latest as runtime

# Use the same Node.js image for the final stage to have npm available
FROM node:latest as runtime

# Install Python and pandas using apt
RUN apt-get update && \
    apt-get install -y python3 python3-pandas && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Create data directory in runtime image
RUN mkdir -p /app/data /app/src/data

# Copy built frontend and backend files from the build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/data ./data


# Expose the port
EXPOSE 3000

# Set the command to start the Node.js backend
CMD ["npm", "start"]
