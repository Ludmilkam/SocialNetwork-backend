#! /bin/bash

read -p "name: " app_name
echo "Creating app with name=$app_name"

mkdir src/$app_name;
cd src/$app_name;
touch handlers.ts router.ts repositories.ts services.ts schemas.ts

