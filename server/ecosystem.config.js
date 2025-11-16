module.exports = {
  apps: [
    {
      name: "HomeSage",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
