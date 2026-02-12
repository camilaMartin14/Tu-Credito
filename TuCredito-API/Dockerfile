# Use the official .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:10.0-noble AS build
WORKDIR /src

# Copy the project file and restore dependencies
COPY ["TuCredito.csproj", "./"]
RUN dotnet restore "TuCredito.csproj"

# Copy the rest of the source code
COPY . .

# Build the application
RUN dotnet build "TuCredito.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "TuCredito.csproj" -c Release -o /app/publish

# Use the official .NET runtime image for the final stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose the port the app runs on (Render uses PORT env var, defaults to 8080 usually, but we expose 80)
EXPOSE 80
EXPOSE 443

# Set the entry point
ENTRYPOINT ["dotnet", "TuCredito.dll"]
