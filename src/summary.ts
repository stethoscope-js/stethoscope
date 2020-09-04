import "./common";
import { config } from "@anandchowdhary/cosmic";
import { join } from "path";
import { readdir, lstatSync } from "fs-extra";
import { write } from "./common";
import recursiveReaddir from "recursive-readdir";
import dayjs from "dayjs";

export const summary = async () => {
  // Generate health summaries
  const healthCategories = await readdir(join(".", "data", "health"));
};

summary();

// const apiSummary = async () => {
//   const dataTypes = (await readdir(join(".", "data"))).filter((i) =>
//     lstatSync(join(".", "data", i)).isDirectory()
//   );
//   for await (const type of dataTypes) {
//     const services = (await readdir(join(".", "data", type))).filter((i) =>
//       lstatSync(join(".", "data", type, i)).isDirectory()
//     );
//     for await (const service of services) {
//       const durations = (
//         await readdir(join(".", "data", type, service))
//       ).filter(
//         (i) =>
//           lstatSync(join(".", "data", type, service, i)).isDirectory() &&
//           i !== "api"
//       );
//       for await (const duration of durations) {
//         let data: any = {};
//         (await recursiveReaddir(join(".", "data", type, service, duration)))
//           .sort((a, b) =>
//             a.localeCompare(b, undefined, {
//               numeric: true,
//               sensitivity: "base",
//             })
//           )
//           .filter((item) => !item.endsWith(".DS_Store"))
//           .forEach((item) => {
//             const fullPath = item.split(
//               join(".", "data", type, service, duration)
//             )[1];
//             const fileName = fullPath.split("/").pop();
//             const directory = fullPath
//               .split(`/${fullPath.split("/").splice(-1, 1).join("/")}`)[0]
//               .substring(1);
//             let title = directory;
//             if (duration === "daily") {
//               title = dayjs(title).format("MMMM DD, YYYY");
//             } else if (duration === "monthly") {
//               title = dayjs(`${title.split("/").join("-")}-10`).format(
//                 "MMMM YYYY"
//               );
//             } else if (duration === "weekly") {
//               title = `Week ${title.split("/")[1]}, ${title.split("/")[0]}`;
//             }
//             if (fileName) {
//               data[fileName] = data[fileName] ?? [];
//               data[fileName].push({
//                 title,
//                 directory,
//               });
//             }
//           });
//         await write(
//           join(".", "data", type, service, "api", `${duration}.json`),
//           JSON.stringify(data, null, 2)
//         );
//       }
//     }
//   }
// };
