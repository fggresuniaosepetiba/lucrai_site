FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY ["src/Lucrai.API/Lucrai.API.csproj", "src/Lucrai.API/"]
COPY ["src/Lucrai.Core/Lucrai.Core.csproj", "src/Lucrai.Core/"]
COPY ["src/Lucrai.Infrastructure/Lucrai.Infrastructure.csproj", "src/Lucrai.Infrastructure/"]
RUN dotnet restore "src/Lucrai.API/Lucrai.API.csproj"

COPY . .
WORKDIR "/src/src/Lucrai.API"
RUN dotnet publish "Lucrai.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Lucrai.API.dll"]
