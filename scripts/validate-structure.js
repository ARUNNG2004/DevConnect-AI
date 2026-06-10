import fs from "fs";

const required = [
  "app",
  "components",
  "context",
  "lib"
];

let hasError = false;

required.forEach((folder) => {
  if (!fs.existsSync(folder)) {
    console.error(`Missing folder: ${folder}`);
    hasError = true;
  }
});

if (hasError) {
  process.exit(1);
}

console.log("Folder structure valid");
