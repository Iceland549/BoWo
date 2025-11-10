# Étape 1 : Build & publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["ContentMicroservice.csproj", "./"]
RUN dotnet restore "ContentMicroservice.csproj"

COPY . .
RUN dotnet publish "ContentMicroservice.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Étape 2 : Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

EXPOSE 5002

ENTRYPOINT ["dotnet", "ContentMicroservice.dll"]
