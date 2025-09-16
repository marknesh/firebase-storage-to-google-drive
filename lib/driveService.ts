import { drive_v3, google } from "googleapis";
import { Readable } from "node:stream";
import { config } from "../config";
import { extractError } from "../utils/errors";
import {
  checkIfUseSharedDrive,
  getFileName,
  useSharedDrive,
} from "../utils/util";
import { Auth } from "./auth";

export class DriveClient {
  private drive: null | drive_v3.Drive = null;
  constructor(private auth: Auth) {}

  async initDrive() {
    if (!this.drive) {
      try {
        const jwtClient = await this.auth.getJWTClient();
        this.drive = google.drive({
          version: "v3",
          auth: jwtClient,
        });
      } catch (error) {
        const message = extractError(error);
        throw new Error(message);
      }
    }
    return this.drive;
  }

  /**
   * Example: Get storage quota
   */
  async getStorageQuota() {
    const drive = await this.initDrive();
    try {
      const res = await drive.about.get({
        fields: "storageQuota",
      });

      return res.data.storageQuota;
    } catch (error) {
      const message = extractError(error);
      throw new Error(message);
    }
  }

  async listFiles(queryParts: string) {
    checkIfUseSharedDrive();

    let pageToken: string | undefined;
    let files = [];
    try {
      const drive = await this.initDrive();
      const baseOptions: any = {
        q: queryParts,
        fields:
          "files(id, name, mimeType, parents, md5Checksum, appProperties),nextPageToken",
        pageToken,
      };

      if (useSharedDrive) {
        Object.assign(baseOptions, {
          corpora: "drive",
          driveId: config.sharedDriveId,
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
        });
      }

      do {
        const res = await drive.files.list({ ...baseOptions, pageToken });
        if (res.data.files?.length) {
          files.push(...res.data.files);
        }

        pageToken = res.data.nextPageToken || undefined;
      } while (pageToken);

      return files;
    } catch (error) {
      const message = extractError(error);
      throw new Error(message);
    }
  }

  /**
   * Create a folder or file in Drive.
   * Supports both user Drive and Shared Drives.
   */
  async createFile(options: {
    name: string;
    parentId: string; // parent folder
    dataStream?: Readable;
    mimeType?: string;
    filePath?: string; // optional app property
  }) {
    checkIfUseSharedDrive();

    const drive = await this.initDrive();

    const { name, mimeType, parentId, filePath, dataStream } = options;

    const request: drive_v3.Params$Resource$Files$Create = {
      fields: "id, name, parents",
      requestBody: {
        name,
        mimeType: mimeType || undefined,
        parents: [parentId],
        appProperties: filePath ? { fullFilePath: filePath } : undefined,
      },
      supportsAllDrives: useSharedDrive,
    };

    if (dataStream) {
      Object.assign(request, {
        media: {
          body: Readable.from(dataStream),
        },
      });
    }

    try {
      const res = await drive.files.create(request);
      console.log("file created " + res.data.name);
      return res.data; // { id, name, parents }
    } catch (error) {
      const message = extractError(error);
      throw new Error(message);
    }
  }

  /**
   * Update a folder or file in Drive.
   * Supports both user Drive and Shared Drives.
   */
  async updateFile(options: {
    name: string;
    fileId: string;
    dataStream: Readable;
    filePath?: string; // optional app property
  }) {
    checkIfUseSharedDrive();
    const drive = await this.initDrive();

    const { name, fileId, filePath, dataStream } = options;

    const request: drive_v3.Params$Resource$Files$Update = {
      fileId,
      media: {
        body: Readable.from(dataStream),
      },
      requestBody: {
        name: getFileName(name),
        appProperties: filePath ? { fullFilePath: filePath } : undefined,
      },
      supportsAllDrives: useSharedDrive ? true : false,
    };

    if (dataStream) {
      Object.assign(request, {
        media: {
          body: Readable.from(dataStream),
        },
      });
    }

    try {
      const res = await drive.files.update(request);
      console.log("file updated" + res.data.name);
      return res.data; // { id, name, parents }
    } catch (error) {
      const message = extractError(error);
      throw new Error(message);
    }
  }

  /**
   * Create a permission on a file or folder.
   * @param fileId The Drive file/folder ID
   * @param emailAddress The user email to grant permissions to
   * @param role Access role (reader | writer | commenter | organizer | fileOrganizer | owner)
   */
  public async createPermission(
    fileId: string,
    emailAddress: string,
    role:
      | "reader"
      | "writer"
      | "commenter"
      | "organizer"
      | "fileOrganizer"
      | "owner"
  ) {
    const drive = await this.initDrive();

    try {
      await drive.permissions.create({
        fileId,
        sendNotificationEmail: false, // avoids sending Google email
        fields: "id",
        requestBody: {
          type: "user",
          role,
          emailAddress,
        },
      });
    } catch (error) {
      const message = extractError(error);
      throw new Error(message);
    }
  }

  async deleteFile(fileId: string) {
    const drive = await this.initDrive();

    await drive.files
      .delete({
        fileId,
        supportsAllDrives: useSharedDrive,
      })
      .catch((error) => {
        const message = extractError(error);
        throw new Error(message);
      });
  }

  async deleteFilesRecursively(query: string): Promise<void> {
    checkIfUseSharedDrive();
    const files = await this.listFiles(query);

    if (!files || files.length === 0) {
      console.log("No files found for query:", query);
      return;
    }

    for (const file of files) {
      if (!file.id) continue;

      if (file.mimeType === "application/vnd.google-apps.folder") {
        // Recursively delete folder contents
        await this.deleteFilesRecursively(
          `'${file.id}' in parents and trashed = false`
        );
        if (file.id === config.folderId) continue;
      }

      await this.deleteFile(file.id);
    }
  }
}
