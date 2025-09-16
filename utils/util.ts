import { config } from "../config";
import { Auth } from "../lib/auth";
import { DriveClient } from "../lib/driveService";

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

export const checkIfUseSharedDrive = () => {
  if (config.useSharedDrive === "true" && !config.sharedDriveId) {
    throw new Error("Please enter the shared drive id");
  }
};

export const useSharedDrive = config.useSharedDrive === "true";

export const driveClient = new DriveClient(new Auth());
