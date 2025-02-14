#!/bin/bash

# Install dependencies listed in dependencies.txt
echo "Installing dependencies from dependencies.txt..."

while IFS= read -r dependency
do
  npm install "$dependency"
done < dependencies.txt

echo "All dependencies have been installed!"
