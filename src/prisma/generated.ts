export const PrismaEffect = new Proxy({}, {
  get() {
    throw new Error(
      'PrismaEffect is not generated from prisma schema. Please check your prisma schema to make sure it uses "pothos-plugin-effect" generator. ',
    );
  },
});
