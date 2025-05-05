# Use a base image that includes both Node.js and Python
FROM node:latest as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React frontend
RUN npm run build

# Use a smaller image for the final stage
FROM python:latest as runtime

# Install Python dependencies
RUN pip install pandas

# Set the working directory
WORKDIR /app

# Copy built frontend and backend files from the build stage
COPY --from=build /app/build ./build
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