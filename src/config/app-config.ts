import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Sona Chandi tracks",
  version: packageJson.version,
  copyright: `© ${currentYear}, Er. A. K. Gupta. All rights reserved.`,
  meta: {
    title: "Sona Chandi tracks - Smart Gold & Silver Accounting Software",
    description:
      "Sona Chandi tracks is a modern, secure, and easy-to-use digital accounting tool for managing your customers' gold and silver transactions. Built with Next.js 15, Tailwind CSS v4, and shadcn/ui. Ideal for jewelers and local businesses who want to digitize and simplify their hisaab-kitab.",
  },
};
