export const getFileName = (filePath: string) => {
  const slashesCount = (filePath.match(/\//g) || []).length;

  if (slashesCount > 0) {
    const secondLastSlashIndex = filePath.lastIndexOf("/");

    const name = filePath.slice(secondLastSlashIndex + 1);

    return name;
  } else {
    return filePath;
  }
};
